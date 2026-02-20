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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const;

export class CreateTaskDTO {
  @ApiProperty({ example: 'Preparar release' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    enum: TASK_STATUSES,
    default: 'pending',
    example: 'pending',
  })
  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: string;

  @ApiPropertyOptional({ example: 'Checklist final' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'rohan' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-02-25T15:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}

export class UpdateTaskDTO {
  @ApiProperty({ example: 'Preparar release' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ enum: TASK_STATUSES, example: 'in_progress' })
  @IsIn(TASK_STATUSES)
  status!: string;

  @ApiPropertyOptional({ example: 'Checklist final' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'rohan' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-02-25T15:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}

export class PatchTaskDTO {
  @ApiPropertyOptional({ example: 'Preparar release' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ enum: TASK_STATUSES, example: 'completed' })
  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: string;

  @ApiPropertyOptional({ example: 'Checklist final' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'rohan' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-02-25T15:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}

export class ScheduleTaskDTO {
  @ApiPropertyOptional({
    example: 30,
    description: 'Minutos antes de la dueDate para ejecutar el recordatorio',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minutesBeforeDueDate?: number;
}

export class TaskResponseDTO {
  @ApiProperty({ example: '8dcf9fcb-4bfd-4f25-bcf6-e808654d9782' })
  id: string;

  @ApiProperty({ example: 'Preparar release' })
  title: string;

  @ApiProperty({ enum: TASK_STATUSES, example: 'pending' })
  status?: string;

  @ApiPropertyOptional({ example: 'Checklist final' })
  description?: string;

  @ApiPropertyOptional({ example: 'rohan' })
  assignedTo?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-02-25T15:00:00.000Z',
  })
  dueDate?: Date;
}

export class ScheduleTaskResponseDTO {
  @ApiProperty({ example: '2f72d118-dfa7-4da4-8f1d-c9f300daff45' })
  jobId: string;
}
