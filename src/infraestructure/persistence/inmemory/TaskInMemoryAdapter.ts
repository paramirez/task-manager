import { TaskRepository } from '@/domain/repo/TaskRepository';
import { Task } from '@/domain/task/Task';
import { PromiseResult, Result } from '@/shared/core/result';

export class TaskInMemoryAdapter implements TaskRepository {
  private tasks: ReturnType<Task['toPrimitives']>[] = [];

  create(task: Task): PromiseResult<Task, Error> {
    this.tasks = this.tasks.concat(task.toPrimitives());
    return Promise.resolve(Result.ok(task));
  }

  findAll(): PromiseResult<Task[], Error> {
    const hydratedTasks: Task[] = [];
    for (const rawTask of this.tasks) {
      const taskOrError = Task.create(rawTask);
      if (!taskOrError.ok) {
        return Promise.resolve(Result.fail(taskOrError.error));
      }
      hydratedTasks.push(taskOrError.value);
    }

    return Promise.resolve(Result.ok(hydratedTasks));
  }

  findById(id: string): PromiseResult<Task | undefined, Error> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return Promise.resolve(Result.ok(undefined));

    const taskOrError = Task.create(task);
    if (!taskOrError.ok) {
      return Promise.resolve(Result.fail(taskOrError.error));
    }

    return Promise.resolve(Result.ok(taskOrError.value));
  }
}
