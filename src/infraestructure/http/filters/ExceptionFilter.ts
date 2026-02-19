import { BusinessError } from "@/domain/errors/BusinessError";
import { ValidationError } from "@/domain/errors/ValidationError";
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch(ValidationError)
export class ValidationErrorFilter implements ExceptionFilter {
    catch(exception: ValidationError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const statusCode = HttpStatus.BAD_REQUEST;

        response
            .status(statusCode)
            .json({
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

        response
            .status(statusCode)
            .json({
                statusCode,
                timestamp: new Date().toISOString(),
                path: request.url,
            });
    }
}