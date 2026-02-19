import { DomainEvent } from '@/shared/cqrs/CqrsTypes';

export const TASK_CREATED_EVENT = 'task.created';

export interface TaskCreatedEvent extends DomainEvent {
  kind: typeof TASK_CREATED_EVENT;
  task: {
    id: string;
    title: string;
    status: string;
    description?: string;
    assignedTo?: string;
    dueDate?: Date;
  };
}
