import type { OutboxRepository } from '@/application/outbox/OutboxRepository';
import { TASK_CREATED_EVENT_TYPE } from '@/application/outbox/TaskCreatedOutboxEvent';
import type { TaskRepository } from '@/domain/repo/TaskRepository';
import { Task } from '@/domain/task/Task';
import { Result } from '@/shared/core/result';
import { CreateTaskCommand } from './CreateTaskCommand';

export class CreateTaskCommandHandler {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  async execute(command: CreateTaskCommand): Promise<Result<void, Error>> {
    const taskOrError = Task.create(command);
    if (!taskOrError.ok) return Result.fail(taskOrError.error);

    const task = taskOrError.value;
    const createTaskResult = await this.taskRepository.create(task);
    if (!createTaskResult.ok) return Result.fail(createTaskResult.error);

    const enqueueEventResult = await this.outboxRepository.add({
      id: crypto.randomUUID(),
      type: TASK_CREATED_EVENT_TYPE,
      payload: task.toPrimitives() as Record<string, unknown>,
      occurredAt: new Date(),
    });
    if (!enqueueEventResult.ok) return Result.fail(enqueueEventResult.error);

    return Result.ok(undefined);
  }
}
