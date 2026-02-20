import { Module } from '@nestjs/common';
import { CqrsModule } from '@/bootstrap/cqrs/cqrs.module';
import { DatabaseModule } from '@/bootstrap/database/DatabaseModule';
import { HealthModule } from '@/bootstrap/health/health.module';
import { TaskModule } from '@/modules/task/infrastructure/task.module';
import { AsyncJobsModule } from '@/modules/async-jobs/infrastructure/async-jobs.module';
import { NotificationModule } from '@/modules/notification/infrastructure/notification.module';
import { ReportingModule } from '@/modules/reporting/infrastructure/reporting.module';
import { AsyncJobsWorker } from '@/bootstrap/workers/AsyncJobsWorker';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    NotificationModule,
    ReportingModule,
    TaskModule,
    AsyncJobsModule,
    CqrsModule,
  ],
  providers: [AsyncJobsWorker],
})
export class AppModule {}
