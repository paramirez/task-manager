import { TaskEventPublisher } from '@/modules/notification/application/ports/TaskEventPublisher';
import { Task } from '@/modules/task/domain/Task';
import { PromiseResult, Result } from '@/shared/core/result';
import {
  CreateQueueCommand,
  GetQueueUrlCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

export class SqsTaskEventPublisher implements TaskEventPublisher {
  private readonly sqsClient: SQSClient;
  private readonly queueName: string;
  private queueUrl?: string;

  constructor(sqsClient: SQSClient, queueName: string, queueUrl?: string) {
    this.sqsClient = sqsClient;
    this.queueName = queueName;
    this.queueUrl = queueUrl;
  }

  async publishTaskCreated(task: Task): PromiseResult<void, Error> {
    try {
      const queueUrlResult = await this.ensureQueueUrl();
      if (!queueUrlResult.ok) return Result.fail(queueUrlResult.error);

      await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: queueUrlResult.value,
          MessageBody: JSON.stringify({
            type: 'task.created',
            occurredAt: new Date().toISOString(),
            payload: task.toPrimitives(),
          }),
        }),
      );

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private async ensureQueueUrl(): PromiseResult<string, Error> {
    if (this.queueUrl) return Result.ok(this.queueUrl);

    try {
      const getResult = await this.sqsClient.send(
        new GetQueueUrlCommand({ QueueName: this.queueName }),
      );
      if (getResult.QueueUrl) {
        this.queueUrl = getResult.QueueUrl;
        return Result.ok(getResult.QueueUrl);
      }

      const createResult = await this.sqsClient.send(
        new CreateQueueCommand({ QueueName: this.queueName }),
      );
      if (!createResult.QueueUrl) {
        return Result.fail(new Error('SQS_QUEUE_URL_NOT_AVAILABLE'));
      }
      this.queueUrl = createResult.QueueUrl;
      return Result.ok(createResult.QueueUrl);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
