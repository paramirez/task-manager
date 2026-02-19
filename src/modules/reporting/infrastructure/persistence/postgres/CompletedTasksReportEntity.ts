import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'completed_tasks_reports' })
export class CompletedTasksReportEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id!: string;

  @Column({ type: 'timestamptz' })
  generatedAt!: Date;

  @Column({ type: 'int' })
  completedTasks!: number;
}
