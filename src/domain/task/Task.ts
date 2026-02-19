import { Result } from "@/shared/core/result";
import { TaskStatus } from "./TaskStatus";
import { TaskTitle } from "./TaskTitle";

export class Task {
    private readonly _id: string;
    private readonly _title: TaskTitle;
    private readonly _status: TaskStatus;
    private readonly _description?: string;
    private readonly _assignedTo?: string;
    private readonly _dueDate?: Date;

    private constructor(
        params: {
            id: string;
            title: TaskTitle;
            status: TaskStatus;
            description?: string;
            assignedTo?: string;
            dueDate?: Date;
        }
    ) {
        this._id = params.id;
        this._title = params.title;
        this._status = params.status;
        this._description = params.description;
        this._assignedTo = params.assignedTo;
        this._dueDate = params.dueDate;
    }

    get id() { return this._id }
    get title() { return this._title.value }
    get status() { return this._status.value }
    get description() { return this._description }
    get assignedTo() { return this._assignedTo }
    get dueDate() { return this._dueDate ? new Date(this._dueDate) : undefined }

    static create(input: {
        id: string;
        title: string;
        status?: string;
        description?: string;
        assignedTo?: string;
        dueDate?: Date;
    }): Result<Task, Error> {
        const title = TaskTitle.create(input.title);
        if (!title.isSuccess) return Result.fail(title.getErrorValue());

        const status = input.status ? TaskStatus.create(input.status) : Result.ok<TaskStatus, Error>(TaskStatus.pending())
        if (!status.isSuccess) return Result.fail(status.getErrorValue());

        const assigned = input.assignedTo?.trim() || undefined;
        const due = input.dueDate ? new Date(input.dueDate) : undefined;

        const task = new Task({
            id: input.id,
            title: title.getValue(),
            description: input.description?.trim() || undefined,
            status: status.getValue(),
            assignedTo: assigned,
            dueDate: due
        });

        return Result.ok(task);
    }

    complete(): Result<Task, Error> {
        const nextOrError = this._status.markAsDone()
        if (!nextOrError?.isSuccess) return Result.fail(nextOrError.getErrorValue());

        const nextStatus = nextOrError.getValue();

        return Result.ok(new Task(
            {
                id: this._id,
                title: this._title,
                status: nextStatus,
                description: this._description,
                assignedTo: this._assignedTo,
                dueDate: this._dueDate ? new Date(this._dueDate) : undefined
            }
        ));
    }


    start(): Result<Task, Error> {
        if (this._status.equals(TaskStatus.done()))
            return Result.fail(new Error("TASK_ALREADY_COMPLETED"));


        if (this._status.equals(TaskStatus.inProgress()))
            return Result.ok(this);


        return Result.ok(new Task(
            {
                id: this._id,
                title: this._title,
                status: TaskStatus.inProgress(),
                description: this._description,
                assignedTo: this._assignedTo,
                dueDate: this._dueDate ? new Date(this._dueDate) : undefined
            }
        ));
    }

    rename(newTitle: string): Result<Task, Error> {
        const title = TaskTitle.create(newTitle);
        if (!title.isSuccess) return Result.fail(title.getErrorValue());

        return Result.ok(new Task(
            {
                id: this._id,
                title: title.getValue(),
                status: this._status,
                description: this.description,
                assignedTo: this._assignedTo,
                dueDate: this._dueDate ? new Date(this._dueDate) : undefined
            }
        ));
    }

    updateDetails(input: {
        description?: string;
        assignedTo?: string;
        dueDate?: Date;
        now?: Date;
    }): Result<Task, Error> {
        const now = input.now ?? new Date();
        if (input.dueDate && input.dueDate.getTime() < now.getTime()) {
            return Result.fail(new Error("TASK_DUE_DATE_IN_PAST"));
        }

        return Result.ok(new Task(
            {
                id: this._id,
                title: this._title,
                status: this._status,
                description: ("description" in input) ? (input.description?.trim() || undefined) : this._description,
                assignedTo: ("assignedTo" in input) ? (input.assignedTo?.trim() || undefined) : this._assignedTo,
                dueDate: ("dueDate" in input) ? (input.dueDate ? new Date(input.dueDate) : undefined) :
                    (this._dueDate ? new Date(this._dueDate) : undefined)
            }
        ));
    }
}