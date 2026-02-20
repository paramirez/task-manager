import {
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { TASK_REMINDER_NOTIFIER } from '@/modules/notification/application/ports/TaskReminderNotifier';
import { NoopTaskReminderNotifier } from '@/modules/notification/infrastructure/providers/NoopTaskReminderNotifier';
import { SQS_CLIENT } from '@/modules/notification/infrastructure/providers/SqsProviderTokens';
import { SQSClient } from '@aws-sdk/client-sqs';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

@Injectable()
class SqsClientShutdown implements OnApplicationShutdown {
  constructor(@Inject(SQS_CLIENT) private readonly sqsClient: SQSClient) {}

  onApplicationShutdown() {
    this.sqsClient.destroy();
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
      provide: TASK_REMINDER_NOTIFIER,
      useClass: NoopTaskReminderNotifier,
    },
    SqsClientShutdown,
  ],
  exports: [TASK_REMINDER_NOTIFIER, SQS_CLIENT],
})
export class NotificationModule {}
