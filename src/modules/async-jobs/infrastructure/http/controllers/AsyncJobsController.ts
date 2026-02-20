import { ENQUEUE_COMPLETED_TASKS_REPORT_COMMAND } from '@/modules/async-jobs/application/commands/enqueue-completed-report/EnqueueCompletedTasksReportCommand';
import { EnqueueCompletedTasksReportCommand } from '@/modules/async-jobs/application/commands/enqueue-completed-report/EnqueueCompletedTasksReportCommand';
import { PROCESS_ASYNC_JOBS_COMMAND } from '@/modules/async-jobs/application/commands/process-async-jobs/ProcessAsyncJobsCommand';
import { ProcessAsyncJobsCommand } from '@/modules/async-jobs/application/commands/process-async-jobs/ProcessAsyncJobsCommand';
import { SCHEDULE_TASK_REMINDER_COMMAND } from '@/modules/async-jobs/application/commands/schedule-task-reminder/ScheduleTaskReminderCommand';
import { ScheduleTaskReminderCommand } from '@/modules/async-jobs/application/commands/schedule-task-reminder/ScheduleTaskReminderCommand';
import {
  EnqueueReportDto,
  ProcessJobsDto,
  ScheduleReminderDto,
} from '@/modules/async-jobs/infrastructure/http/dto/AsyncJobsDto';
import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { COMMAND_BUS } from '@/shared/cqrs/CqrsTypes';
import type { CommandBus } from '@/shared/cqrs/CqrsTypes';

@Controller({
  path: 'jobs',
  version: '1',
})
export class AsyncJobsController {
  constructor(@Inject(COMMAND_BUS) private readonly commandBus: CommandBus) {}

  @Post('task-reminders/:taskId')
  async scheduleTaskReminder(
    @Param('taskId') taskId: string,
    @Body() body: ScheduleReminderDto,
  ): Promise<{ jobId: string }> {
    const result = await this.commandBus.execute<
      string,
      ScheduleTaskReminderCommand
    >({
      kind: SCHEDULE_TASK_REMINDER_COMMAND,
      taskId,
      minutesBeforeDueDate: body.minutesBeforeDueDate,
    });
    if (!result.ok) throw result.error;
    return { jobId: result.value };
  }

  @Post('reports/completed-tasks')
  async enqueueCompletedTasksReport(
    @Body() body: EnqueueReportDto,
  ): Promise<{ jobId: string }> {
    const result = await this.commandBus.execute<
      string,
      EnqueueCompletedTasksReportCommand
    >({
      kind: ENQUEUE_COMPLETED_TASKS_REPORT_COMMAND,
      requestedBy: body.requestedBy,
    });
    if (!result.ok) throw result.error;
    return { jobId: result.value };
  }

  @Post('process')
  async processJobs(@Body() body: ProcessJobsDto) {
    const result = await this.commandBus.execute<
      {
        dequeued: number;
        processed: number;
        failed: number;
      },
      ProcessAsyncJobsCommand
    >({
      kind: PROCESS_ASYNC_JOBS_COMMAND,
      limit: body.limit,
    });
    if (!result.ok) throw result.error;
    return result.value;
  }
}
