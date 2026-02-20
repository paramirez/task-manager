import { AsyncJobQueue } from '@/modules/async-jobs/application/ports/AsyncJobQueue';
import { TASK_DUE_DATE_REMINDER_JOB } from '@/modules/async-jobs/domain/AsyncJobTypes';
import { ScheduleTaskReminderCommand } from '@/modules/async-jobs/application/commands/schedule-task-reminder/ScheduleTaskReminderCommand';
import { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { Result } from '@/shared/core/result';

const DEFAULT_MINUTES_BEFORE_DUE_DATE = 60;

export class ScheduleTaskReminderCommandHandler {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly asyncJobQueue: AsyncJobQueue,
  ) {}

  async execute(
    command: ScheduleTaskReminderCommand,
  ): Promise<Result<string, Error>> {
    const taskResult = await this.taskRepository.findById(command.taskId);
    if (!taskResult.ok) return Result.fail(taskResult.error);
    if (!taskResult.value) return Result.fail(new Error('TASK_NOT_FOUND'));

    const task = taskResult.value;
    if (!task.dueDate) return Result.fail(new Error('TASK_DUE_DATE_REQUIRED'));

    const minutesBeforeDueDate =
      command.minutesBeforeDueDate ?? DEFAULT_MINUTES_BEFORE_DUE_DATE;
    if (minutesBeforeDueDate < 0) {
      return Result.fail(new Error('INVALID_MINUTES_BEFORE_DUE_DATE'));
    }

    const runAt = new Date(task.dueDate);
    runAt.setMinutes(runAt.getMinutes() - minutesBeforeDueDate);

    const jobIdResult = await this.asyncJobQueue.enqueue({
      type: TASK_DUE_DATE_REMINDER_JOB,
      payload: {
        taskId: task.id,
        title: task.title,
        dueDate: task.dueDate.toISOString(),
      },
      runAt,
    });
    if (!jobIdResult.ok) return Result.fail(jobIdResult.error);

    return Result.ok(jobIdResult.value);
  }
}
