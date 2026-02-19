import { Result } from "@/shared/core/result";
import { Task } from "@/domain/task/Task";

export interface TaskRespository {
    create(task: Task): Promise<Result<Task, Error>>;
    findAll(): Promise<Result<Task[], Error>>;
}