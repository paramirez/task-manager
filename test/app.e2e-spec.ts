import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/bootstrap/app.module';
import { DATABASE_DB } from '@/bootstrap/database/DatabaseModule';
import { setupApplication } from '@/bootstrap/app.setup';
import { Db } from 'mongodb';

describe('HTTP adapters (e2e)', () => {
  let app: INestApplication<App>;
  const previousEnv = {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    SQS_ENDPOINT: process.env.SQS_ENDPOINT,
    ASYNC_JOBS_SQS_QUEUE_NAME: process.env.ASYNC_JOBS_SQS_QUEUE_NAME,
    WORKER_ENABLED: process.env.WORKER_ENABLED,
  };

  beforeAll(() => {
    process.env.WORKER_ENABLED = 'false';
    process.env.AWS_REGION ??= 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID ??= 'test';
    process.env.AWS_SECRET_ACCESS_KEY ??= 'test';
    process.env.SQS_ENDPOINT ??= 'http://localhost:4566';
    process.env.ASYNC_JOBS_SQS_QUEUE_NAME ??= 'async-jobs';
  });

  afterAll(() => {
    if (previousEnv.AWS_REGION === undefined) delete process.env.AWS_REGION;
    else process.env.AWS_REGION = previousEnv.AWS_REGION;
    if (previousEnv.AWS_ACCESS_KEY_ID === undefined)
      delete process.env.AWS_ACCESS_KEY_ID;
    else process.env.AWS_ACCESS_KEY_ID = previousEnv.AWS_ACCESS_KEY_ID;
    if (previousEnv.AWS_SECRET_ACCESS_KEY === undefined)
      delete process.env.AWS_SECRET_ACCESS_KEY;
    else process.env.AWS_SECRET_ACCESS_KEY = previousEnv.AWS_SECRET_ACCESS_KEY;
    if (previousEnv.SQS_ENDPOINT === undefined) delete process.env.SQS_ENDPOINT;
    else process.env.SQS_ENDPOINT = previousEnv.SQS_ENDPOINT;
    if (previousEnv.ASYNC_JOBS_SQS_QUEUE_NAME === undefined)
      delete process.env.ASYNC_JOBS_SQS_QUEUE_NAME;
    else
      process.env.ASYNC_JOBS_SQS_QUEUE_NAME =
        previousEnv.ASYNC_JOBS_SQS_QUEUE_NAME;
    if (previousEnv.WORKER_ENABLED === undefined)
      delete process.env.WORKER_ENABLED;
    else process.env.WORKER_ENABLED = previousEnv.WORKER_ENABLED;
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApplication(app);
    await app.init();

    const db = app.get<Db>(DATABASE_DB);
    await Promise.all([
      db.collection('tasks').deleteMany({}),
      db.collection('completed_tasks_reports').deleteMany({}),
    ]);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/docs/json (GET)', async () => {
    await request(app.getHttpServer())
      .get('/docs/json')
      .expect(200)
      .expect((response) => {
        const body = response.body as { openapi?: string };
        if (typeof body.openapi !== 'string') {
          throw new Error('OpenAPI document not available');
        }
      });
  });

  it('/tasks (GET)', () => {
    return request(app.getHttpServer()).get('/tasks').expect(200).expect([]);
  });

  it('/jobs/reports/completed-tasks + /jobs/process (POST)', async () => {
    await request(app.getHttpServer())
      .post('/jobs/reports/completed-tasks')
      .send({ requestedBy: 'api-test' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/jobs/process')
      .send({ limit: 10 })
      .expect(201)
      .expect({
        dequeued: 1,
        processed: 1,
        failed: 0,
      });
  });

  it('/tasks/:id/schedule + /jobs/process (POST)', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Due date reminder',
        dueDate: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      })
      .expect(201);

    const taskListResponse = await request(app.getHttpServer())
      .get('/tasks')
      .expect(200);
    const responseBody: unknown = taskListResponse.body;
    const tasks = Array.isArray(responseBody) ? responseBody : [];
    const createdTask = tasks.find(
      (task: unknown) =>
        typeof task === 'object' &&
        task !== null &&
        'title' in task &&
        (task as { title: string }).title === 'Due date reminder',
    ) as { id: string } | undefined;

    if (!createdTask) {
      throw new Error('Task not found after creation');
    }

    await request(app.getHttpServer())
      .post(`/tasks/${createdTask.id}/schedule`)
      .send({ minutesBeforeDueDate: 10 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/jobs/process')
      .send({ limit: 10 })
      .expect(201)
      .expect({
        dequeued: 1,
        processed: 1,
        failed: 0,
      });
  });

  it('PUT/PATCH/DELETE/GET status task flows', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task lifecycle',
        status: 'pending',
      })
      .expect(201);

    const listResponse = await request(app.getHttpServer())
      .get('/tasks')
      .expect(200);
    const tasks = Array.isArray(listResponse.body) ? listResponse.body : [];
    const createdTask = tasks.find(
      (task: unknown) =>
        typeof task === 'object' &&
        task !== null &&
        'title' in task &&
        (task as { title: string }).title === 'Task lifecycle',
    ) as { id: string } | undefined;
    if (!createdTask) throw new Error('Task not found for lifecycle test');

    await request(app.getHttpServer())
      .put(`/tasks/${createdTask.id}`)
      .send({
        title: 'Task lifecycle updated',
        status: 'in_progress',
        description: 'all fields updated',
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/tasks/${createdTask.id}`)
      .send({ status: 'completed' })
      .expect(200);

    await request(app.getHttpServer())
      .get('/tasks/status/completed')
      .expect(200)
      .expect((response) => {
        const body = Array.isArray(response.body) ? response.body : [];
        if (!body.some((task: { id: string }) => task.id === createdTask.id)) {
          throw new Error('Expected task in completed status list');
        }
      });

    await request(app.getHttpServer())
      .delete(`/tasks/${createdTask.id}`)
      .expect(200);
  });
});
