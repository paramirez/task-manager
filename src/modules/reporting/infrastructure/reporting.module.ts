import { Module } from '@nestjs/common';
import { TASK_REPORT_REPOSITORY } from '@/modules/reporting/application/ports/TaskReportRepository';
import { InMemoryTaskReportRepository } from '@/modules/reporting/infrastructure/persistence/inmemory/InMemoryTaskReportRepository';

@Module({
  providers: [
    {
      provide: TASK_REPORT_REPOSITORY,
      useClass: InMemoryTaskReportRepository,
    },
  ],
  exports: [TASK_REPORT_REPOSITORY],
})
export class ReportingModule {}
