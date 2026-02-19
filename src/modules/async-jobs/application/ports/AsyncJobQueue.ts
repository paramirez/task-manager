import { PromiseResult } from '@/shared/core/result';
import {
  AsyncJob,
  EnqueueAsyncJobInput,
} from '@/modules/async-jobs/domain/AsyncJob';

export const ASYNC_JOB_QUEUE = Symbol('ASYNC_JOB_QUEUE');

export interface AsyncJobQueue {
  enqueue(input: EnqueueAsyncJobInput): PromiseResult<string, Error>;
  dequeueReady(limit: number, now: Date): PromiseResult<AsyncJob[], Error>;
  markCompleted(jobId: string): PromiseResult<void, Error>;
  markFailed(jobId: string, reason: string): PromiseResult<void, Error>;
}
