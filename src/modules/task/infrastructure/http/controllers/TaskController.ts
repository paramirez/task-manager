import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { COMMAND_BUS, QUERY_BUS } from '@/shared/cqrs/CqrsTypes';
import type { CommandBus, QueryBus } from '@/shared/cqrs/CqrsTypes';
import { CREATE_TASK_COMMAND } from '@/modules/task/application/commands/create-task/CreateTaskCommand';
import { FIND_TASK_BY_ID_QUERY } from '@/modules/task/application/queries/find-task-by-id/FindTaskByIdQuery';
import { FindTaskByIdQuery } from '@/modules/task/application/queries/find-task-by-id/FindTaskByIdQuery';
import { LIST_TASKS_QUERY } from '@/modules/task/application/queries/list-tasks/ListTasksQuery';
import { ListTasksQuery } from '@/modules/task/application/queries/list-tasks/ListTasksQuery';
import { Task } from '@/modules/task/domain/Task';
import { CreateTaskCommand } from '@/modules/task/application/commands/create-task/CreateTaskCommand';
import type {
  CreateTaskDTO,
  TaskDTO,
} from '@/modules/task/infrastructure/http/dto/TaskDto';

@Controller({
  path: 'tasks',
  version: '1',
})
export class TaskController {
  constructor(
    @Inject(QUERY_BUS) private readonly queryBus: QueryBus,
    @Inject(COMMAND_BUS) private readonly commandBus: CommandBus,
  ) {}

  @Post()
  async createTask(@Body() body: CreateTaskDTO): Promise<void> {
    const createTaskResult = await this.commandBus.execute<
      void,
      CreateTaskCommand
    >({
      kind: CREATE_TASK_COMMAND,
      ...body,
    });
    if (!createTaskResult.ok) throw createTaskResult.error;
  }

  @Get()
  async getTasks(): Promise<TaskDTO[]> {
    const tasks = await this.queryBus.execute<Task[], ListTasksQuery>({
      kind: LIST_TASKS_QUERY,
    });
    if (!tasks.ok) throw tasks.error;
    return tasks.value.map((task) => task.toPrimitives());
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<TaskDTO> {
    const taskResult = await this.queryBus.execute<
      Task | undefined,
      FindTaskByIdQuery
    >({
      kind: FIND_TASK_BY_ID_QUERY,
      id,
    });

    if (!taskResult.ok) throw taskResult.error;
    const task = taskResult.value;

    if (!task) throw new NotFoundException();

    return task.toPrimitives();
  }
}
