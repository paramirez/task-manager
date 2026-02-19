import { AsyncJob } from '@/modules/async-jobs/domain/AsyncJob';
import { AsyncJobQueue } from '@/modules/async-jobs/application/ports/AsyncJobQueue';
import { ProcessAsyncJobsCommand } from '@/modules/async-jobs/application/commands/process-async-jobs/ProcessAsyncJobsCommand';
import {
  COMPLETED_TASKS_REPORT_JOB,
  TASK_DUE_DATE_REMINDER_JOB,
} from '@/modules/async-jobs/domain/AsyncJobTypes';
import { TaskReminderNotifier } from '@/modules/notification/application/ports/TaskReminderNotifier';
import { CompletedTasksReport } from '@/modules/reporting/domain/CompletedTasksReport';
import { TaskReportRepository } from '@/modules/reporting/application/ports/TaskReportRepository';
import { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { Result } from '@/shared/core/result';

export interface ProcessAsyncJobsResult {
  dequeued: number;
  processed: number;
  failed: number;
}

export class ProcessAsyncJobsHandler {
  constructor(
    private readonly asyncJobQueue: AsyncJobQueue,
    private readonly taskRepository: TaskRepository,
    private readonly taskReportRepository: TaskReportRepository,
    private readonly taskReminderNotifier: TaskReminderNotifier,
  ) {}

  async execute(
    command: ProcessAsyncJobsCommand,
  ): Promise<Result<ProcessAsyncJobsResult, Error>> {
    const limit = command.limit ?? 20;
    if (limit <= 0) return Result.fail(new Error('INVALID_JOB_LIMIT'));

    const jobsResult = await this.asyncJobQueue.dequeueReady(limit, new Date());
    if (!jobsResult.ok) return Result.fail(jobsResult.error);

    let processed = 0;
    let failed = 0;

    for (const job of jobsResult.value) {
      const handleResult = await this.handleJob(job);
      if (!handleResult.ok) {
        const markFailedResult = await this.asyncJobQueue.markFailed(
          job.id,
          handleResult.error.message,
        );
        if (!markFailedResult.ok) return Result.fail(markFailedResult.error);
        failed += 1;
        continue;
      }

      const markCompletedResult = await this.asyncJobQueue.markCompleted(
        job.id,
      );
      if (!markCompletedResult.ok)
        return Result.fail(markCompletedResult.error);
      processed += 1;
    }

    return Result.ok({
      dequeued: jobsResult.value.length,
      processed,
      failed,
    });
  }

  private async handleJob(job: AsyncJob): Promise<Result<void, Error>> {
    if (job.type === TASK_DUE_DATE_REMINDER_JOB) {
      return this.handleDueDateReminder(job);
    }
    if (job.type === COMPLETED_TASKS_REPORT_JOB) {
      return this.handleCompletedTasksReport();
    }
    return Result.fail(new Error(`UNSUPPORTED_JOB_TYPE:${job.type}`));
  }

  private async handleDueDateReminder(
    job: AsyncJob,
  ): Promise<Result<void, Error>> {
    const taskId = job.payload.taskId;
    const title = job.payload.title;
    const dueDate = job.payload.dueDate;

    if (
      typeof taskId !== 'string' ||
      typeof title !== 'string' ||
      typeof dueDate !== 'string'
    ) {
      return Result.fail(new Error('INVALID_DUE_DATE_REMINDER_PAYLOAD'));
    }

    const notifyResult = await this.taskReminderNotifier.sendDueDateReminder({
      taskId,
      title,
      dueDateIso: dueDate,
    });
    if (!notifyResult.ok) return Result.fail(notifyResult.error);

    return Result.ok(undefined);
  }

  private async handleCompletedTasksReport(): Promise<Result<void, Error>> {
    const tasksResult = await this.taskRepository.findAll();
    if (!tasksResult.ok) return Result.fail(tasksResult.error);

    const completedTasks = tasksResult.value.filter(
      (task) => task.status === 'completed',
    ).length;

    const report: CompletedTasksReport = {
      id: crypto.randomUUID(),
      generatedAt: new Date(),
      completedTasks,
    };

    const saveResult =
      await this.taskReportRepository.saveCompletedReport(report);
    if (!saveResult.ok) return Result.fail(saveResult.error);

    return Result.ok(undefined);
  }
}
