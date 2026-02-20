import { Global, Module } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

export const DATABASE_CLIENT = Symbol('DATABASE_CLIENT');
export const DATABASE_DB = Symbol('DATABASE_DB');

const DEFAULT_MONGO_URI = 'mongodb://localhost:27017';
const DEFAULT_MONGO_DB = 'appdb';

async function createMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGO_URI ?? DEFAULT_MONGO_URI;
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: Number(
      process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS ?? 5000,
    ),
  });
  await client.connect();
  return client;
}

async function createMongoDb(client: MongoClient): Promise<Db> {
  const db = client.db(process.env.MONGO_DB ?? DEFAULT_MONGO_DB);

  await Promise.all([
    db.collection('tasks').createIndex({ id: 1 }, { unique: true }),
    db.collection('tasks').createIndex({ status: 1 }),
    db.collection('tasks').createIndex({ dueDate: 1 }),
    db.collection('outbox_messages').createIndex({ id: 1 }, { unique: true }),
    db
      .collection('outbox_messages')
      .createIndex({ processedAt: 1, occurredAt: 1 }),
    db
      .collection('completed_tasks_reports')
      .createIndex({ id: 1 }, { unique: true }),
    db.collection('completed_tasks_reports').createIndex({ generatedAt: -1 }),
  ]);

  return db;
}

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CLIENT,
      useFactory: createMongoClient,
    },
    {
      provide: DATABASE_DB,
      useFactory: createMongoDb,
      inject: [DATABASE_CLIENT],
    },
  ],
  exports: [DATABASE_CLIENT, DATABASE_DB],
})
export class DatabaseModule {}
