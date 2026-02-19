import { AsyncJobQueue } from '@/modules/async-jobs/application/ports/AsyncJobQueue';
import { COMPLETED_TASKS_REPORT_JOB } from '@/modules/async-jobs/domain/AsyncJobTypes';
import { EnqueueCompletedTasksReportCommand } from '@/modules/async-jobs/application/commands/enqueue-completed-report/EnqueueCompletedTasksReportCommand';
import { Result } from '@/shared/core/result';

export class EnqueueCompletedTasksReportCommandHandler {
  constructor(private readonly asyncJobQueue: AsyncJobQueue) {}

  async execute(
    command: EnqueueCompletedTasksReportCommand,
  ): Promise<Result<string, Error>> {
    const jobIdResult = await this.asyncJobQueue.enqueue({
      type: COMPLETED_TASKS_REPORT_JOB,
      payload: {
        requestedBy: command.requestedBy,
        requestedAt: new Date().toISOString(),
      },
      runAt: new Date(),
    });
    if (!jobIdResult.ok) return Result.fail(jobIdResult.error);

    return Result.ok(jobIdResult.value);
  }
}
