import type { TaskRepository } from '@/domain/repo/TaskRepository';
import { Task } from '@/domain/task/Task';
import { Result } from '@/shared/core/result';

export class ListTasksQueryHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(): Promise<Result<Task[], Error>> {
    const tasks = await this.taskRepository.findAll();
    if (!tasks.ok) return Result.fail(tasks.error);

    return Result.ok(tasks.value);
  }
}
