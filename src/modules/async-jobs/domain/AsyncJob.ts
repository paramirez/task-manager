export type AsyncJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AsyncJob {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  runAt: Date;
  status: AsyncJobStatus;
  createdAt: Date;
  processedAt?: Date;
  failureReason?: string;
}

export interface EnqueueAsyncJobInput {
  type: string;
  payload: Record<string, unknown>;
  runAt?: Date;
}
