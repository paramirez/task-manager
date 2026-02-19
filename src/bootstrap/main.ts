import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BusinessErrorFilter,
  UnhandledErrorFilter,
  ValidationErrorFilter,
} from './http/filters/ExceptionFilter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(
    new ValidationErrorFilter(),
    new BusinessErrorFilter(),
    new UnhandledErrorFilter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
