import { Module } from '@nestjs/common';
import { NotificationModule } from '@/modules/notification/infrastructure/notification.module';
import {
  TASK_EVENTS_CONSUMER_SQS_QUEUE_NAME,
  TASK_EVENTS_CONSUMER_SQS_QUEUE_URL,
} from '@/modules/task-events-consumer/infrastructure/TaskEventsConsumerTokens';
import { TaskEventsSqsConsumerService } from '@/modules/task-events-consumer/infrastructure/TaskEventsSqsConsumerService';

@Module({
  imports: [NotificationModule],
  providers: [
    {
      provide: TASK_EVENTS_CONSUMER_SQS_QUEUE_NAME,
      useFactory() {
        return (
          process.env.TASK_EVENTS_CONSUMER_SQS_QUEUE_NAME ??
          'task-events-consumer'
        );
      },
    },
    {
      provide: TASK_EVENTS_CONSUMER_SQS_QUEUE_URL,
      useFactory() {
        return process.env.TASK_EVENTS_CONSUMER_SQS_QUEUE_URL;
      },
    },
    TaskEventsSqsConsumerService,
  ],
})
export class TaskEventsConsumerModule {}
