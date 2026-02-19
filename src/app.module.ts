import { Module } from '@nestjs/common';
import { DispatchOutboxMessagesHandler } from './application/outbox/DispatchOutboxMessagesHandler';
import { TaskController } from './infraestructure/http/controllers/TaskController';
import { OutboxController } from './infraestructure/http/controllers/OutboxController';
import {
  OUTBOX_REPOSITORY,
  OutboxRepository,
} from './application/outbox/OutboxRepository';
import { TaskInMemoryAdapter } from './infraestructure/persistence/inmemory/TaskInMemoryAdapter';
import { InMemoryOutboxRepository } from './infraestructure/persistence/inmemory/InMemoryOutboxRepository';
import { TASK_REPOSITORY, TaskRepository } from './domain/repo/TaskRepository';
import { CreateTaskCommandHandler } from './application/commands/create-task/CreateTaskCommandHandler';
import { ListTasksQueryHandler } from './application/queries/list-tasks/ListTasksQueryHandler';
import { FindTaskByIdQueryHandler } from './application/queries/find-task-by-id/FindTaskByIdQueryHandler';
import { NoopTaskEventPublisher } from './infraestructure/events/NoopTaskEventPublisher';
import {
  TASK_EVENT_PUBLISHER,
  TaskEventPublisher,
} from './application/events/TaskEventPublisher';

@Module({
  imports: [],
  controllers: [TaskController, OutboxController],
  providers: [
    {
      provide: TASK_REPOSITORY,
      useClass: TaskInMemoryAdapter,
    },
    {
      provide: TASK_EVENT_PUBLISHER,
      useClass: NoopTaskEventPublisher,
    },
    {
      provide: OUTBOX_REPOSITORY,
      useClass: InMemoryOutboxRepository,
    },
    {
      provide: CreateTaskCommandHandler,
      useFactory(
        taskRepository: TaskRepository,
        outboxRepository: OutboxRepository,
      ) {
        return new CreateTaskCommandHandler(taskRepository, outboxRepository);
      },
      inject: [TASK_REPOSITORY, OUTBOX_REPOSITORY],
    },
    {
      provide: ListTasksQueryHandler,
      useFactory(taskRepository: TaskRepository) {
        return new ListTasksQueryHandler(taskRepository);
      },
      inject: [TASK_REPOSITORY],
    },
    {
      provide: FindTaskByIdQueryHandler,
      useFactory(taskRepository: TaskRepository) {
        return new FindTaskByIdQueryHandler(taskRepository);
      },
      inject: [TASK_REPOSITORY],
    },
    {
      provide: DispatchOutboxMessagesHandler,
      useFactory(
        outboxRepository: OutboxRepository,
        taskEventPublisher: TaskEventPublisher,
      ) {
        return new DispatchOutboxMessagesHandler(
          outboxRepository,
          taskEventPublisher,
        );
      },
      inject: [OUTBOX_REPOSITORY, TASK_EVENT_PUBLISHER],
    },
  ],
})
export class AppModule {}
