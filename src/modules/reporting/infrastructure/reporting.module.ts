import { Module } from '@nestjs/common';
import { DATABASE_DATASOURCE } from '@/bootstrap/database/DatabaseModule';
import { TASK_REPORT_REPOSITORY } from '@/modules/reporting/application/ports/TaskReportRepository';
import { CompletedTasksReportEntity } from '@/modules/reporting/infrastructure/persistence/postgres/CompletedTasksReportEntity';
import { TaskReportPostgresAdapter } from '@/modules/reporting/infrastructure/persistence/postgres/TaskReportPostgresAdapter';
import { DataSource } from 'typeorm';

@Module({
  providers: [
    {
      provide: TASK_REPORT_REPOSITORY,
      useFactory(dataSource: DataSource) {
        return new TaskReportPostgresAdapter(
          dataSource.getRepository(CompletedTasksReportEntity),
        );
      },
      inject: [DATABASE_DATASOURCE],
    },
  ],
  exports: [TASK_REPORT_REPOSITORY],
})
export class ReportingModule {}
