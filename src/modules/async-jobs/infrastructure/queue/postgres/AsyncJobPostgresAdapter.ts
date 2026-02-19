import { AsyncJobQueue } from '@/modules/async-jobs/application/ports/AsyncJobQueue';
import {
  AsyncJob,
  EnqueueAsyncJobInput,
} from '@/modules/async-jobs/domain/AsyncJob';
import { PromiseResult, Result } from '@/shared/core/result';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { AsyncJobEntity } from './AsyncJobEntity';

export class AsyncJobPostgresAdapter implements AsyncJobQueue {
  constructor(private readonly repository: Repository<AsyncJobEntity>) {}

  async enqueue(input: EnqueueAsyncJobInput): PromiseResult<string, Error> {
    try {
      const id = crypto.randomUUID();
      const now = new Date();
      const entity = this.repository.create({
        id,
        type: input.type,
        payload: input.payload,
        runAt: input.runAt ? new Date(input.runAt) : now,
        status: 'pending',
        createdAt: now,
        processedAt: null,
        failureReason: null,
      });
      await this.repository.save(entity);
      return Result.ok(id);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async dequeueReady(
    limit: number,
    now: Date,
  ): PromiseResult<AsyncJob[], Error> {
    try {
      if (limit <= 0) return Result.ok([]);

      const ready = await this.repository.find({
        where: {
          status: 'pending',
          runAt: LessThanOrEqual(now),
          processedAt: IsNull(),
        },
        order: { runAt: 'ASC', createdAt: 'ASC', id: 'ASC' },
        take: limit,
      });

      for (const job of ready) {
        job.status = 'processing';
        job.failureReason = null;
      }
      await this.repository.save(ready);

      return Result.ok(ready.map((entity) => this.toDomain(entity)));
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async markCompleted(jobId: string): PromiseResult<void, Error> {
    try {
      const result = await this.repository.update(
        { id: jobId },
        {
          status: 'completed',
          processedAt: new Date(),
          failureReason: null,
        },
      );
      if (!result.affected) return Result.fail(new Error('JOB_NOT_FOUND'));
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async markFailed(jobId: string, reason: string): PromiseResult<void, Error> {
    try {
      const result = await this.repository.update(
        { id: jobId },
        {
          status: 'failed',
          processedAt: new Date(),
          failureReason: reason,
        },
      );
      if (!result.affected) return Result.fail(new Error('JOB_NOT_FOUND'));
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private toDomain(entity: AsyncJobEntity): AsyncJob {
    return {
      id: entity.id,
      type: entity.type,
      payload: entity.payload,
      runAt: new Date(entity.runAt),
      status: entity.status,
      createdAt: new Date(entity.createdAt),
      processedAt: entity.processedAt
        ? new Date(entity.processedAt)
        : undefined,
      failureReason: entity.failureReason ?? undefined,
    };
  }
}
