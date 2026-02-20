import { TaskRepository } from '@/modules/task/domain/ports/TaskRepository';
import { Task } from '@/modules/task/domain/Task';
import { PromiseResult, Result } from '@/shared/core/result';
import { Collection } from 'mongodb';

interface TaskDocument {
  id: string;
  title: string;
  status: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}

export class TaskMongoAdapter implements TaskRepository {
  constructor(private readonly collection: Collection<TaskDocument>) {}

  async create(task: Task): PromiseResult<Task, Error> {
    try {
      const document = this.toDocument(task);
      await this.collection.insertOne(document);
      return Result.ok(task);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async update(task: Task): PromiseResult<Task, Error> {
    try {
      const document = this.toDocument(task);
      const result = await this.collection.updateOne(
        { id: document.id },
        { $set: document },
      );
      if (result.matchedCount === 0)
        return Result.fail(new Error('TASK_NOT_FOUND'));
      return Result.ok(task);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async deleteById(id: string): PromiseResult<void, Error> {
    try {
      const result = await this.collection.deleteOne({ id });
      if (result.deletedCount === 0)
        return Result.fail(new Error('TASK_NOT_FOUND'));
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findById(id: string): PromiseResult<Task | undefined, Error> {
    try {
      const document = await this.collection.findOne({ id });
      if (!document) return Result.ok(undefined);
      return this.toDomain(document);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findAll(): PromiseResult<Task[], Error> {
    try {
      const documents = await this.collection
        .find({})
        .sort({ dueDate: 1, id: 1 })
        .toArray();
      return this.toDomainList(documents);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async findByStatus(status: string): PromiseResult<Task[], Error> {
    try {
      const documents = await this.collection
        .find({ status })
        .sort({ dueDate: 1, id: 1 })
        .toArray();
      return this.toDomainList(documents);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private toDocument(task: Task): TaskDocument {
    const primitive = task.toPrimitives();
    return {
      id: primitive.id,
      title: primitive.title,
      status: primitive.status,
      ...(primitive.description !== undefined
        ? { description: primitive.description }
        : {}),
      ...(primitive.assignedTo !== undefined
        ? { assignedTo: primitive.assignedTo }
        : {}),
      ...(primitive.dueDate !== undefined
        ? { dueDate: primitive.dueDate }
        : {}),
    };
  }

  private toDomain(document: TaskDocument): Result<Task, Error> {
    return Task.create(
      {
        id: document.id,
        title: document.title,
        status: document.status,
        description: document.description,
        assignedTo: document.assignedTo,
        dueDate: document.dueDate,
      },
      { emitCreatedEvent: false },
    );
  }

  private toDomainList(
    documents: TaskDocument[],
  ): PromiseResult<Task[], Error> {
    const tasks: Task[] = [];
    for (const document of documents) {
      const taskResult = this.toDomain(document);
      if (!taskResult.ok) return Promise.resolve(Result.fail(taskResult.error));
      tasks.push(taskResult.value);
    }
    return Promise.resolve(Result.ok(tasks));
  }
}
