import { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { Task } from '@/modules/task/domain/Task';
import { PromiseResult, Result } from '@/shared/core/result';
import { Repository } from 'typeorm';
import { TaskEntity } from './TaskEntity';

export class TaskPostgresAdapter implements TaskRepository {
  constructor(private readonly repository: Repository<TaskEntity>) {}

  async create(task: Task): PromiseResult<Task, Error> {
    try {
      const primitive = task.toPrimitives();
      const entity = this.repository.create({
        id: primitive.id,
        title: primitive.title,
        status: primitive.status,
        description: primitive.description ?? null,
        assignedTo: primitive.assignedTo ?? null,
        dueDate: primitive.dueDate ?? null,
      });
      await this.repository.save(entity);
      return Result.ok(task);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findById(id: string): PromiseResult<Task | undefined, Error> {
    try {
      const entity = await this.repository.findOne({ where: { id } });
      if (!entity) return Result.ok(undefined);
      return this.toDomain(entity);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findAll(): PromiseResult<Task[], Error> {
    try {
      const entities = await this.repository.find({
        order: { dueDate: 'ASC', id: 'ASC' },
      });
      const tasks: Task[] = [];
      for (const entity of entities) {
        const taskResult = this.toDomain(entity);
        if (!taskResult.ok) return Result.fail(taskResult.error);
        tasks.push(taskResult.value);
      }
      return Result.ok(tasks);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private toDomain(entity: TaskEntity): Result<Task, Error> {
    const taskResult = Task.create({
      id: entity.id,
      title: entity.title,
      status: entity.status,
      description: entity.description ?? undefined,
      assignedTo: entity.assignedTo ?? undefined,
      dueDate: entity.dueDate ?? undefined,
    });
    if (!taskResult.ok) return Result.fail(taskResult.error);
    return Result.ok(taskResult.value);
  }
}
