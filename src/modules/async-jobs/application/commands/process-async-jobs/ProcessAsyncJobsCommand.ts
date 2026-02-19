import { Command } from '@/shared/cqrs/CqrsTypes';

export const PROCESS_ASYNC_JOBS_COMMAND = 'async_jobs.process';

export interface ProcessAsyncJobsCommand extends Command {
  kind: typeof PROCESS_ASYNC_JOBS_COMMAND;
  limit?: number;
}
