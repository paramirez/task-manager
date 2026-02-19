import { DATABASE_DATASOURCE } from '@/bootstrap/database/DatabaseModule';
import {
  SQS_CLIENT,
  SQS_QUEUE_NAME,
} from '@/modules/notification/infrastructure/providers/SqsProviderTokens';
import { GetQueueUrlCommand, SQSClient } from '@aws-sdk/client-sqs';
import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_DATASOURCE) private readonly dataSource: DataSource,
    @Inject(SQS_CLIENT) private readonly sqsClient: SQSClient,
    @Inject(SQS_QUEUE_NAME) private readonly queueName: string,
  ) {}

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    try {
      await this.dataSource.query('SELECT 1');
      await this.sqsClient.send(
        new GetQueueUrlCommand({ QueueName: this.queueName }),
      );
      return { status: 'ready' };
    } catch (error) {
      throw new ServiceUnavailableException(
        (error as Error).message || 'Dependency not ready',
      );
    }
  }
}
