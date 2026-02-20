import { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import type { EventBus } from '@/shared/cqrs/CqrsTypes';
import { Result } from '@/shared/core/result';
import { UpdateTaskCommand } from './UpdateTaskCommand';

export class UpdateTaskCommandHandler {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateTaskCommand): Promise<Result<void, Error>> {
    const taskResult = await this.taskRepository.findById(command.id);
    if (!taskResult.ok) return Result.fail(taskResult.error);
    if (!taskResult.value) return Result.fail(new Error('TASK_NOT_FOUND'));

    const updatedTaskResult = taskResult.value.updateDetails({
      title: command.title,
      status: command.status,
      description: command.description,
      assignedTo: command.assignedTo,
      dueDate: command.dueDate,
    });
    if (!updatedTaskResult.ok) return Result.fail(updatedTaskResult.error);

    const saveResult = await this.taskRepository.update(
      updatedTaskResult.value,
    );
    if (!saveResult.ok) return Result.fail(saveResult.error);

    for (const event of updatedTaskResult.value.pullEvents()) {
      const publishEventResult = await this.eventBus.publish(event);
      if (!publishEventResult.ok) return Result.fail(publishEventResult.error);
    }

    return Result.ok(undefined);
  }
}
