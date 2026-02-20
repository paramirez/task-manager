import { ENQUEUE_COMPLETED_TASKS_REPORT_COMMAND } from '@/modules/async-jobs/application/commands/enqueue-completed-report/EnqueueCompletedTasksReportCommand';
import { EnqueueCompletedTasksReportCommand } from '@/modules/async-jobs/application/commands/enqueue-completed-report/EnqueueCompletedTasksReportCommand';
import { PROCESS_ASYNC_JOBS_COMMAND } from '@/modules/async-jobs/application/commands/process-async-jobs/ProcessAsyncJobsCommand';
import { ProcessAsyncJobsCommand } from '@/modules/async-jobs/application/commands/process-async-jobs/ProcessAsyncJobsCommand';
import { SCHEDULE_TASK_REMINDER_COMMAND } from '@/modules/async-jobs/application/commands/schedule-task-reminder/ScheduleTaskReminderCommand';
import { ScheduleTaskReminderCommand } from '@/modules/async-jobs/application/commands/schedule-task-reminder/ScheduleTaskReminderCommand';
import {
  EnqueueReportDto,
  JobIdResponseDto,
  ProcessJobsResponseDto,
  ProcessJobsDto,
  ScheduleReminderDto,
} from '@/modules/async-jobs/infrastructure/http/dto/AsyncJobsDto';
import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { COMMAND_BUS } from '@/shared/cqrs/CqrsTypes';
import type { CommandBus } from '@/shared/cqrs/CqrsTypes';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller({
  path: 'jobs',
  version: '1',
})
export class AsyncJobsController {
  constructor(@Inject(COMMAND_BUS) private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Programar recordatorio asíncrono por taskId' })
  @ApiCreatedResponse({ type: JobIdResponseDto })
  @Post('task-reminders/:taskId')
  async scheduleTaskReminder(
    @Param('taskId') taskId: string,
    @Body() body: ScheduleReminderDto,
  ): Promise<JobIdResponseDto> {
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

  @ApiOperation({ summary: 'Encolar reporte de tareas completadas' })
  @ApiCreatedResponse({ type: JobIdResponseDto })
  @Post('reports/completed-tasks')
  async enqueueCompletedTasksReport(
    @Body() body: EnqueueReportDto,
  ): Promise<JobIdResponseDto> {
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

  @ApiOperation({ summary: 'Procesar jobs listos en cola' })
  @ApiCreatedResponse({ type: ProcessJobsResponseDto })
  @Post('process')
  async processJobs(
    @Body() body: ProcessJobsDto,
  ): Promise<ProcessJobsResponseDto> {
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
