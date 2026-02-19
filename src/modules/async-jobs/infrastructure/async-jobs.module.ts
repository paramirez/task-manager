import { Module } from '@nestjs/common';
import { DATABASE_DATASOURCE } from '@/bootstrap/database/DatabaseModule';
import { AsyncJobsController } from '@/modules/async-jobs/infrastructure/http/controllers/AsyncJobsController';
import { ASYNC_JOB_QUEUE } from '@/modules/async-jobs/application/ports/AsyncJobQueue';
import { AsyncJobEntity } from '@/modules/async-jobs/infrastructure/queue/postgres/AsyncJobEntity';
import { AsyncJobPostgresAdapter } from '@/modules/async-jobs/infrastructure/queue/postgres/AsyncJobPostgresAdapter';
import { DataSource } from 'typeorm';

@Module({
  controllers: [AsyncJobsController],
  providers: [
    {
      provide: ASYNC_JOB_QUEUE,
      useFactory(dataSource: DataSource) {
        return new AsyncJobPostgresAdapter(
          dataSource.getRepository(AsyncJobEntity),
        );
      },
      inject: [DATABASE_DATASOURCE],
    },
  ],
  exports: [ASYNC_JOB_QUEUE],
})
export class AsyncJobsModule {}
