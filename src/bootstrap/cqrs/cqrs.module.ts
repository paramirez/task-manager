import { Global, Module } from '@nestjs/common';
import {
  InProcessCommandBus,
  InProcessEventBus,
  InProcessQueryBus,
} from '@/bootstrap/cqrs/InProcessBuses';
import {
  COMMAND_BUS,
  Command,
  CommandBus,
  CommandHandlerBinding,
  EVENT_BUS,
  EventBus,
  EventHandlerBinding,
  QUERY_BUS,
  Query,
  QueryBus,
  QueryHandlerBinding,
} from '@/shared/cqrs/CqrsTypes';
import { TaskModule } from '@/modules/task/infrastructure/task.module';
import { OutboxModule } from '@/modules/outbox/infrastructure/outbox.module';
import { AsyncJobsModule } from '@/modules/async-jobs/infrastructure/async-jobs.module';
import { NotificationModule } from '@/modules/notification/infrastructure/notification.module';
import { ReportingModule } from '@/modules/reporting/infrastructure/reporting.module';
import {
  OUTBOX_REPOSITORY,
  OutboxRepository,
} from '@/modules/outbox/application/ports/OutboxRepository';
import {
  TASK_EVENT_PUBLISHER,
  TaskEventPublisher,
} from '@/modules/notification/application/ports/TaskEventPublisher';
import {
  TASK_REPOSITORY,
  TaskRepository,
} from '@/modules/task/domain/ports/TaskRepository';
import {
  TASK_REPORT_REPOSITORY,
  TaskReportRepository,
} from '@/modules/reporting/application/ports/TaskReportRepository';
import {
  TASK_REMINDER_NOTIFIER,
  TaskReminderNotifier,
} from '@/modules/notification/application/ports/TaskReminderNotifier';
import {
  ASYNC_JOB_QUEUE,
  AsyncJobQueue,
} from '@/modules/async-jobs/application/ports/AsyncJobQueue';
import { CreateTaskCommandHandler } from '@/modules/task/application/commands/create-task/CreateTaskCommandHandler';
import {
  CREATE_TASK_COMMAND,
  CreateTaskCommand,
} from '@/modules/task/application/commands/create-task/CreateTaskCommand';
import { ListTasksQueryHandler } from '@/modules/task/application/queries/list-tasks/ListTasksQueryHandler';
import {
  LIST_TASKS_QUERY,
  ListTasksQuery,
} from '@/modules/task/application/queries/list-tasks/ListTasksQuery';
import { FindTaskByIdQueryHandler } from '@/modules/task/application/queries/find-task-by-id/FindTaskByIdQueryHandler';
import {
  FIND_TASK_BY_ID_QUERY,
  FindTaskByIdQuery,
} from '@/modules/task/application/queries/find-task-by-id/FindTaskByIdQuery';
import { DispatchOutboxMessagesHandler } from '@/modules/outbox/application/handlers/DispatchOutboxMessagesHandler';
import {
  DISPATCH_OUTBOX_MESSAGES_COMMAND,
  DispatchOutboxMessagesCommand,
} from '@/modules/outbox/application/commands/dispatch-outbox/DispatchOutboxMessagesCommand';
import { ScheduleTaskReminderCommandHandler } from '@/modules/async-jobs/application/commands/schedule-task-reminder/ScheduleTaskReminderCommandHandler';
import {
  SCHEDULE_TASK_REMINDER_COMMAND,
  ScheduleTaskReminderCommand,
} from '@/modules/async-jobs/application/commands/schedule-task-reminder/ScheduleTaskReminderCommand';
import { EnqueueCompletedTasksReportCommandHandler } from '@/modules/async-jobs/application/commands/enqueue-completed-report/EnqueueCompletedTasksReportCommandHandler';
import {
  ENQUEUE_COMPLETED_TASKS_REPORT_COMMAND,
  EnqueueCompletedTasksReportCommand,
} from '@/modules/async-jobs/application/commands/enqueue-completed-report/EnqueueCompletedTasksReportCommand';
import { ProcessAsyncJobsHandler } from '@/modules/async-jobs/application/handlers/ProcessAsyncJobsHandler';
import {
  PROCESS_ASYNC_JOBS_COMMAND,
  ProcessAsyncJobsCommand,
} from '@/modules/async-jobs/application/commands/process-async-jobs/ProcessAsyncJobsCommand';
import { EnqueueTaskCreatedOutboxEventHandler } from '@/modules/outbox/application/handlers/EnqueueTaskCreatedOutboxEventHandler';
import { TASK_CREATED_EVENT } from '@/modules/task/domain/events/TaskCreatedEvent';

