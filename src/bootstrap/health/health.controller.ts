import { DATABASE_DB } from '@/bootstrap/database/DatabaseModule';
import { SQS_CLIENT } from '@/modules/notification/infrastructure/providers/SqsProviderTokens';
import { ASYNC_JOBS_SQS_QUEUE_NAME } from '@/modules/async-jobs/infrastructure/queue/sqs/AsyncJobsSqsTokens';
import {
  SNS_CLIENT,
  SNS_TOPIC_NAME,
} from '@/modules/notification/infrastructure/providers/SnsProviderTokens';
import { GetQueueUrlCommand, SQSClient } from '@aws-sdk/client-sqs';
import { CreateTopicCommand, SNSClient } from '@aws-sdk/client-sns';
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
    @Inject(SNS_CLIENT) private readonly snsClient: SNSClient,
    @Inject(SNS_TOPIC_NAME) private readonly taskEventsTopicName: string,
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
        new GetQueueUrlCommand({ QueueName: this.asyncJobsQueueName }),
      );
      await this.snsClient.send(
        new CreateTopicCommand({ Name: this.taskEventsTopicName }),
      );
      return { status: 'ready' };
    } catch (error) {
      throw new ServiceUnavailableException(
        (error as Error).message || 'Dependency not ready',
      );
    }
  }
}
