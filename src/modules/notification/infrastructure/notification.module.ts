import { Module } from '@nestjs/common';
import { TASK_EVENT_PUBLISHER } from '@/modules/notification/application/ports/TaskEventPublisher';
import { TASK_REMINDER_NOTIFIER } from '@/modules/notification/application/ports/TaskReminderNotifier';
import { NoopTaskReminderNotifier } from '@/modules/notification/infrastructure/providers/NoopTaskReminderNotifier';
import {
  SQS_CLIENT,
  SQS_QUEUE_NAME,
  SQS_QUEUE_URL,
} from '@/modules/notification/infrastructure/providers/SqsProviderTokens';
import { SqsTaskEventPublisher } from '@/modules/notification/infrastructure/providers/SqsTaskEventPublisher';
import { SQSClient } from '@aws-sdk/client-sqs';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

@Module({
  providers: [
    {
      provide: SQS_CLIENT,
      useFactory() {
        return new SQSClient({
          region: required('AWS_REGION', 'us-east-1'),
          endpoint: required('SQS_ENDPOINT'),
          credentials: {
            accessKeyId: required('AWS_ACCESS_KEY_ID'),
            secretAccessKey: required('AWS_SECRET_ACCESS_KEY'),
          },
        });
      },
    },
    {
      provide: SQS_QUEUE_NAME,
      useFactory() {
        return required('SQS_QUEUE_NAME', 'task-events');
      },
    },
    {
      provide: SQS_QUEUE_URL,
      useFactory() {
        return process.env.SQS_QUEUE_URL;
      },
    },
    {
      provide: TASK_EVENT_PUBLISHER,
      useFactory(sqsClient: SQSClient, queueName: string, queueUrl?: string) {
        return new SqsTaskEventPublisher(sqsClient, queueName, queueUrl);
      },
      inject: [SQS_CLIENT, SQS_QUEUE_NAME, SQS_QUEUE_URL],
    },
    {
      provide: TASK_REMINDER_NOTIFIER,
      useClass: NoopTaskReminderNotifier,
    },
  ],
  exports: [
    TASK_EVENT_PUBLISHER,
    TASK_REMINDER_NOTIFIER,
    SQS_CLIENT,
    SQS_QUEUE_NAME,
    SQS_QUEUE_URL,
  ],
})
export class NotificationModule {}
