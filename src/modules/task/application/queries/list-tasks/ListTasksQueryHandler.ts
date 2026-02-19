import type { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { Task } from '@/modules/task/domain/Task';
import { Result } from '@/shared/core/result';
import { ListTasksQuery } from './ListTasksQuery';

export class ListTasksQueryHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(_query: ListTasksQuery): Promise<Result<Task[], Error>> {
    void _query;
    const tasks = await this.taskRepository.findAll();
    if (!tasks.ok) return Result.fail(tasks.error);

    return Result.ok(tasks.value);
  }
}
