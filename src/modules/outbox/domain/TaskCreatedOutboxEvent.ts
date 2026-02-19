export const TASK_CREATED_EVENT_TYPE = 'task.created';

export interface TaskCreatedOutboxPayload {
  id: string;
  title: string;
  status?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}