@Global()
@Module({
  imports: [
    TaskModule,
    OutboxModule,
    AsyncJobsModule,
    NotificationModule,
    ReportingModule,
  ],
  providers: [
    {
      provide: EnqueueTaskCreatedOutboxEventHandler,
      useFactory(outboxRepository: OutboxRepository) {
        return new EnqueueTaskCreatedOutboxEventHandler(outboxRepository);
      },
      inject: [OUTBOX_REPOSITORY],
    },
    {
      provide: EVENT_BUS,
      useFactory(
        enqueueTaskCreatedOutboxEventHandler: EnqueueTaskCreatedOutboxEventHandler,
      ): EventBus {
        const bindings: EventHandlerBinding[] = [
          {
            kind: TASK_CREATED_EVENT,
            handle: (event) =>
              enqueueTaskCreatedOutboxEventHandler.handle(event as never),
          },
        ];
        return new InProcessEventBus(bindings);
      },
      inject: [EnqueueTaskCreatedOutboxEventHandler],
    },
    {
      provide: CreateTaskCommandHandler,
      useFactory(taskRepository: TaskRepository, eventBus: EventBus) {
        return new CreateTaskCommandHandler(taskRepository, eventBus);
      },
      inject: [TASK_REPOSITORY, EVENT_BUS],
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
    {
      provide: ScheduleTaskReminderCommandHandler,
      useFactory(taskRepository: TaskRepository, asyncJobQueue: AsyncJobQueue) {
        return new ScheduleTaskReminderCommandHandler(
          taskRepository,
          asyncJobQueue,
        );
      },
      inject: [TASK_REPOSITORY, ASYNC_JOB_QUEUE],
    },
    {
      provide: EnqueueCompletedTasksReportCommandHandler,
      useFactory(asyncJobQueue: AsyncJobQueue) {
        return new EnqueueCompletedTasksReportCommandHandler(asyncJobQueue);
      },
      inject: [ASYNC_JOB_QUEUE],
    },
    {
      provide: ProcessAsyncJobsHandler,
      useFactory(
        asyncJobQueue: AsyncJobQueue,
        taskRepository: TaskRepository,
        taskReportRepository: TaskReportRepository,
        taskReminderNotifier: TaskReminderNotifier,
      ) {
        return new ProcessAsyncJobsHandler(
          asyncJobQueue,
          taskRepository,
          taskReportRepository,
          taskReminderNotifier,
        );
      },
      inject: [
        ASYNC_JOB_QUEUE,
        TASK_REPOSITORY,
        TASK_REPORT_REPOSITORY,
        TASK_REMINDER_NOTIFIER,
      ],
    },
    {
      provide: COMMAND_BUS,
      useFactory(
        createTaskCommandHandler: CreateTaskCommandHandler,
        scheduleTaskReminderCommandHandler: ScheduleTaskReminderCommandHandler,
        enqueueCompletedTasksReportCommandHandler: EnqueueCompletedTasksReportCommandHandler,
        processAsyncJobsHandler: ProcessAsyncJobsHandler,
        dispatchOutboxMessagesHandler: DispatchOutboxMessagesHandler,
      ): CommandBus {
        const bindings: CommandHandlerBinding[] = [
          {
            kind: CREATE_TASK_COMMAND,
            execute: (command: Command) =>
              createTaskCommandHandler.execute(command as CreateTaskCommand),
          },
          {
            kind: SCHEDULE_TASK_REMINDER_COMMAND,
            execute: (command: Command) =>
              scheduleTaskReminderCommandHandler.execute(
                command as ScheduleTaskReminderCommand,
              ),
          },
          {
            kind: ENQUEUE_COMPLETED_TASKS_REPORT_COMMAND,
            execute: (command: Command) =>
              enqueueCompletedTasksReportCommandHandler.execute(
                command as EnqueueCompletedTasksReportCommand,
              ),
          },
          {
            kind: PROCESS_ASYNC_JOBS_COMMAND,
            execute: (command: Command) =>
              processAsyncJobsHandler.execute(
                command as ProcessAsyncJobsCommand,
              ),
          },
          {
            kind: DISPATCH_OUTBOX_MESSAGES_COMMAND,
            execute: (command: Command) =>
              dispatchOutboxMessagesHandler.execute(
                command as DispatchOutboxMessagesCommand,
              ),
          },
        ];
        return new InProcessCommandBus(bindings);
      },
      inject: [
        CreateTaskCommandHandler,
        ScheduleTaskReminderCommandHandler,
        EnqueueCompletedTasksReportCommandHandler,
        ProcessAsyncJobsHandler,
        DispatchOutboxMessagesHandler,
      ],
    },
    {
      provide: QUERY_BUS,
      useFactory(
        listTasksQueryHandler: ListTasksQueryHandler,
        findTaskByIdQueryHandler: FindTaskByIdQueryHandler,
      ): QueryBus {
        const bindings: QueryHandlerBinding[] = [
          {
            kind: LIST_TASKS_QUERY,
            execute: (query: Query) =>
              listTasksQueryHandler.execute(query as ListTasksQuery),
          },
          {
            kind: FIND_TASK_BY_ID_QUERY,
            execute: (query: Query) =>
              findTaskByIdQueryHandler.execute(query as FindTaskByIdQuery),
          },
        ];
        return new InProcessQueryBus(bindings);
      },
      inject: [ListTasksQueryHandler, FindTaskByIdQueryHandler],
    },
  ],
  exports: [COMMAND_BUS, QUERY_BUS, EVENT_BUS],
})
export class CqrsModule {}
