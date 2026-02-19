import { Task } from '@/modules/task/domain/Task';
import { PromiseResult } from '@/shared/core/result';

export const TASK_EVENT_PUBLISHER = Symbol('TASK_EVENT_PUBLISHER');

export interface TaskEventPublisher {
  publishTaskCreated(task: Task): PromiseResult<void, Error>;
}
