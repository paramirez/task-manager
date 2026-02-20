import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ScheduleReminderDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minutesBeforeDueDate?: number;
}

export class EnqueueReportDto {
  @IsOptional()
  @IsString()
  requestedBy?: string;
}

export class ProcessJobsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
