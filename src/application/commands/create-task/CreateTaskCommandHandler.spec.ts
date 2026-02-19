import { CreateTaskCommandHandler } from '@/application/commands/create-task/CreateTaskCommandHandler';
import { OutboxRepository } from '@/application/outbox/OutboxRepository';
import { OutboxMessage } from '@/application/outbox/OutboxMessage';
import { TaskRepository } from '@/domain/repo/TaskRepository';
import { Task } from '@/domain/task/Task';
import { Result } from '@/shared/core/result';

class InMemoryTaskRepository implements TaskRepository {
  public readonly tasks: Task[] = [];

  create(task: Task) {
    this.tasks.push(task);
    return Promise.resolve(Result.ok<Task, Error>(task));
  }

  findById(id: string) {
    const task = this.tasks.find((candidate) => candidate.id === id);
    return Promise.resolve(Result.ok<Task | undefined, Error>(task));
  }

  findAll() {
    return Promise.resolve(Result.ok<Task[], Error>(this.tasks));
  }
}

class InMemoryOutboxRepository implements OutboxRepository {
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

describe('CreateTaskCommandHandler', () => {
  it('creates a task from command input', async () => {
    const repository = new InMemoryTaskRepository();
    const outbox = new InMemoryOutboxRepository();
    const commandHandler = new CreateTaskCommandHandler(repository, outbox);

    const result = await commandHandler.execute({ title: 'Write tests' });

    expect(result.ok).toBe(true);
    expect(repository.tasks).toHaveLength(1);
    expect(repository.tasks[0].title).toBe('Write tests');
    expect(outbox.messages).toHaveLength(1);
    expect(outbox.messages[0].type).toBe('task.created');
  });

  it('returns validation error when title is invalid', async () => {
    const repository = new InMemoryTaskRepository();
    const outbox = new InMemoryOutboxRepository();
    const commandHandler = new CreateTaskCommandHandler(repository, outbox);

    const result = await commandHandler.execute({ title: '  ' });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Expected a failed result');
    }
    expect(result.error.message).toBe('TASK_TITLE_REQUIRED');
    expect(repository.tasks).toHaveLength(0);
    expect(outbox.messages).toHaveLength(0);
  });
});
