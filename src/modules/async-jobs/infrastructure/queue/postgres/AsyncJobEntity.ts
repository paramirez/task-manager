import type { AsyncJobStatus } from '@/modules/async-jobs/domain/AsyncJob';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'async_jobs' })
export class AsyncJobEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  type!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'timestamptz' })
  runAt!: Date;

  @Column({ type: 'varchar', length: 16 })
  status!: AsyncJobStatus;

  @Column({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  failureReason!: string | null;
}
