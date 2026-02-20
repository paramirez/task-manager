import { TaskReportRepository } from '@/modules/reporting/application/ports/TaskReportRepository';
import { CompletedTasksReport } from '@/modules/reporting/domain/CompletedTasksReport';
import { PromiseResult, Result } from '@/shared/core/result';
import { Collection } from 'mongodb';

interface CompletedTasksReportDocument {
  id: string;
  generatedAt: Date;
  completedTasks: number;
}

export class TaskReportMongoAdapter implements TaskReportRepository {
  constructor(
    private readonly collection: Collection<CompletedTasksReportDocument>,
  ) {}

  async saveCompletedReport(
    report: CompletedTasksReport,
  ): PromiseResult<void, Error> {
    try {
      await this.collection.insertOne({
        id: report.id,
        generatedAt: new Date(report.generatedAt),
        completedTasks: report.completedTasks,
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async listCompletedReports(): PromiseResult<CompletedTasksReport[], Error> {
    try {
      const documents = await this.collection
        .find({})
        .sort({ generatedAt: -1, id: -1 })
        .toArray();
      return Result.ok(
        documents.map((document) => ({
          id: document.id,
          generatedAt: new Date(document.generatedAt),
          completedTasks: document.completedTasks,
        })),
      );
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
