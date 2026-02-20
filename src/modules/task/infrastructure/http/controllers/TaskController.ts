import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Patch,
  Put,
  Param,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { COMMAND_BUS, QUERY_BUS } from '@/shared/cqrs/CqrsTypes';
import type { CommandBus, QueryBus } from '@/shared/cqrs/CqrsTypes';
import { Result } from '@/shared/core/result';
import { CREATE_TASK_COMMAND } from '@/modules/task/application/commands/create-task/CreateTaskCommand';
import { FIND_TASK_BY_ID_QUERY } from '@/modules/task/application/queries/find-task-by-id/FindTaskByIdQuery';
import { FIND_TASKS_BY_STATUS_QUERY } from '@/modules/task/application/queries/find-tasks-by-status/FindTasksByStatusQuery';
import { FindTaskByIdQuery } from '@/modules/task/application/queries/find-task-by-id/FindTaskByIdQuery';
import { FindTasksByStatusQuery } from '@/modules/task/application/queries/find-tasks-by-status/FindTasksByStatusQuery';
import { LIST_TASKS_QUERY } from '@/modules/task/application/queries/list-tasks/ListTasksQuery';
import { ListTasksQuery } from '@/modules/task/application/queries/list-tasks/ListTasksQuery';
import { Task } from '@/modules/task/domain/Task';
import { CreateTaskCommand } from '@/modules/task/application/commands/create-task/CreateTaskCommand';
import { UPDATE_TASK_COMMAND } from '@/modules/task/application/commands/update-task/UpdateTaskCommand';
import { UpdateTaskCommand } from '@/modules/task/application/commands/update-task/UpdateTaskCommand';
import { PATCH_TASK_COMMAND } from '@/modules/task/application/commands/patch-task/PatchTaskCommand';
import { PatchTaskCommand } from '@/modules/task/application/commands/patch-task/PatchTaskCommand';
import { DELETE_TASK_COMMAND } from '@/modules/task/application/commands/delete-task/DeleteTaskCommand';
import { DeleteTaskCommand } from '@/modules/task/application/commands/delete-task/DeleteTaskCommand';
import { SCHEDULE_TASK_REMINDER_COMMAND } from '@/modules/async-jobs/application/commands/schedule-task-reminder/ScheduleTaskReminderCommand';
import { ScheduleTaskReminderCommand } from '@/modules/async-jobs/application/commands/schedule-task-reminder/ScheduleTaskReminderCommand';
import {
  CreateTaskDTO,
  PatchTaskDTO,
  ScheduleTaskDTO,
  ScheduleTaskResponseDTO,
  TaskResponseDTO,
  UpdateTaskDTO,
} from '@/modules/task/infrastructure/http/dto/TaskDto';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

@ApiTags('tasks')
@Controller({
  path: 'tasks',
  version: '1',
})
export class TaskController {
  constructor(
    @Inject(QUERY_BUS) private readonly queryBus: QueryBus,
    @Inject(COMMAND_BUS) private readonly commandBus: CommandBus,
  ) {}

  @ApiOperation({ summary: 'Crear una tarea' })
  @ApiCreatedResponse({ description: 'Tarea creada correctamente' })
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

  @ApiOperation({ summary: 'Listar tareas' })
  @ApiOkResponse({ type: TaskResponseDTO, isArray: true })
  @Get()
  async getTasks(): Promise<TaskResponseDTO[]> {
    const tasks = await this.queryBus.execute<Task[], ListTasksQuery>({
      kind: LIST_TASKS_QUERY,
    });
    if (!tasks.ok) throw tasks.error;
    return tasks.value.map((task) => task.toPrimitives());
  }

  @ApiOperation({ summary: 'Listar tareas por estado' })
  @ApiOkResponse({ type: TaskResponseDTO, isArray: true })
  @Get('status/:status')
  async getByStatus(
    @Param('status') status: string,
  ): Promise<TaskResponseDTO[]> {
    const tasks = await this.queryBus.execute<Task[], FindTasksByStatusQuery>({
      kind: FIND_TASKS_BY_STATUS_QUERY,
      status,
    });
    if (!tasks.ok) throw tasks.error;
    return tasks.value.map((task) => task.toPrimitives());
  }

