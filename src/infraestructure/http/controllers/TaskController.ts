import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateTaskCommandHandler } from '@/application/commands/create-task/CreateTaskCommandHandler';
import { FindTaskByIdQueryHandler } from '@/application/queries/find-task-by-id/FindTaskByIdQueryHandler';
import { ListTasksQueryHandler } from '@/application/queries/list-tasks/ListTasksQueryHandler';
import type {
  CreateTaskDTO,
  TaskDTO,
} from '@/infraestructure/http/dto/TaskDto';

@Controller({
  path: 'tasks',
  version: '1',
})
export class TaskController {
  constructor(
    private readonly listTasksQueryHandler: ListTasksQueryHandler,
    private readonly createTaskCommandHandler: CreateTaskCommandHandler,
    private readonly findTaskByIdQueryHandler: FindTaskByIdQueryHandler,
  ) {}

  @Post()
  async createTask(@Body() body: CreateTaskDTO): Promise<void> {
    const createTaskResult = await this.createTaskCommandHandler.execute({
      ...body,
    });
    if (!createTaskResult.ok) throw createTaskResult.error;
  }

  @Get()
  async getTasks(): Promise<TaskDTO[]> {
    const tasks = await this.listTasksQueryHandler.execute();
    if (!tasks.ok) {
      throw new InternalServerErrorException(tasks.error.message);
    }
    return tasks.value.map((task) => task.toPrimitives());
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<TaskDTO> {
    const taskResult = await this.findTaskByIdQueryHandler.execute({ id });

    if (!taskResult.ok) throw taskResult.error;
    const task = taskResult.value;

    if (!task) throw new NotFoundException();

    return task.toPrimitives();
  }
}
