import { CreateTaskCommandHandler } from '@/modules/task/application/commands/create-task/CreateTaskCommandHandler';
import { CREATE_TASK_COMMAND } from '@/modules/task/application/commands/create-task/CreateTaskCommand';
import { TASK_CREATED_EVENT } from '@/modules/task/domain/events/TaskCreatedEvent';
import { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { Task } from '@/modules/task/domain/Task';
import { EventBus } from '@/shared/cqrs/CqrsTypes';
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

class InMemoryEventBus implements EventBus {
  public readonly publishedKinds: string[] = [];

  publish(event: { kind: string }) {
    this.publishedKinds.push(event.kind);
    return Promise.resolve(Result.ok<void, Error>(undefined));
  }
}

describe('CreateTaskCommandHandler', () => {
  it('creates a task from command input', async () => {
    const repository = new InMemoryTaskRepository();
    const eventBus = new InMemoryEventBus();
    const commandHandler = new CreateTaskCommandHandler(repository, eventBus);

    const result = await commandHandler.execute({
      kind: CREATE_TASK_COMMAND,
      title: 'Write tests',
    });

    expect(result.ok).toBe(true);
    expect(repository.tasks).toHaveLength(1);
    expect(repository.tasks[0].title).toBe('Write tests');
    expect(eventBus.publishedKinds).toEqual([TASK_CREATED_EVENT]);
  });

  it('returns validation error when title is invalid', async () => {
    const repository = new InMemoryTaskRepository();
    const eventBus = new InMemoryEventBus();
    const commandHandler = new CreateTaskCommandHandler(repository, eventBus);

    const result = await commandHandler.execute({
      kind: CREATE_TASK_COMMAND,
      title: '  ',
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Expected a failed result');
    }
    expect(result.error.message).toBe('TASK_TITLE_REQUIRED');
    expect(repository.tasks).toHaveLength(0);
    expect(eventBus.publishedKinds).toHaveLength(0);
  });
});
