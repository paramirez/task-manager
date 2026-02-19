import {
  AsyncJob,
  EnqueueAsyncJobInput,
} from '@/modules/async-jobs/domain/AsyncJob';
import { AsyncJobQueue } from '@/modules/async-jobs/application/ports/AsyncJobQueue';
import { PromiseResult, Result } from '@/shared/core/result';

export class InMemoryAsyncJobQueue implements AsyncJobQueue {
  private readonly jobs: AsyncJob[] = [];

  enqueue(input: EnqueueAsyncJobInput): PromiseResult<string, Error> {
    const id = crypto.randomUUID();
    this.jobs.push({
      id,
      type: input.type,
      payload: input.payload,
      runAt: input.runAt ? new Date(input.runAt) : new Date(),
      status: 'pending',
      createdAt: new Date(),
    });
    return Promise.resolve(Result.ok(id));
  }

  dequeueReady(limit: number, now: Date): PromiseResult<AsyncJob[], Error> {
    const ready = this.jobs
      .filter(
        (job) =>
          job.status === 'pending' && job.runAt.getTime() <= now.getTime(),
      )
      .slice(0, limit);

    for (const job of ready) {
      job.status = 'processing';
    }

    return Promise.resolve(
      Result.ok(
        ready.map((job) => ({
          ...job,
          runAt: new Date(job.runAt),
          createdAt: new Date(job.createdAt),
          processedAt: job.processedAt ? new Date(job.processedAt) : undefined,
        })),
      ),
    );
  }

  markCompleted(jobId: string): PromiseResult<void, Error> {
    const job = this.jobs.find((candidate) => candidate.id === jobId);
    if (!job) return Promise.resolve(Result.fail(new Error('JOB_NOT_FOUND')));

    job.status = 'completed';
    job.processedAt = new Date();
    job.failureReason = undefined;
    return Promise.resolve(Result.ok(undefined));
  }

  markFailed(jobId: string, reason: string): PromiseResult<void, Error> {
    const job = this.jobs.find((candidate) => candidate.id === jobId);
    if (!job) return Promise.resolve(Result.fail(new Error('JOB_NOT_FOUND')));

    job.status = 'failed';
    job.processedAt = new Date();
    job.failureReason = reason;
    return Promise.resolve(Result.ok(undefined));
  }
}
