import { PromiseResult } from '@/shared/core/result';
import { CompletedTasksReport } from '@/modules/reporting/domain/CompletedTasksReport';

export const TASK_REPORT_REPOSITORY = Symbol('TASK_REPORT_REPOSITORY');

export interface TaskReportRepository {
  saveCompletedReport(report: CompletedTasksReport): PromiseResult<void, Error>;
  listCompletedReports(): PromiseResult<CompletedTasksReport[], Error>;
}
