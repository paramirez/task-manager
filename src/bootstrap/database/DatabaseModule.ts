import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OutboxMessageEntity } from '@/modules/outbox/infrastructure/persistence/postgres/OutboxMessageEntity';
import { CompletedTasksReportEntity } from '@/modules/reporting/infrastructure/persistence/postgres/CompletedTasksReportEntity';
import { TaskEntity } from '@/modules/task/infrastructure/persistence/postgres/TaskEntity';

export const DATABASE_DATASOURCE = Symbol('DATABASE_DATASOURCE');

async function createDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'app',
    password: process.env.DB_PASSWORD ?? 'app',
    database: process.env.DB_NAME ?? 'appdb',
    entities: [TaskEntity, OutboxMessageEntity, CompletedTasksReportEntity],
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  });

  return dataSource.initialize();
}

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_DATASOURCE,
      useFactory: createDataSource,
    },
  ],
  exports: [DATABASE_DATASOURCE],
})
export class DatabaseModule {}
