import type { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import type { EventBus } from '@/shared/cqrs/CqrsTypes';
import { Task } from '@/modules/task/domain/Task';
import { Result } from '@/shared/core/result';
import { CreateTaskCommand } from './CreateTaskCommand';

export class CreateTaskCommandHandler {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateTaskCommand): Promise<Result<void, Error>> {
    const taskOrError = Task.create(command);
    if (!taskOrError.ok) return Result.fail(taskOrError.error);

    const task = taskOrError.value;
    const createTaskResult = await this.taskRepository.create(task);
    if (!createTaskResult.ok) return Result.fail(createTaskResult.error);

    for (const event of task.pullEvents()) {
      const publishEventResult = await this.eventBus.publish(event);
      if (!publishEventResult.ok) return Result.fail(publishEventResult.error);
    }

    return Result.ok(undefined);
  }
}
