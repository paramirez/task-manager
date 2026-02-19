import { TaskEventPublisher } from '@/modules/notification/application/ports/TaskEventPublisher';
import { DISPATCH_OUTBOX_MESSAGES_COMMAND } from '@/modules/outbox/application/commands/dispatch-outbox/DispatchOutboxMessagesCommand';
import { Task } from '@/modules/task/domain/Task';
import { PromiseResult, Result } from '@/shared/core/result';
import { DispatchOutboxMessagesHandler } from './DispatchOutboxMessagesHandler';
import { OutboxRepository } from '@/modules/outbox/application/ports/OutboxRepository';
import { OutboxMessage } from '@/modules/outbox/domain/OutboxMessage';
import { TASK_CREATED_EVENT_TYPE } from '@/modules/outbox/domain/TaskCreatedOutboxEvent';

class InMemoryOutboxRepositoryForTest implements OutboxRepository {
  public readonly messages: OutboxMessage[] = [];

  add(message: OutboxMessage): PromiseResult<void, Error> {
    this.messages.push({ ...message });
    return Promise.resolve(Result.ok(undefined));
  }

  listPending(): PromiseResult<OutboxMessage[], Error> {
    return Promise.resolve(
      Result.ok(this.messages.filter((message) => !message.processedAt)),
    );
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

class InMemoryTaskEventPublisherForTest implements TaskEventPublisher {
  public readonly publishedTaskIds: string[] = [];
  public failNext = false;

  publishTaskCreated(task: Task): PromiseResult<void, Error> {
    if (this.failNext) {
      this.failNext = false;
      return Promise.resolve(Result.fail(new Error('PUBLISH_FAILED')));
    }
    this.publishedTaskIds.push(task.id);
    return Promise.resolve(Result.ok(undefined));
  }
}

describe('DispatchOutboxMessagesHandler', () => {
  it('publishes and marks pending task.created messages as processed', async () => {
    const outboxRepository = new InMemoryOutboxRepositoryForTest();
    const publisher = new InMemoryTaskEventPublisherForTest();
    const handler = new DispatchOutboxMessagesHandler(
      outboxRepository,
      publisher,
    );

    await outboxRepository.add({
      id: 'outbox-1',
      type: TASK_CREATED_EVENT_TYPE,
      payload: { id: 'task-1', title: 'Create docs' },
      occurredAt: new Date(),
    });

    const result = await handler.execute({
      kind: DISPATCH_OUTBOX_MESSAGES_COMMAND,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected successful dispatch');

    expect(result.value.total).toBe(1);
    expect(result.value.processed).toBe(1);
    expect(result.value.failed).toBe(0);
    expect(publisher.publishedTaskIds).toEqual(['task-1']);
  });

  it('keeps message pending when publish fails and reports failure', async () => {
    const outboxRepository = new InMemoryOutboxRepositoryForTest();
    const publisher = new InMemoryTaskEventPublisherForTest();
    publisher.failNext = true;
    const handler = new DispatchOutboxMessagesHandler(
      outboxRepository,
      publisher,
    );

    await outboxRepository.add({
      id: 'outbox-2',
      type: TASK_CREATED_EVENT_TYPE,
      payload: { id: 'task-2', title: 'Retry me' },
      occurredAt: new Date(),
    });

    const result = await handler.execute({
      kind: DISPATCH_OUTBOX_MESSAGES_COMMAND,
    });
    expect(result.ok).toBe(true);
    if (!result.ok)
      throw new Error('Expected successful dispatch result payload');

    expect(result.value.total).toBe(1);
    expect(result.value.processed).toBe(0);
    expect(result.value.failed).toBe(1);
    expect(result.value.failures[0].messageId).toBe('outbox-2');
    expect(result.value.failures[0].reason).toBe('PUBLISH_FAILED');

    const pendingResult = await outboxRepository.listPending();
    expect(pendingResult.ok).toBe(true);
    if (!pendingResult.ok) throw new Error('Expected pending list');
    expect(pendingResult.value).toHaveLength(1);
  });
});