  @ApiOperation({ summary: 'Obtener tarea por ID' })
  @ApiOkResponse({ type: TaskResponseDTO })
  @ApiNotFoundResponse({ description: 'Tarea no encontrada' })
  @Get(':id')
  async getById(@Param('id') id: string): Promise<TaskResponseDTO> {
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

  @ApiOperation({ summary: 'Actualizar completamente una tarea' })
  @ApiOkResponse({ description: 'Tarea actualizada correctamente' })
  @ApiNotFoundResponse({ description: 'Tarea no encontrada' })
  @ApiUnprocessableEntityResponse({ description: 'Payload inválido' })
  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() body: UpdateTaskDTO,
  ): Promise<void> {
    const result = await this.commandBus.execute<void, UpdateTaskCommand>({
      kind: UPDATE_TASK_COMMAND,
      id,
      title: body.title,
      status: body.status,
      description: body.description,
      assignedTo: body.assignedTo,
      dueDate: body.dueDate,
    });

    this.throwIfTaskMutationFailed(result);
  }

  @ApiOperation({ summary: 'Actualizar parcialmente una tarea' })
  @ApiOkResponse({ description: 'Tarea actualizada correctamente' })
  @ApiNotFoundResponse({ description: 'Tarea no encontrada' })
  @ApiUnprocessableEntityResponse({ description: 'Payload inválido' })
  @Patch(':id')
  async patchTask(
    @Param('id') id: string,
    @Body() body: PatchTaskDTO,
  ): Promise<void> {
    const result = await this.commandBus.execute<void, PatchTaskCommand>({
      kind: PATCH_TASK_COMMAND,
      id,
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
      ...(body.assignedTo !== undefined ? { assignedTo: body.assignedTo } : {}),
      ...(body.dueDate !== undefined ? { dueDate: body.dueDate } : {}),
    });

    this.throwIfTaskMutationFailed(result);
  }

  @ApiOperation({ summary: 'Eliminar tarea por ID' })
  @ApiOkResponse({ description: 'Tarea eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'Tarea no encontrada' })
  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<void> {
    const result = await this.commandBus.execute<void, DeleteTaskCommand>({
      kind: DELETE_TASK_COMMAND,
      id,
    });
    this.throwIfTaskMutationFailed(result);
  }

  @ApiOperation({ summary: 'Programar recordatorio asíncrono para una tarea' })
  @ApiCreatedResponse({ type: ScheduleTaskResponseDTO })
  @ApiNotFoundResponse({ description: 'Tarea no encontrada' })
  @ApiUnprocessableEntityResponse({
    description: 'La tarea no tiene dueDate o payload inválido',
  })
  @Post(':id/schedule')
  async scheduleTask(
    @Param('id') id: string,
    @Body() body: ScheduleTaskDTO,
  ): Promise<ScheduleTaskResponseDTO> {
    const result = await this.commandBus.execute<
      string,
      ScheduleTaskReminderCommand
    >({
      kind: SCHEDULE_TASK_REMINDER_COMMAND,
      taskId: id,
      minutesBeforeDueDate: body.minutesBeforeDueDate,
    });
    if (!result.ok) {
      if (result.error.message === 'TASK_NOT_FOUND')
        throw new NotFoundException();
      if (result.error.message === 'TASK_DUE_DATE_REQUIRED') {
        throw new UnprocessableEntityException(result.error.message);
      }
      if (result.error.message === 'INVALID_MINUTES_BEFORE_DUE_DATE') {
        throw new UnprocessableEntityException(result.error.message);
      }
      throw result.error;
    }
    return { jobId: result.value };
  }

  private throwIfTaskMutationFailed(result: Result<void, Error>) {
    if (result.ok) return;
    const error = result.error;
    if (error.message === 'TASK_NOT_FOUND') throw new NotFoundException();
    if (error.message === 'PATCH_PAYLOAD_EMPTY') {
      throw new UnprocessableEntityException(error.message);
    }
    throw error;
  }
}
