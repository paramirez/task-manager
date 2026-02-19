import { TaskRespository } from "@/domain/repo/TaskRepository";
import { Task } from "@/domain/task/Task";
import { Result } from "@/shared/core/result";

export class ListTaskUseCase {
    constructor(private readonly taskRepository: TaskRespository) {}

    async execute(): Promise<Result<Task[], Error>> {
        const tasks = await this.taskRepository.findAll();
        if (!tasks.isSuccess) return Result.fail(tasks.getErrorValue());

        return Result.ok(tasks.getValue())
    }
}