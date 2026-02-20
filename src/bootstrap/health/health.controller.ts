import { DATABASE_DB } from '@/bootstrap/database/DatabaseModule';
import { SQS_CLIENT } from '@/modules/notification/infrastructure/providers/SqsProviderTokens';
import { ASYNC_JOBS_SQS_QUEUE_NAME } from '@/modules/async-jobs/infrastructure/queue/sqs/AsyncJobsSqsTokens';
import { GetQueueUrlCommand, SQSClient } from '@aws-sdk/client-sqs';
import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Db } from 'mongodb';
import {
  ApiProperty,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

class HealthStatusResponseDTO {
  @ApiProperty({ example: 'ok' })
  status!: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_DB) private readonly db: Db,
    @Inject(SQS_CLIENT) private readonly sqsClient: SQSClient,
    @Inject(ASYNC_JOBS_SQS_QUEUE_NAME)
    private readonly asyncJobsQueueName: string,
  ) {}

  @ApiOperation({ summary: 'Liveness probe' })
  @ApiOkResponse({ type: HealthStatusResponseDTO })
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @ApiOperation({ summary: 'Readiness probe' })
  @ApiOkResponse({ type: HealthStatusResponseDTO })
  @ApiServiceUnavailableResponse({
    description: 'Dependencias no disponibles',
  })
  @Get('ready')
  async ready() {
    try {
      await this.db.command({ ping: 1 });
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
