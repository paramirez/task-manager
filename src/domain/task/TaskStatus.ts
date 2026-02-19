import { Result } from "@/shared/core/result";
import { ValidationError } from "../errors/ValidationError";
import { BusinessError } from "../errors/BusinessError";

const STATUS = {
  pending: "pending",
  in_progress: "in_progress",
  completed: "completed",
}

export class TaskStatus {
  private constructor(private readonly _value: string) { }

  get value() {
    return this._value;
  }

  static pending(): TaskStatus {
    return new TaskStatus(STATUS.pending);
  }

  static inProgress(): TaskStatus {
    return new TaskStatus(STATUS.in_progress);
  }

  static completed(): TaskStatus {
    return new TaskStatus(STATUS.completed);
  }

  static create(value: string): Result<TaskStatus, Error> {
    switch (value) {
      case STATUS.pending:
        return Result.ok(TaskStatus.pending());
      case STATUS.in_progress:
        return Result.ok(TaskStatus.inProgress());
      case STATUS.completed:
        return Result.ok(TaskStatus.completed());
      default:
        return Result.fail(new ValidationError("TASK_STATUS_INVALID"));
    }
  }

  markAsCompleted(): Result<TaskStatus, Error> {
    if (this._value === STATUS.completed) {
      return Result.ok(this);
    }

    if (this._value === STATUS.pending || this._value === STATUS.in_progress) {
      return Result.ok(TaskStatus.completed());
    }

    return Result.fail(new BusinessError("TASK_INVALID_STATUS_TRANSITION"));
  }

  equals(other: TaskStatus): boolean {
    return this._value === other._value;
  }
}
