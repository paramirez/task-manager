import {
  OnModuleDestroy,
  OnModuleInit,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SQS_CLIENT } from '@/modules/notification/infrastructure/providers/SqsProviderTokens';
import { SQSClient } from '@aws-sdk/client-sqs';
import {
  TASK_EVENTS_CONSUMER_SQS_QUEUE_NAME,
  TASK_EVENTS_CONSUMER_SQS_QUEUE_URL,
} from '@/modules/task-events-consumer/infrastructure/TaskEventsConsumerTokens';
import {
  CreateQueueCommand,
  DeleteMessageCommand,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
} from '@aws-sdk/client-sqs';
import { DATABASE_DB } from '@/bootstrap/database/DatabaseModule';
import { Db } from 'mongodb';
import { COMMAND_BUS } from '@/shared/cqrs/CqrsTypes';
import type { CommandBus } from '@/shared/cqrs/CqrsTypes';
import {
  ENQUEUE_COMPLETED_TASKS_REPORT_COMMAND,
  EnqueueCompletedTasksReportCommand,
} from '@/modules/async-jobs/application/commands/enqueue-completed-report/EnqueueCompletedTasksReportCommand';

interface TaskEventMessage {
  type: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

@Injectable()
export class TaskEventsSqsConsumerService
  implements OnModuleInit, OnModuleDestroy
{
  private running = false;
  private queueUrl?: string;

  constructor(
    @Inject(SQS_CLIENT) private readonly sqsClient: SQSClient,
    @Inject(TASK_EVENTS_CONSUMER_SQS_QUEUE_NAME)
    private readonly queueName: string,
    @Inject(TASK_EVENTS_CONSUMER_SQS_QUEUE_URL)
    queueUrl: string | undefined,
    @Inject(DATABASE_DB) private readonly db: Db,
    @Inject(COMMAND_BUS) private readonly commandBus: CommandBus,
  ) {
    this.queueUrl = queueUrl;
  }

  onModuleInit() {
    if (process.env.TASK_EVENTS_CONSUMER_ENABLED !== 'true') return;
    this.running = true;
    void this.pollLoop();
  }

  onModuleDestroy() {
    this.running = false;
  }

  private async pollLoop() {
    const pollWaitSeconds = Number(
      process.env.TASK_EVENTS_CONSUMER_WAIT_SECONDS ?? 10,
    );
    const visibilityTimeoutSeconds = Number(
      process.env.TASK_EVENTS_CONSUMER_VISIBILITY_SECONDS ?? 60,
    );
    while (this.running) {
      const queueUrl = await this.ensureQueueUrl();
      if (!queueUrl) {
        await this.sleep(2000);
        continue;
      }

      const received = await this.sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: pollWaitSeconds,
          VisibilityTimeout: visibilityTimeoutSeconds,
        }),
      );

      for (const message of received.Messages ?? []) {
        if (!message.MessageId || !message.ReceiptHandle || !message.Body) {
          continue;
        }

        const alreadyProcessed = await this.markMessageIfNew(message.MessageId);
        if (alreadyProcessed) {
          await this.ack(queueUrl, message.ReceiptHandle);
          continue;
        }

        const event = this.parseTaskEvent(message.Body);
        if (!event) {
          await this.ack(queueUrl, message.ReceiptHandle);
          continue;
        }

        const handled = await this.handleEvent(event);
        if (!handled) {
          continue;
        }

        await this.ack(queueUrl, message.ReceiptHandle);
      }
    }
  }

  private async ensureQueueUrl(): Promise<string | undefined> {
    if (this.queueUrl) return this.queueUrl;

    try {
      const getResult = await this.sqsClient.send(
        new GetQueueUrlCommand({ QueueName: this.queueName }),
      );
      if (getResult.QueueUrl) {
        this.queueUrl = getResult.QueueUrl;
        return getResult.QueueUrl;
      }

      const createResult = await this.sqsClient.send(
        new CreateQueueCommand({ QueueName: this.queueName }),
      );
      if (!createResult.QueueUrl) return undefined;
      this.queueUrl = createResult.QueueUrl;
      return createResult.QueueUrl;
    } catch {
      return undefined;
    }
  }

  private async markMessageIfNew(messageId: string): Promise<boolean> {
    const result = await this.db
      .collection('task_events_consumer_offsets')
      .updateOne(
        { messageId },
        {
          $setOnInsert: {
            messageId,
            processedAt: new Date(),
          },
        },
        { upsert: true },
      );
    return result.matchedCount > 0;
  }

  private parseTaskEvent(body: string): TaskEventMessage | undefined {
    try {
      const first = JSON.parse(body) as Record<string, unknown>;
      if (
        typeof first.Type === 'string' &&
        first.Type === 'Notification' &&
        typeof first.Message === 'string'
      ) {
        const nested = JSON.parse(first.Message) as Record<string, unknown>;
        if (
          typeof nested.type === 'string' &&
          typeof nested.occurredAt === 'string' &&
          typeof nested.payload === 'object' &&
          nested.payload !== null
        ) {
          return {
            type: nested.type,
            occurredAt: nested.occurredAt,
            payload: nested.payload as Record<string, unknown>,
          };
        }
        return undefined;
      }

      if (
        typeof first.type === 'string' &&
        typeof first.occurredAt === 'string' &&
        typeof first.payload === 'object' &&
        first.payload !== null
      ) {
        return {
          type: first.type,
          occurredAt: first.occurredAt,
          payload: first.payload as Record<string, unknown>,
        };
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  private async handleEvent(event: TaskEventMessage): Promise<boolean> {
    if (event.type === 'task.updated' && event.payload.status === 'completed') {
      const enqueueResult = await this.commandBus.execute<
        string,
        EnqueueCompletedTasksReportCommand
      >({
        kind: ENQUEUE_COMPLETED_TASKS_REPORT_COMMAND,
        requestedBy: 'task-events-consumer',
      });
      return enqueueResult.ok;
    }
    return true;
  }

  private async ack(queueUrl: string, receiptHandle: string) {
    await this.sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      }),
    );
  }

  private sleep(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms);
    });
  }
}
