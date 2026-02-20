import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  BusinessErrorFilter,
  UnhandledErrorFilter,
  ValidationErrorFilter,
} from '@/bootstrap/http/filters/ExceptionFilter';

export function setupApplication(app: INestApplication) {
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription(
      'API REST para gestión de tareas y procesamiento asíncrono con SQS',
    )
    .setVersion('1.0.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    jsonDocumentUrl: 'docs/json',
  });
}
