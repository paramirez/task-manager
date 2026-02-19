import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

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
});
