import { TaskReportRepository } from '@/modules/reporting/application/ports/TaskReportRepository';
import { CompletedTasksReport } from '@/modules/reporting/domain/CompletedTasksReport';
import { PromiseResult, Result } from '@/shared/core/result';
import { Repository } from 'typeorm';
import { CompletedTasksReportEntity } from './CompletedTasksReportEntity';

export class TaskReportPostgresAdapter implements TaskReportRepository {
  constructor(
    private readonly repository: Repository<CompletedTasksReportEntity>,
  ) {}

  async saveCompletedReport(
    report: CompletedTasksReport,
  ): PromiseResult<void, Error> {
    try {
      const entity = this.repository.create({
        id: report.id,
        generatedAt: new Date(report.generatedAt),
        completedTasks: report.completedTasks,
      });
      await this.repository.save(entity);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async listCompletedReports(): PromiseResult<CompletedTasksReport[], Error> {
    try {
      const entities = await this.repository.find({
        order: { generatedAt: 'DESC', id: 'DESC' },
      });
      return Result.ok(
        entities.map((entity) => ({
          id: entity.id,
          generatedAt: new Date(entity.generatedAt),
          completedTasks: entity.completedTasks,
        })),
      );
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
