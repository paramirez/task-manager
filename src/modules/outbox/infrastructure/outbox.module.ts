import { Module } from '@nestjs/common';
import { DATABASE_DB } from '@/bootstrap/database/DatabaseModule';
import { OutboxController } from '@/modules/outbox/infrastructure/http/controllers/OutboxController';
import { OUTBOX_REPOSITORY } from '@/modules/outbox/application/ports/OutboxRepository';
import { OutboxMongoAdapter } from '@/modules/outbox/infrastructure/persistence/mongo/OutboxMongoAdapter';
import { Db } from 'mongodb';

@Module({
  controllers: [OutboxController],
  providers: [
    {
      provide: OUTBOX_REPOSITORY,
      useFactory(db: Db) {
        return new OutboxMongoAdapter(db.collection('outbox_messages'));
      },
      inject: [DATABASE_DB],
    },
  ],
  exports: [OUTBOX_REPOSITORY],
})
export class OutboxModule {}
