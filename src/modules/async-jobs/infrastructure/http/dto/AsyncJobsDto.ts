import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduleReminderDto {
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

export class EnqueueReportDto {
  @ApiPropertyOptional({ example: 'ops-user' })
  @IsOptional()
  @IsString()
  requestedBy?: string;
}

export class ProcessJobsDto {
  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class JobIdResponseDto {
  @ApiProperty({ example: '2f72d118-dfa7-4da4-8f1d-c9f300daff45' })
  jobId: string;
}

export class ProcessJobsResponseDto {
  @ApiProperty({ example: 1 })
  dequeued: number;

  @ApiProperty({ example: 1 })
  processed: number;

  @ApiProperty({ example: 0 })
  failed: number;
}
