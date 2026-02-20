import { Command } from '@/shared/cqrs/CqrsTypes';

export const PATCH_TASK_COMMAND = 'task.patch';

export interface PatchTaskCommand extends Command {
  kind: typeof PATCH_TASK_COMMAND;
  id: string;
  title?: string;
  status?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}
