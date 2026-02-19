import type { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { TASK_CREATED_EVENT } from '@/modules/task/domain/events/TaskCreatedEvent';
import type { TaskCreatedEvent } from '@/modules/task/domain/events/TaskCreatedEvent';
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

    const publishEventResult = await this.eventBus.publish<TaskCreatedEvent>({
      kind: TASK_CREATED_EVENT,
      task: task.toPrimitives(),
    });
    if (!publishEventResult.ok) return Result.fail(publishEventResult.error);

    return Result.ok(undefined);
  }
}
