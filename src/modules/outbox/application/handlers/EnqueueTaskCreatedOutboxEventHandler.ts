import type { OutboxRepository } from '@/modules/outbox/application/ports/OutboxRepository';
import { TASK_CREATED_EVENT_TYPE } from '@/modules/outbox/domain/TaskCreatedOutboxEvent';
import {
  TASK_CREATED_EVENT,
  TaskCreatedEvent,
} from '@/modules/task/domain/events/TaskCreatedEvent';
import { EventHandlerBinding } from '@/shared/cqrs/CqrsTypes';
import { PromiseResult, Result } from '@/shared/core/result';

export class EnqueueTaskCreatedOutboxEventHandler implements EventHandlerBinding {
  readonly kind = TASK_CREATED_EVENT;

  constructor(private readonly outboxRepository: OutboxRepository) {}

  async handle(event: TaskCreatedEvent): PromiseResult<void, Error> {
    const addResult = await this.outboxRepository.add({
      id: crypto.randomUUID(),
      type: TASK_CREATED_EVENT_TYPE,
      payload: event.task as Record<string, unknown>,
      occurredAt: new Date(),
    });
    if (!addResult.ok) return Result.fail(addResult.error);

    return Result.ok(undefined);
  }
}
