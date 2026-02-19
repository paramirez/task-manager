import { OutboxRepository } from '@/modules/outbox/application/ports/OutboxRepository';
import { OutboxMessage } from '@/modules/outbox/domain/OutboxMessage';
import { PromiseResult, Result } from '@/shared/core/result';
import { IsNull, Repository } from 'typeorm';
import { OutboxMessageEntity } from './OutboxMessageEntity';

export class OutboxPostgresAdapter implements OutboxRepository {
  constructor(private readonly repository: Repository<OutboxMessageEntity>) {}

  async add(message: OutboxMessage): PromiseResult<void, Error> {
    try {
      const entity = this.repository.create({
        id: message.id,
        type: message.type,
        payload: message.payload,
        occurredAt: new Date(message.occurredAt),
        processedAt: message.processedAt ? new Date(message.processedAt) : null,
      });
      await this.repository.save(entity);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async listPending(): PromiseResult<OutboxMessage[], Error> {
    try {
      const entities = await this.repository.find({
        where: { processedAt: IsNull() },
        order: { occurredAt: 'ASC', id: 'ASC' },
      });
      return Result.ok(
        entities.map((entity) => ({
          id: entity.id,
          type: entity.type,
          payload: entity.payload,
          occurredAt: new Date(entity.occurredAt),
          processedAt: entity.processedAt
            ? new Date(entity.processedAt)
            : undefined,
        })),
      );
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async markAsProcessed(messageId: string): PromiseResult<void, Error> {
    try {
      const result = await this.repository.update(
        { id: messageId },
        { processedAt: new Date() },
      );
      if (!result.affected) {
        return Result.fail(new Error('OUTBOX_MESSAGE_NOT_FOUND'));
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
