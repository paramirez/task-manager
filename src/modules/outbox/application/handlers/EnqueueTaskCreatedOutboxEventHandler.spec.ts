import { OutboxRepository } from '@/modules/outbox/application/ports/OutboxRepository';
import { EnqueueTaskCreatedOutboxEventHandler } from '@/modules/outbox/application/handlers/EnqueueTaskCreatedOutboxEventHandler';
import { OutboxMessage } from '@/modules/outbox/domain/OutboxMessage';
import { TASK_CREATED_EVENT } from '@/modules/task/domain/events/TaskCreatedEvent';
import { Result } from '@/shared/core/result';

class InMemoryOutboxRepositoryForEventTest implements OutboxRepository {
  public readonly messages: OutboxMessage[] = [];

  add(message: OutboxMessage) {
    this.messages.push(message);
    return Promise.resolve(Result.ok<void, Error>(undefined));
  }

  listPending() {
    return Promise.resolve(Result.ok<OutboxMessage[], Error>(this.messages));
  }

  markAsProcessed(messageId: string) {
    void messageId;
    return Promise.resolve(Result.ok<void, Error>(undefined));
  }
}

describe('EnqueueTaskCreatedOutboxEventHandler', () => {
  it('enqueues task.created into outbox', async () => {
    const outbox = new InMemoryOutboxRepositoryForEventTest();
    const handler = new EnqueueTaskCreatedOutboxEventHandler(outbox);

    const result = await handler.handle({
      kind: TASK_CREATED_EVENT,
      task: {
        id: 'task-1',
        title: 'Task',
        status: 'pending',
      },
    });

    expect(result.ok).toBe(true);
    expect(outbox.messages).toHaveLength(1);
    expect(outbox.messages[0].type).toBe('task.created');
  });
});
