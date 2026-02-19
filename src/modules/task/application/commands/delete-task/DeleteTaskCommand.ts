import { Command } from '@/shared/cqrs/CqrsTypes';

export const DELETE_TASK_COMMAND = 'task.delete';

export interface DeleteTaskCommand extends Command {
  kind: typeof DELETE_TASK_COMMAND;
  id: string;
}
