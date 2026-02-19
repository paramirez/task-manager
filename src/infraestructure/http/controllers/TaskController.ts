import { Body, Controller, Get, Post } from "@nestjs/common";
import { Task } from "@/domain/task/Task";
import { CreateTaskUseCase } from "@/application/useCases/CreateTaskUseCase";
import { ListTaskUseCase } from "@/application/useCases/ListTaskUseCase";
import type { TaskDTO } from "@/infraestructure/http/dto/TaskDto";

@Controller({
    path: 'tasks',
    version: '1'
})
export class TaskController {

    constructor(
        private readonly listTaskUseCase: ListTaskUseCase,
        private readonly createTaskUseCase: CreateTaskUseCase,
    ) {}

    @Get()
    async getTasks(): Promise<ReturnType<Task['toPrimitives']>[]> {
        const tasks = await this.listTaskUseCase.execute();
        if (!tasks.isSuccess) throw tasks.getErrorValue().message;
        return tasks.getValue().map((task: Task) => task.toPrimitives());
    }

    @Post()
    async createTask(@Body() body: TaskDTO): Promise<void> {
        const task = Task.create(body);
        if (!task.isSuccess) throw task.getErrorValue();
        const createTaskResult = await this.createTaskUseCase.execute(task.getValue());
        if (!createTaskResult.isSuccess) throw createTaskResult.getErrorValue();
    }
}