import { DATABASE_DB } from '@/bootstrap/database/DatabaseModule';
import {
  SQS_CLIENT,
  SQS_QUEUE_NAME,
} from '@/modules/notification/infrastructure/providers/SqsProviderTokens';
import { ASYNC_JOBS_SQS_QUEUE_NAME } from '@/modules/async-jobs/infrastructure/queue/sqs/AsyncJobsSqsTokens';
import { GetQueueUrlCommand, SQSClient } from '@aws-sdk/client-sqs';
import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Db } from 'mongodb';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_DB) private readonly db: Db,
    @Inject(SQS_CLIENT) private readonly sqsClient: SQSClient,
    @Inject(SQS_QUEUE_NAME) private readonly taskEventsQueueName: string,
    @Inject(ASYNC_JOBS_SQS_QUEUE_NAME)
    private readonly asyncJobsQueueName: string,
  ) {}

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    try {
      await this.db.command({ ping: 1 });
      await this.sqsClient.send(
        new GetQueueUrlCommand({ QueueName: this.taskEventsQueueName }),
      );
      await this.sqsClient.send(
        new GetQueueUrlCommand({ QueueName: this.asyncJobsQueueName }),
      );
      return { status: 'ready' };
    } catch (error) {
      throw new ServiceUnavailableException(
        (error as Error).message || 'Dependency not ready',
      );
    }
  }
}
