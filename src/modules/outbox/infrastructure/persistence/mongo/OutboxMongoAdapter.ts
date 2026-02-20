import { OutboxRepository } from '@/modules/outbox/application/ports/OutboxRepository';
import { OutboxMessage } from '@/modules/outbox/domain/OutboxMessage';
import { PromiseResult, Result } from '@/shared/core/result';
import { Collection } from 'mongodb';

interface OutboxMessageDocument {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  processedAt?: Date;
}

export class OutboxMongoAdapter implements OutboxRepository {
  constructor(private readonly collection: Collection<OutboxMessageDocument>) {}

  async add(message: OutboxMessage): PromiseResult<void, Error> {
    try {
      await this.collection.insertOne({
        id: message.id,
        type: message.type,
        payload: message.payload,
        occurredAt: new Date(message.occurredAt),
        ...(message.processedAt
          ? { processedAt: new Date(message.processedAt) }
          : {}),
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async listPending(): PromiseResult<OutboxMessage[], Error> {
    try {
      const documents = await this.collection
        .find({ processedAt: { $exists: false } })
        .sort({ occurredAt: 1, id: 1 })
        .toArray();
      return Result.ok(
        documents.map((document) => ({
          id: document.id,
          type: document.type,
          payload: document.payload,
          occurredAt: new Date(document.occurredAt),
          processedAt: document.processedAt
            ? new Date(document.processedAt)
            : undefined,
        })),
      );
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async markAsProcessed(messageId: string): PromiseResult<void, Error> {
    try {
      const result = await this.collection.updateOne(
        { id: messageId },
        { $set: { processedAt: new Date() } },
      );
      if (result.matchedCount === 0) {
        return Result.fail(new Error('OUTBOX_MESSAGE_NOT_FOUND'));
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
