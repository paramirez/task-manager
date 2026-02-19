import { Module } from '@nestjs/common';
import { AsyncJobsController } from '@/modules/async-jobs/infrastructure/http/controllers/AsyncJobsController';
import { ASYNC_JOB_QUEUE } from '@/modules/async-jobs/application/ports/AsyncJobQueue';
import { InMemoryAsyncJobQueue } from '@/modules/async-jobs/infrastructure/queue/inmemory/InMemoryAsyncJobQueue';

@Module({
  controllers: [AsyncJobsController],
  providers: [
    {
      provide: ASYNC_JOB_QUEUE,
      useClass: InMemoryAsyncJobQueue,
    },
  ],
  exports: [ASYNC_JOB_QUEUE],
})
export class AsyncJobsModule {}
