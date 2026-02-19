import { OutboxRepository } from '@/modules/outbox/application/ports/OutboxRepository';
import { OutboxMessage } from '@/modules/outbox/domain/OutboxMessage';
import { PromiseResult, Result } from '@/shared/core/result';

export class InMemoryOutboxRepository implements OutboxRepository {
  private readonly messages: OutboxMessage[] = [];

  add(message: OutboxMessage): PromiseResult<void, Error> {
    this.messages.push({
      ...message,
      occurredAt: new Date(message.occurredAt),
      processedAt: message.processedAt
        ? new Date(message.processedAt)
        : undefined,
    });
    return Promise.resolve(Result.ok(undefined));
  }

  listPending(): PromiseResult<OutboxMessage[], Error> {
    const pending = this.messages
      .filter((message) => !message.processedAt)
      .map((message) => ({
        ...message,
        occurredAt: new Date(message.occurredAt),
        processedAt: message.processedAt
          ? new Date(message.processedAt)
          : undefined,
      }));

    return Promise.resolve(Result.ok(pending));
  }

  markAsProcessed(messageId: string): PromiseResult<void, Error> {
    const message = this.messages.find(
      (candidate) => candidate.id === messageId,
    );
    if (!message) {
      return Promise.resolve(
        Result.fail(new Error('OUTBOX_MESSAGE_NOT_FOUND')),
      );
    }

    message.processedAt = new Date();
    return Promise.resolve(Result.ok(undefined));
  }
}
