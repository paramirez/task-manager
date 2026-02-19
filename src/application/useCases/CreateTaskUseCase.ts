import { TaskRespository } from "@/domain/repo/TaskRepository";
import { Task } from "@/domain/task/Task";
import { Result } from "@/shared/core/result";

export class CreateTaskUseCase {
    constructor(private readonly taskRepository: TaskRespository) {}
    
    async execute(task: Task): Promise<Result<void, Error>> {
        const createTaskResult = await this.taskRepository.create(task);
        if (!createTaskResult.isSuccess) return Result.fail(createTaskResult.getErrorValue());
        return Result.ok();
    }
}