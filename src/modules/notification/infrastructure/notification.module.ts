import {
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { TASK_EVENT_PUBLISHER } from '@/modules/notification/application/ports/TaskEventPublisher';
import { TASK_REMINDER_NOTIFIER } from '@/modules/notification/application/ports/TaskReminderNotifier';
import { NoopTaskReminderNotifier } from '@/modules/notification/infrastructure/providers/NoopTaskReminderNotifier';
import { SQS_CLIENT } from '@/modules/notification/infrastructure/providers/SqsProviderTokens';
import {
  SNS_CLIENT,
  SNS_TOPIC_ARN,
  SNS_TOPIC_NAME,
} from '@/modules/notification/infrastructure/providers/SnsProviderTokens';
import { SnsTaskEventPublisher } from '@/modules/notification/infrastructure/providers/SnsTaskEventPublisher';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SNSClient } from '@aws-sdk/client-sns';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

@Injectable()
class AwsClientsShutdown implements OnApplicationShutdown {
  constructor(
    @Inject(SQS_CLIENT) private readonly sqsClient: SQSClient,
    @Inject(SNS_CLIENT) private readonly snsClient: SNSClient,
  ) {}

  onApplicationShutdown() {
    this.sqsClient.destroy();
    this.snsClient.destroy();
  }
}

@Module({
  providers: [
    {
      provide: SQS_CLIENT,
      useFactory() {
        return new SQSClient({
          region: required('AWS_REGION', 'us-east-1'),
          endpoint: required('SQS_ENDPOINT', process.env.AWS_ENDPOINT),
          credentials: {
            accessKeyId: required('AWS_ACCESS_KEY_ID'),
            secretAccessKey: required('AWS_SECRET_ACCESS_KEY'),
          },
        });
      },
    },
    {
      provide: SNS_CLIENT,
      useFactory() {
        return new SNSClient({
          region: required('AWS_REGION', 'us-east-1'),
          endpoint: required(
            'SNS_ENDPOINT',
            process.env.SQS_ENDPOINT ?? process.env.AWS_ENDPOINT,
          ),
          credentials: {
            accessKeyId: required('AWS_ACCESS_KEY_ID'),
            secretAccessKey: required('AWS_SECRET_ACCESS_KEY'),
          },
        });
      },
    },
    {
      provide: SNS_TOPIC_NAME,
      useFactory() {
        return required('SNS_TOPIC_NAME', 'task-events');
      },
    },
    {
      provide: SNS_TOPIC_ARN,
      useFactory() {
        return process.env.SNS_TOPIC_ARN;
      },
    },
    {
      provide: TASK_EVENT_PUBLISHER,
      useFactory(snsClient: SNSClient, topicName: string, topicArn?: string) {
        return new SnsTaskEventPublisher(snsClient, topicName, topicArn);
      },
      inject: [SNS_CLIENT, SNS_TOPIC_NAME, SNS_TOPIC_ARN],
    },
    {
      provide: TASK_REMINDER_NOTIFIER,
      useClass: NoopTaskReminderNotifier,
    },
    AwsClientsShutdown,
  ],
  exports: [
    TASK_EVENT_PUBLISHER,
    TASK_REMINDER_NOTIFIER,
    SQS_CLIENT,
    SNS_CLIENT,
    SNS_TOPIC_NAME,
    SNS_TOPIC_ARN,
  ],
})
export class NotificationModule {}
