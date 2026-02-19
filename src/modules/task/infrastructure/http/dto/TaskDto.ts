import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const;

export class CreateTaskDTO {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}

export class UpdateTaskDTO {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsIn(TASK_STATUSES)
  status!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}

export class PatchTaskDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}

export class ScheduleTaskDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minutesBeforeDueDate?: number;
}

export interface TaskDTO {
  id: string;
  title: string;
  status?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}
