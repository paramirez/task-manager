import { PromiseResult } from '@/shared/core/result';

export const TASK_REMINDER_NOTIFIER = Symbol('TASK_REMINDER_NOTIFIER');

export interface TaskReminderNotifier {
  sendDueDateReminder(payload: {
    taskId: string;
    title: string;
    dueDateIso: string;
  }): PromiseResult<void, Error>;
}
