import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BusinessErrorFilter,
  ValidationErrorFilter,
} from './infraestructure/http/filters/ExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ValidationErrorFilter(), new BusinessErrorFilter());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
