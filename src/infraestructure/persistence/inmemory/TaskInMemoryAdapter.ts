import { TaskRespository } from "@/domain/repo/TaskRepository";
import { Task } from "@/domain/task/Task";
import { Result } from "@/shared/core/result";

export class TaskInMemoryAdapter implements TaskRespository {
    private tasks: ReturnType<Task['toPrimitives']>[] = []

    async create(task: Task): Promise<Result<Task, Error>> {
        this.tasks = this.tasks.concat(task.toPrimitives())
        return Result.ok(task);
    }
    
    async findAll(): Promise<Result<Task[], Error>> {
        return Result.ok(this.tasks.map(t => Task.create(t).getValue()));
    }
}