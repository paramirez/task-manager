import type { TaskRepository } from '@/domain/repo/TaskRepository';
import { Task } from '@/domain/task/Task';
import { PromiseResult } from '@/shared/core/result';
import { FindTaskByIdQuery } from './FindTaskByIdQuery';

export class FindTaskByIdQueryHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    query: FindTaskByIdQuery,
  ): PromiseResult<Task | undefined, Error> {
    return this.taskRepository.findById(query.id);
  }
}
