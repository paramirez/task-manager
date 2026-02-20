export const TASK_UPDATED_EVENT_TYPE = 'task.updated';

export interface TaskUpdatedOutboxPayload {
  id: string;
  title: string;
  status?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}
