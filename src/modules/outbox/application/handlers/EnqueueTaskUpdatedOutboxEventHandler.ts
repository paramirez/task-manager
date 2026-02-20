import type { OutboxRepository } from '@/modules/outbox/application/ports/OutboxRepository';
import { TASK_UPDATED_EVENT_TYPE } from '@/modules/outbox/domain/TaskUpdatedOutboxEvent';
import {
  TASK_UPDATED_EVENT,
  TaskUpdatedEvent,
} from '@/modules/task/domain/events/TaskUpdatedEvent';
import { EventHandlerBinding } from '@/shared/cqrs/CqrsTypes';
import { PromiseResult, Result } from '@/shared/core/result';

export class EnqueueTaskUpdatedOutboxEventHandler implements EventHandlerBinding {
  readonly kind = TASK_UPDATED_EVENT;

  constructor(private readonly outboxRepository: OutboxRepository) {}

  async handle(event: TaskUpdatedEvent): PromiseResult<void, Error> {
    const addResult = await this.outboxRepository.add({
      id: crypto.randomUUID(),
      type: TASK_UPDATED_EVENT_TYPE,
      payload: event.task as Record<string, unknown>,
      occurredAt: new Date(),
    });
    if (!addResult.ok) return Result.fail(addResult.error);

    return Result.ok(undefined);
  }
}
