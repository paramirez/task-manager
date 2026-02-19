import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'outbox_messages' })
export class OutboxMessageEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  type!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt!: Date | null;
}
