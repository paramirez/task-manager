import { OutboxMessage } from '@/application/outbox/OutboxMessage';
import { InMemoryOutboxRepository } from '@/infraestructure/persistence/inmemory/InMemoryOutboxRepository';

describe('InMemoryOutboxRepository', () => {
  it('stores and lists pending messages', async () => {
    const repository = new InMemoryOutboxRepository();
    const message: OutboxMessage = {
      id: 'msg-1',
      type: 'task.created',
      payload: { id: 'task-1' },
      occurredAt: new Date('2026-02-19T00:00:00.000Z'),
    };

    const saveResult = await repository.add(message);
    expect(saveResult.ok).toBe(true);

    const pendingResult = await repository.listPending();
    expect(pendingResult.ok).toBe(true);
    if (!pendingResult.ok) {
      throw new Error('Expected pending outbox messages');
    }

    expect(pendingResult.value).toHaveLength(1);
    expect(pendingResult.value[0].id).toBe('msg-1');
    expect(pendingResult.value[0].processedAt).toBeUndefined();
  });

  it('marks a message as processed', async () => {
    const repository = new InMemoryOutboxRepository();
    await repository.add({
      id: 'msg-2',
      type: 'task.created',
      payload: { id: 'task-2' },
      occurredAt: new Date('2026-02-19T00:00:00.000Z'),
    });

    const markResult = await repository.markAsProcessed('msg-2');
    expect(markResult.ok).toBe(true);

    const pendingResult = await repository.listPending();
    expect(pendingResult.ok).toBe(true);
    if (!pendingResult.ok) {
      throw new Error('Expected pending outbox messages');
    }

    expect(pendingResult.value).toHaveLength(0);
  });
});
