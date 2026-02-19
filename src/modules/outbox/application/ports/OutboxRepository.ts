import { PromiseResult } from '@/shared/core/result';
import { OutboxMessage } from '@/modules/outbox/domain/OutboxMessage';

export const OUTBOX_REPOSITORY = Symbol('OUTBOX_REPOSITORY');

export interface OutboxRepository {
  add(message: OutboxMessage): PromiseResult<void, Error>;
  listPending(): PromiseResult<OutboxMessage[], Error>;
  markAsProcessed(messageId: string): PromiseResult<void, Error>;
}
