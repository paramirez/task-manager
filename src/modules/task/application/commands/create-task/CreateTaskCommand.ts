import { Command } from '@/shared/cqrs/CqrsTypes';

export const CREATE_TASK_COMMAND = 'task.create';

export interface CreateTaskCommand extends Command {
  kind: typeof CREATE_TASK_COMMAND;
  id?: string;
  title: string;
  status?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}
