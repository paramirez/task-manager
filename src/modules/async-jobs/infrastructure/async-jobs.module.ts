import { Module } from '@nestjs/common';
import { AsyncJobsController } from '@/modules/async-jobs/infrastructure/http/controllers/AsyncJobsController';
import { ASYNC_JOB_QUEUE } from '@/modules/async-jobs/application/ports/AsyncJobQueue';
import { NotificationModule } from '@/modules/notification/infrastructure/notification.module';
import { SQS_CLIENT } from '@/modules/notification/infrastructure/providers/SqsProviderTokens';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SqsAsyncJobQueue } from '@/modules/async-jobs/infrastructure/queue/sqs/SqsAsyncJobQueue';
import {
  ASYNC_JOBS_SQS_QUEUE_NAME,
  ASYNC_JOBS_SQS_QUEUE_URL,
} from '@/modules/async-jobs/infrastructure/queue/sqs/AsyncJobsSqsTokens';

@Module({
  imports: [NotificationModule],
  controllers: [AsyncJobsController],
  providers: [
    {
      provide: ASYNC_JOBS_SQS_QUEUE_NAME,
      useFactory() {
        return process.env.ASYNC_JOBS_SQS_QUEUE_NAME ?? 'async-jobs';
      },
    },
    {
      provide: ASYNC_JOBS_SQS_QUEUE_URL,
      useFactory() {
        return process.env.ASYNC_JOBS_SQS_QUEUE_URL;
      },
    },
    {
      provide: ASYNC_JOB_QUEUE,
      useFactory(sqsClient: SQSClient, queueName: string, queueUrl?: string) {
        return new SqsAsyncJobQueue(sqsClient, queueName, queueUrl);
      },
      inject: [SQS_CLIENT, ASYNC_JOBS_SQS_QUEUE_NAME, ASYNC_JOBS_SQS_QUEUE_URL],
    },
  ],
  exports: [ASYNC_JOB_QUEUE, ASYNC_JOBS_SQS_QUEUE_NAME],
})
export class AsyncJobsModule {}
