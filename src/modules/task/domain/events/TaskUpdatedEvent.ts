import { DomainEvent } from '@/shared/cqrs/CqrsTypes';

export const TASK_UPDATED_EVENT = 'task.updated';

export interface TaskUpdatedEvent extends DomainEvent {
  kind: typeof TASK_UPDATED_EVENT;
  task: {
    id: string;
    title: string;
    status: string;
    description?: string;
    assignedTo?: string;
    dueDate?: Date;
  };
}
