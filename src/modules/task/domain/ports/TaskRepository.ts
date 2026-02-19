import { PromiseResult } from '@/shared/core/result';
import { Task } from '@/modules/task/domain/Task';

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export interface TaskRepository {
  create(task: Task): PromiseResult<Task, Error>;
  findById(id: string): PromiseResult<Task | undefined, Error>;
  findAll(): PromiseResult<Task[], Error>;
}

// Backwards-compatible alias while refactor is in progress.
export type TaskRespository = TaskRepository;
