import { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { Result } from '@/shared/core/result';
import { DeleteTaskCommand } from './DeleteTaskCommand';

export class DeleteTaskCommandHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: DeleteTaskCommand): Promise<Result<void, Error>> {
    const deleteResult = await this.taskRepository.deleteById(command.id);
    if (!deleteResult.ok) return Result.fail(deleteResult.error);
    return Result.ok(undefined);
  }
}
