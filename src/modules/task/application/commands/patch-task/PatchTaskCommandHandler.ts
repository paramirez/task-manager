import { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { Result } from '@/shared/core/result';
import { PatchTaskCommand } from './PatchTaskCommand';

export class PatchTaskCommandHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: PatchTaskCommand): Promise<Result<void, Error>> {
    const hasAnyField =
      'title' in command ||
      'status' in command ||
      'description' in command ||
      'assignedTo' in command ||
      'dueDate' in command;
    if (!hasAnyField) return Result.fail(new Error('PATCH_PAYLOAD_EMPTY'));

    const taskResult = await this.taskRepository.findById(command.id);
    if (!taskResult.ok) return Result.fail(taskResult.error);
    if (!taskResult.value) return Result.fail(new Error('TASK_NOT_FOUND'));

    const updatedTaskResult = taskResult.value.updateDetails({
      ...(command.title !== undefined ? { title: command.title } : {}),
      ...(command.status !== undefined ? { status: command.status } : {}),
      ...(command.description !== undefined
        ? { description: command.description }
        : {}),
      ...(command.assignedTo !== undefined
        ? { assignedTo: command.assignedTo }
        : {}),
      ...(command.dueDate !== undefined ? { dueDate: command.dueDate } : {}),
    });
    if (!updatedTaskResult.ok) return Result.fail(updatedTaskResult.error);

    const saveResult = await this.taskRepository.update(
      updatedTaskResult.value,
    );
    if (!saveResult.ok) return Result.fail(saveResult.error);

    return Result.ok(undefined);
  }
}
