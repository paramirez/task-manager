import { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { TaskStatus } from '@/modules/task/domain/TaskStatus';
import { Task } from '@/modules/task/domain/Task';
import { Result } from '@/shared/core/result';
import { FindTasksByStatusQuery } from './FindTasksByStatusQuery';

export class FindTasksByStatusQueryHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(query: FindTasksByStatusQuery): Promise<Result<Task[], Error>> {
    const statusResult = TaskStatus.create(query.status);
    if (!statusResult.ok) return Result.fail(statusResult.error);

    const tasksResult = await this.taskRepository.findByStatus(query.status);
    if (!tasksResult.ok) return Result.fail(tasksResult.error);

    return Result.ok(tasksResult.value);
  }
}
