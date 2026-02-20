import { BusinessError } from '@/shared/domain/BusinessError';
import { ValidationError } from '@/shared/domain/ValidationError';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(ValidationError)
export class ValidationErrorFilter implements ExceptionFilter {
  catch(exception: ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = HttpStatus.BAD_REQUEST;

    response.status(statusCode).json({
      code: exception.code,
      message: exception.message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

@Catch(BusinessError)
export class BusinessErrorFilter implements ExceptionFilter {
  catch(exception: BusinessError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = HttpStatus.UNPROCESSABLE_ENTITY;

    response.status(statusCode).json({
      code: exception.code,
      message: exception.message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

@Catch(Error)
export class UnhandledErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof ValidationError) {
      const statusCode = HttpStatus.BAD_REQUEST;
      response.status(statusCode).json({
        code: exception.code,
        message: exception.message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    if (exception instanceof BusinessError) {
      const statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      response.status(statusCode).json({
        code: exception.code,
        message: exception.message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    const statusCode = HttpStatus.SERVICE_UNAVAILABLE;
    response.status(statusCode).json({
      code: 'TEMPORARY_UNAVAILABLE',
      message: exception.message || 'Service temporarily unavailable',
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
