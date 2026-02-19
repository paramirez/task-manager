import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/bootstrap/app.module';

describe('HTTP adapters (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/tasks (GET)', () => {
    return request(app.getHttpServer()).get('/tasks').expect(200).expect([]);
  });

  it('/outbox/dispatch (POST)', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Dispatch me' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/outbox/dispatch')
      .expect(201)
      .expect({
        total: 1,
        processed: 1,
        failed: 0,
        failures: [],
      });
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

  it('/jobs/task-reminders/:taskId + /jobs/process (POST)', async () => {
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
      .post(`/jobs/task-reminders/${createdTask.id}`)
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
});
