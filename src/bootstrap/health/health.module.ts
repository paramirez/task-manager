import { Module } from '@nestjs/common';
import { HealthController } from '@/bootstrap/health/health.controller';
import { NotificationModule } from '@/modules/notification/infrastructure/notification.module';
import { AsyncJobsModule } from '@/modules/async-jobs/infrastructure/async-jobs.module';

@Module({
  imports: [NotificationModule, AsyncJobsModule],
  controllers: [HealthController],
})
export class HealthModule {}
