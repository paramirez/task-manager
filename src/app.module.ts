import { Module } from '@nestjs/common';
import { TaskController } from './infraestructure/http/controllers/TaskController';
import { ListTaskUseCase } from './application/useCases/ListTaskUseCase';
import { CreateTaskUseCase } from './application/useCases/CreateTaskUseCase';
import { TaskInMemoryAdapter } from './infraestructure/persistence/inmemory/TaskInMemoryAdapter';

@Module({
  imports: [],
  controllers: [
    TaskController
  ],
  providers: [
    {
      provide: "TASK_REPOSITORY",
      useClass: TaskInMemoryAdapter
    },
    {
      provide: ListTaskUseCase,
      useFactory(taskRepository: TaskInMemoryAdapter) {
        return new ListTaskUseCase(taskRepository)
      },
      inject: ["TASK_REPOSITORY"]
    },
    {
      provide: CreateTaskUseCase,
      useFactory(taskRepository: TaskInMemoryAdapter) {
        return new CreateTaskUseCase(taskRepository)
      },
      inject: ["TASK_REPOSITORY"]
    }
  ],
})
export class AppModule { }
