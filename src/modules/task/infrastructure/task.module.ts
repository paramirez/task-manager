import { Module } from '@nestjs/common';
import { DATABASE_DB } from '@/bootstrap/database/DatabaseModule';
import { TaskController } from '@/modules/task/infrastructure/http/controllers/TaskController';
import { TASK_REPOSITORY } from '@/modules/task/domain/ports/TaskRepository';
import { TaskMongoAdapter } from '@/modules/task/infrastructure/persistence/mongo/TaskMongoAdapter';
import { Db } from 'mongodb';

@Module({
  controllers: [TaskController],
  providers: [
    {
      provide: TASK_REPOSITORY,
      useFactory(db: Db) {
        return new TaskMongoAdapter(db.collection('tasks'));
      },
      inject: [DATABASE_DB],
    },
  ],
  exports: [TASK_REPOSITORY],
})
export class TaskModule {}
