import { CompletedTasksReport } from '@/modules/reporting/domain/CompletedTasksReport';
import { TaskReportRepository } from '@/modules/reporting/application/ports/TaskReportRepository';
import { PromiseResult, Result } from '@/shared/core/result';

export class InMemoryTaskReportRepository implements TaskReportRepository {
  private readonly reports: CompletedTasksReport[] = [];

  saveCompletedReport(
    report: CompletedTasksReport,
  ): PromiseResult<void, Error> {
    this.reports.push({
      ...report,
      generatedAt: new Date(report.generatedAt),
    });
    return Promise.resolve(Result.ok(undefined));
  }

  listCompletedReports(): PromiseResult<CompletedTasksReport[], Error> {
    return Promise.resolve(
      Result.ok(
        this.reports.map((report) => ({
          ...report,
          generatedAt: new Date(report.generatedAt),
        })),
      ),
    );
  }
}
