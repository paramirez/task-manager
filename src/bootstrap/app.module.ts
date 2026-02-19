import { Module } from '@nestjs/common';
import { CqrsModule } from '@/bootstrap/cqrs/cqrs.module';
import { DatabaseModule } from '@/bootstrap/database/DatabaseModule';
import { TaskModule } from '@/modules/task/infrastructure/task.module';
import { OutboxModule } from '@/modules/outbox/infrastructure/outbox.module';
import { AsyncJobsModule } from '@/modules/async-jobs/infrastructure/async-jobs.module';
import { NotificationModule } from '@/modules/notification/infrastructure/notification.module';
import { ReportingModule } from '@/modules/reporting/infrastructure/reporting.module';

@Module({
  imports: [
    DatabaseModule,
    NotificationModule,
    ReportingModule,
    TaskModule,
    OutboxModule,
    AsyncJobsModule,
    CqrsModule,
  ],
})
export class AppModule {}
