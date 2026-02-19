import { ListTaskUseCase } from "@/application/useCases/ListTaskUseCase";
import { Task } from "@/domain/task/Task";
import { Result } from "@/shared/core/result";
import { Controller, Get } from "@nestjs/common";

@Controller({
    path: 'tasks',
    version: '1'
})
export class TaskController {

    constructor(
        private readonly listTaskUseCase: ListTaskUseCase
    ) {}

    @Get()
    async getTasks(): Promise<Result<Task[], Error>> {
        const tasks = this.listTaskUseCase.execute();
        if (!tasks.isSuccess) return Result.fail(tasks.getErrorValue());
        // TODO: toDto
        return Result.ok(tasks.getValue());
    }
}