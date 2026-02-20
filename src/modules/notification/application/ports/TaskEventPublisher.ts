import { PromiseResult } from '@/shared/core/result';

export const TASK_EVENT_PUBLISHER = Symbol('TASK_EVENT_PUBLISHER');

export interface TaskEventMessage {
  type: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface TaskEventPublisher {
  publish(event: TaskEventMessage): PromiseResult<void, Error>;
}
