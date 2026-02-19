import { Command } from '@/shared/cqrs/CqrsTypes';

export const UPDATE_TASK_COMMAND = 'task.update';

export interface UpdateTaskCommand extends Command {
  kind: typeof UPDATE_TASK_COMMAND;
  id: string;
  title: string;
  status: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}
