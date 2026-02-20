import { Command } from '@/shared/cqrs/CqrsTypes';

export const ENQUEUE_COMPLETED_TASKS_REPORT_COMMAND =
  'async_jobs.enqueue_completed_tasks_report';

export interface EnqueueCompletedTasksReportCommand extends Command {
  kind: typeof ENQUEUE_COMPLETED_TASKS_REPORT_COMMAND;
  requestedBy?: string;
}
