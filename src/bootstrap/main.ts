import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApplication } from '@/bootstrap/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApplication(app);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
