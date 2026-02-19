import { Module } from '@nestjs/common';
import { TASK_EVENT_PUBLISHER } from '@/modules/notification/application/ports/TaskEventPublisher';
import { TASK_REMINDER_NOTIFIER } from '@/modules/notification/application/ports/TaskReminderNotifier';
import { NoopTaskEventPublisher } from '@/modules/notification/infrastructure/providers/NoopTaskEventPublisher';
import { NoopTaskReminderNotifier } from '@/modules/notification/infrastructure/providers/NoopTaskReminderNotifier';

@Module({
  providers: [
    {
      provide: TASK_EVENT_PUBLISHER,
      useClass: NoopTaskEventPublisher,
    },
    {
      provide: TASK_REMINDER_NOTIFIER,
      useClass: NoopTaskReminderNotifier,
    },
  ],
  exports: [TASK_EVENT_PUBLISHER, TASK_REMINDER_NOTIFIER],
})
export class NotificationModule {}
