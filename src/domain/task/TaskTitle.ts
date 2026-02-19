import { Result } from "@/shared/core/result";
import { ValidationError } from "../errors/ValidationError";

export class TaskTitle {
    private constructor(public readonly value: string) { }
    
    static create(input: string): Result<TaskTitle, Error> {
        const v = (input ?? "").trim();
        if (!v) return Result.fail(new ValidationError("TASK_TITLE_REQUIRED"));
        if (v.length > 120) return Result.fail(new ValidationError("TASK_TITLE_LONG"));
        return Result.ok(new TaskTitle(v));
    }
}