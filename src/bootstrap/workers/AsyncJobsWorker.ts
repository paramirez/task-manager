import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { COMMAND_BUS } from '@/shared/cqrs/CqrsTypes';
import type { CommandBus } from '@/shared/cqrs/CqrsTypes';
import {
  PROCESS_ASYNC_JOBS_COMMAND,
  ProcessAsyncJobsCommand,
} from '@/modules/async-jobs/application/commands/process-async-jobs/ProcessAsyncJobsCommand';

@Injectable()
export class AsyncJobsWorker implements OnModuleInit, OnModuleDestroy {
  private running = false;

  constructor(@Inject(COMMAND_BUS) private readonly commandBus: CommandBus) {}

  onModuleInit() {
    if (process.env.WORKER_ENABLED !== 'true') return;
    this.running = true;
    void this.pollLoop();
  }

  onModuleDestroy() {
    this.running = false;
  }

  private async pollLoop() {
    const pollIntervalMs = Number(
      process.env.ASYNC_JOBS_POLL_INTERVAL_MS ?? 30000,
    );
    const batchSize = Number(process.env.ASYNC_JOBS_BATCH_SIZE ?? 10);

    while (this.running) {
      const processResult = await this.commandBus.execute<
        { dequeued: number; processed: number; failed: number },
        ProcessAsyncJobsCommand
      >({
        kind: PROCESS_ASYNC_JOBS_COMMAND,
        limit: batchSize,
      });
      if (!processResult.ok) {
        await this.sleep(pollIntervalMs);
        continue;
      }

      if (processResult.value.dequeued === 0) {
        await this.sleep(pollIntervalMs);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms);
    });
  }
}
