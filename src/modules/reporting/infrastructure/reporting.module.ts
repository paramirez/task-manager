import { Module } from '@nestjs/common';
import { DATABASE_DB } from '@/bootstrap/database/DatabaseModule';
import { TASK_REPORT_REPOSITORY } from '@/modules/reporting/application/ports/TaskReportRepository';
import { TaskReportMongoAdapter } from '@/modules/reporting/infrastructure/persistence/mongo/TaskReportMongoAdapter';
import { Db } from 'mongodb';

@Module({
  providers: [
    {
      provide: TASK_REPORT_REPOSITORY,
      useFactory(db: Db) {
        return new TaskReportMongoAdapter(
          db.collection('completed_tasks_reports'),
        );
      },
      inject: [DATABASE_DB],
    },
  ],
  exports: [TASK_REPORT_REPOSITORY],
})
export class ReportingModule {}
