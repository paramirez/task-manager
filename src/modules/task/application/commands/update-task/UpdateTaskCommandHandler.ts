import { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { Result } from '@/shared/core/result';
import { UpdateTaskCommand } from './UpdateTaskCommand';

export class UpdateTaskCommandHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

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

    return Result.ok(undefined);
  }
}
