import { Result } from '@/shared/core/result';
import { BusinessError } from '@/shared/domain/BusinessError';
import { ValidationError } from '@/shared/domain/ValidationError';
import { TaskStatus } from './TaskStatus';
import { TaskTitle } from './TaskTitle';

export class Task {
  private readonly _id: string;
  private readonly _title: TaskTitle;
  private readonly _status: TaskStatus;
  private readonly _description?: string;
  private readonly _assignedTo?: string;
  private readonly _dueDate?: Date;

  private constructor(params: {
    id: string;
    title: TaskTitle;
    status: TaskStatus;
    description?: string;
    assignedTo?: string;
    dueDate?: Date;
  }) {
    this._id = params.id;
    this._title = params.title;
    this._status = params.status;
    this._description = params.description;
    this._assignedTo = params.assignedTo;
    this._dueDate = params.dueDate;
  }

  get id() {
    return this._id;
  }
  get title() {
    return this._title.value;
  }
  get status() {
    return this._status.value;
  }
  get description() {
    return this._description;
  }
  get assignedTo() {
    return this._assignedTo;
  }
  get dueDate() {
    return this._dueDate ? new Date(this._dueDate) : undefined;
  }

  static create(input: {
    id?: string;
    title: string;
    status?: string;
    description?: string;
    assignedTo?: string;
    dueDate?: Date;
  }): Result<Task, Error> {
    const title = TaskTitle.create(input?.title);
    if (!title.ok) return Result.fail(title.error);

    const status = input.status
      ? TaskStatus.create(input.status)
      : Result.ok<TaskStatus, Error>(TaskStatus.pending());
    if (!status.ok) return Result.fail(status.error);

    const assigned = input.assignedTo?.trim() || undefined;
    const due = input.dueDate ? new Date(input.dueDate) : undefined;

    const task = new Task({
      id: input.id ?? crypto.randomUUID(),
      title: title.value,
      description: input.description?.trim() || undefined,
      status: status.value,
      assignedTo: assigned,
      dueDate: due,
    });

    return Result.ok(task);
  }

  equals(task: Task): boolean {
    return task.id === this._id;
  }

  complete(): Result<Task, Error> {
    const nextOrError = this._status.markAsCompleted();
    if (!nextOrError.ok) return Result.fail(nextOrError.error);

    const nextStatus = nextOrError.value;

    return Result.ok(
      new Task({
        id: this._id,
        title: this._title,
        status: nextStatus,
        description: this._description,
        assignedTo: this._assignedTo,
        dueDate: this._dueDate ? new Date(this._dueDate) : undefined,
      }),
    );
  }

  start(): Result<Task, Error> {
    if (this._status.equals(TaskStatus.completed()))
      return Result.fail(new BusinessError('TASK_ALREADY_COMPLETED'));

    if (this._status.equals(TaskStatus.inProgress())) return Result.ok(this);

    return Result.ok(
      new Task({
        id: this._id,
        title: this._title,
        status: TaskStatus.inProgress(),
        description: this._description,
        assignedTo: this._assignedTo,
        dueDate: this._dueDate ? new Date(this._dueDate) : undefined,
      }),
    );
  }

  updateDetails(input: {
    title?: string;
    status?: string;
    description?: string;
    assignedTo?: string;
    dueDate?: Date;
    now?: Date;
  }): Result<Task, Error> {
    let title = this._title;

    if (input.title) {
      const titleResult = TaskTitle.create(input.title);
      if (!titleResult.ok) return Result.fail(titleResult.error);
      title = titleResult.value;
    }
    let status = this._status;
    if (input.status) {
      const taskStatusResult = TaskStatus.create(input.status);
      if (!taskStatusResult.ok) return Result.fail(taskStatusResult.error);
      status = taskStatusResult.value;
    }

    const now = input.now ?? new Date();
    if (input.dueDate && input.dueDate.getTime() < now.getTime()) {
      return Result.fail(new ValidationError('TASK_DUE_DATE_IN_PAST'));
    }

    const taskUpdated = new Task({
      id: this._id,
      title,
      status,
      description:
        'description' in input
          ? input.description?.trim() || undefined
          : this._description,
      assignedTo:
        'assignedTo' in input
          ? input.assignedTo?.trim() || undefined
          : this._assignedTo,
      dueDate:
        'dueDate' in input
          ? input.dueDate
            ? new Date(input.dueDate)
            : undefined
          : this._dueDate
            ? new Date(this._dueDate)
            : undefined,
    });

    return Result.ok(taskUpdated);
  }

  toPrimitives() {
    return {
      id: this._id,
      title: this._title.value,
      status: this._status.value,
      description: this._description,
      assignedTo: this._assignedTo,
      dueDate: this._dueDate ? new Date(this._dueDate) : undefined,
    };
  }
}
