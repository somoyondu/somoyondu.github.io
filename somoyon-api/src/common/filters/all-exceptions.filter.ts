import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message: any = 'Something went wrong';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      code = res?.code || exception.name.replace('Exception', '').toUpperCase();
      message = res?.message ?? exception.message;
      if (Array.isArray(message)) {
        details = message;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
      }
    } else if (exception instanceof MongooseError.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      message = 'Validation failed';
      details = Object.values(exception.errors).map((e: any) => e.message);
    } else if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'INVALID_ID';
      message = `Invalid value for '${(exception as any).path}'`;
    } else if ((exception as MongoServerError)?.code === 11000) {
      status = HttpStatus.CONFLICT;
      code = 'DUPLICATE_KEY';
      const key = Object.keys((exception as MongoServerError).keyValue || {})[0];
      message = `A record with this ${key || 'value'} already exists`;
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        (exception as Error)?.stack,
      );
    }

    response.status(status).json({
      success: false,
      error: { code, message, details },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
