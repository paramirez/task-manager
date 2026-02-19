import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tasks' })
export class TaskEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  assignedTo!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate!: Date | null;
}
