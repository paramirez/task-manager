import { Module } from '@nestjs/common';
import { DATABASE_DATASOURCE } from '@/bootstrap/database/DatabaseModule';
import { OutboxController } from '@/modules/outbox/infrastructure/http/controllers/OutboxController';
import { OUTBOX_REPOSITORY } from '@/modules/outbox/application/ports/OutboxRepository';
import { OutboxMessageEntity } from '@/modules/outbox/infrastructure/persistence/postgres/OutboxMessageEntity';
import { OutboxPostgresAdapter } from '@/modules/outbox/infrastructure/persistence/postgres/OutboxPostgresAdapter';
import { DataSource } from 'typeorm';

@Module({
  controllers: [OutboxController],
  providers: [
    {
      provide: OUTBOX_REPOSITORY,
      useFactory(dataSource: DataSource) {
        return new OutboxPostgresAdapter(
          dataSource.getRepository(OutboxMessageEntity),
        );
      },
      inject: [DATABASE_DATASOURCE],
    },
  ],
  exports: [OUTBOX_REPOSITORY],
})
export class OutboxModule {}
