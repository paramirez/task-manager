import { Result } from "@/shared/core/result";

const STATUS = {
  pending: "pending",
  in_progress: "in_progress",
  done: "done",
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

  static done(): TaskStatus {
    return new TaskStatus(STATUS.done);
  }

  static create(value: string): Result<TaskStatus, Error> {
    switch (value) {
      case STATUS.pending:
        return Result.ok(TaskStatus.pending());
      case STATUS.in_progress:
        return Result.ok(TaskStatus.inProgress());
      case STATUS.done:
        return Result.ok(TaskStatus.done());
      default:
        return Result.fail(new Error("TASK_STATUS_INVALID"));
    }
  }

  markAsDone(): Result<TaskStatus, Error> {
    if (this._value === STATUS.done) {
      return Result.ok(this);
    }

    if (this._value === STATUS.pending || this._value === STATUS.in_progress) {
      return Result.ok(TaskStatus.done());
    }

    return Result.fail(new Error("TASK_INVALID_STATUS_TRANSITION"));
  }

  equals(other: TaskStatus): boolean {
    return this._value === other._value;
  }
}
