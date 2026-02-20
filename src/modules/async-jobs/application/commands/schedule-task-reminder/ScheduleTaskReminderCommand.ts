import { Command } from '@/shared/cqrs/CqrsTypes';

export const SCHEDULE_TASK_REMINDER_COMMAND =
  'async_jobs.schedule_task_reminder';

export interface ScheduleTaskReminderCommand extends Command {
  kind: typeof SCHEDULE_TASK_REMINDER_COMMAND;
  taskId: string;
  minutesBeforeDueDate?: number;
}
