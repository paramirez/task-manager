import { TaskReminderNotifier } from '@/modules/notification/application/ports/TaskReminderNotifier';
import { PromiseResult, Result } from '@/shared/core/result';

export class NoopTaskReminderNotifier implements TaskReminderNotifier {
  sendDueDateReminder(payload: {
    taskId: string;
    title: string;
    dueDateIso: string;
  }): PromiseResult<void, Error> {
    void payload;
    return Promise.resolve(Result.ok(undefined));
  }
}
