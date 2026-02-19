import { Module } from '@nestjs/common';
import { HealthController } from '@/bootstrap/health/health.controller';
import { NotificationModule } from '@/modules/notification/infrastructure/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [HealthController],
})
export class HealthModule {}
