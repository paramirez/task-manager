import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BusinessErrorFilter,
  UnhandledErrorFilter,
  ValidationErrorFilter,
} from './http/filters/ExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(
    new ValidationErrorFilter(),
    new BusinessErrorFilter(),
    new UnhandledErrorFilter(),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
