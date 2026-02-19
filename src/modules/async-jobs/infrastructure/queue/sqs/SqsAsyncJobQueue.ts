import { AsyncJobQueue } from '@/modules/async-jobs/application/ports/AsyncJobQueue';
import {
  AsyncJob,
  EnqueueAsyncJobInput,
} from '@/modules/async-jobs/domain/AsyncJob';
import { PromiseResult, Result } from '@/shared/core/result';
import {
  ChangeMessageVisibilityCommand,
  CreateQueueCommand,
  DeleteMessageCommand,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

const SQS_MAX_DELAY_SECONDS = 900;

interface AsyncJobMessage {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  runAt: string;
  createdAt: string;
}

export class SqsAsyncJobQueue implements AsyncJobQueue {
  private queueUrl?: string;
  private readonly receiptHandlesByJobId = new Map<string, string>();

  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueName: string,
    queueUrl?: string,
  ) {
    this.queueUrl = queueUrl;
  }

  async enqueue(input: EnqueueAsyncJobInput): PromiseResult<string, Error> {
    try {
      const queueUrlResult = await this.ensureQueueUrl();
      if (!queueUrlResult.ok) return Result.fail(queueUrlResult.error);

      const now = new Date();
      const runAt = input.runAt ? new Date(input.runAt) : now;
      const delaySeconds = this.calculateDelaySeconds(now, runAt);
      const id = crypto.randomUUID();

      const message: AsyncJobMessage = {
        id,
        type: input.type,
        payload: input.payload,
        runAt: runAt.toISOString(),
        createdAt: now.toISOString(),
      };

      await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: queueUrlResult.value,
          MessageBody: JSON.stringify(message),
          DelaySeconds: delaySeconds,
        }),
      );

      return Result.ok(id);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async dequeueReady(
    limit: number,
    now: Date,
  ): PromiseResult<AsyncJob[], Error> {
    try {
      if (limit <= 0) return Result.ok([]);

      const queueUrlResult = await this.ensureQueueUrl();
      if (!queueUrlResult.ok) return Result.fail(queueUrlResult.error);

      const maxNumberOfMessages = Math.min(limit, 10);
      const receiveResult = await this.sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: queueUrlResult.value,
          MaxNumberOfMessages: maxNumberOfMessages,
          WaitTimeSeconds: 0,
          VisibilityTimeout: 60,
        }),
      );

      const messages = receiveResult.Messages ?? [];
      const readyJobs: AsyncJob[] = [];

      for (const message of messages) {
        if (!message.Body || !message.ReceiptHandle || !message.MessageId) {
          continue;
        }

        const parsedResult = this.parseMessageBody(message.Body);
        if (!parsedResult.ok) {
          await this.sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: queueUrlResult.value,
              ReceiptHandle: message.ReceiptHandle,
            }),
          );
          continue;
        }

        const parsed = parsedResult.value;
        const runAtDate = new Date(parsed.runAt);
        if (runAtDate.getTime() > now.getTime()) {
          const nextDelay = this.calculateDelaySeconds(now, runAtDate);
          await this.sqsClient.send(
            new ChangeMessageVisibilityCommand({
              QueueUrl: queueUrlResult.value,
              ReceiptHandle: message.ReceiptHandle,
              VisibilityTimeout: nextDelay,
            }),
          );
          continue;
        }

        this.receiptHandlesByJobId.set(parsed.id, message.ReceiptHandle);
        readyJobs.push({
          id: parsed.id,
          type: parsed.type,
          payload: parsed.payload,
          runAt: runAtDate,
          status: 'processing',
          createdAt: new Date(parsed.createdAt),
        });
      }

      return Result.ok(readyJobs);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async markCompleted(jobId: string): PromiseResult<void, Error> {
    return this.deleteMessageByJobId(jobId);
  }

  async markFailed(jobId: string, reason: string): PromiseResult<void, Error> {
    void reason;
    return this.deleteMessageByJobId(jobId);
  }

  private async deleteMessageByJobId(
    jobId: string,
  ): PromiseResult<void, Error> {
    try {
      const queueUrlResult = await this.ensureQueueUrl();
      if (!queueUrlResult.ok) return Result.fail(queueUrlResult.error);

      const receiptHandle = this.receiptHandlesByJobId.get(jobId);
      if (!receiptHandle)
        return Result.fail(new Error('JOB_RECEIPT_NOT_FOUND'));

      await this.sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrlResult.value,
          ReceiptHandle: receiptHandle,
        }),
      );
      this.receiptHandlesByJobId.delete(jobId);

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

  private parseMessageBody(body: string): Result<AsyncJobMessage, Error> {
    try {
      const parsed = JSON.parse(body) as Partial<AsyncJobMessage>;
      if (
        typeof parsed.id !== 'string' ||
        typeof parsed.type !== 'string' ||
        typeof parsed.runAt !== 'string' ||
        typeof parsed.createdAt !== 'string' ||
        typeof parsed.payload !== 'object' ||
        parsed.payload === null
      ) {
        return Result.fail(new Error('INVALID_ASYNC_JOB_MESSAGE'));
      }
      return Result.ok({
        id: parsed.id,
        type: parsed.type,
        payload: parsed.payload,
        runAt: parsed.runAt,
        createdAt: parsed.createdAt,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private calculateDelaySeconds(now: Date, runAt: Date): number {
    const raw = Math.ceil((runAt.getTime() - now.getTime()) / 1000);
    return Math.max(0, Math.min(raw, SQS_MAX_DELAY_SECONDS));
  }
}
