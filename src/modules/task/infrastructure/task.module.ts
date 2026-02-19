import { Module } from '@nestjs/common';
import { DATABASE_DATASOURCE } from '@/bootstrap/database/DatabaseModule';
import { TaskController } from '@/modules/task/infrastructure/http/controllers/TaskController';
import { TASK_REPOSITORY } from '@/modules/task/domain/ports/TaskRepository';
import { TaskPostgresAdapter } from '@/modules/task/infrastructure/persistence/postgres/TaskPostgresAdapter';
import { TaskEntity } from '@/modules/task/infrastructure/persistence/postgres/TaskEntity';
import { DataSource } from 'typeorm';

@Module({
  controllers: [TaskController],
  providers: [
    {
      provide: TASK_REPOSITORY,
      useFactory(dataSource: DataSource) {
        return new TaskPostgresAdapter(dataSource.getRepository(TaskEntity));
      },
      inject: [DATABASE_DATASOURCE],
    },
  ],
  exports: [TASK_REPOSITORY],
})
export class TaskModule {}
