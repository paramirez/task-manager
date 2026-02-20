import {
  TaskEventMessage,
  TaskEventPublisher,
} from '@/modules/notification/application/ports/TaskEventPublisher';
import { PromiseResult, Result } from '@/shared/core/result';
import {
  CreateTopicCommand,
  PublishCommand,
  SNSClient,
} from '@aws-sdk/client-sns';

export class SnsTaskEventPublisher implements TaskEventPublisher {
  private topicArn?: string;

  constructor(
    private readonly snsClient: SNSClient,
    private readonly topicName: string,
    topicArn?: string,
  ) {
    this.topicArn = topicArn;
  }

  async publish(event: TaskEventMessage): PromiseResult<void, Error> {
    try {
      const topicArnResult = await this.ensureTopicArn();
      if (!topicArnResult.ok) return Result.fail(topicArnResult.error);

      await this.snsClient.send(
        new PublishCommand({
          TopicArn: topicArnResult.value,
          Message: JSON.stringify({
            type: event.type,
            occurredAt: event.occurredAt,
            payload: event.payload,
          }),
        }),
      );

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private async ensureTopicArn(): PromiseResult<string, Error> {
    if (this.topicArn) return Result.ok(this.topicArn);

    try {
      const createResult = await this.snsClient.send(
        new CreateTopicCommand({ Name: this.topicName }),
      );
      if (!createResult.TopicArn) {
        return Result.fail(new Error('SNS_TOPIC_ARN_NOT_AVAILABLE'));
      }
      this.topicArn = createResult.TopicArn;
      return Result.ok(createResult.TopicArn);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
