import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const resp = exception.getResponse();
      if (typeof resp === 'string') {
        message = resp;
      } else if (typeof resp === 'object' && resp !== null) {
        message = (resp as any).message ?? message;
        code = (resp as any).code ?? this.httpStatusToCode(statusCode);
      }
      code = this.httpStatusToCode(statusCode);
    } else if (exception instanceof ZodError) {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      code = 'VALIDATION_ERROR';
      message = 'Validation failed';
      details = exception.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      statusCode = this.prismaErrorToStatus(exception.code);
      code = `PRISMA_${exception.code}`;
      message = this.prismaErrorToMessage(exception);
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.message, exception.stack);
    }

    const errorResponse = {
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId: (request as any).id ?? undefined,
      },
    };

    this.logger.warn(
      `${request.method} ${request.url} → ${statusCode} [${code}]`,
    );

    response.status(statusCode).json(errorResponse);
  }

  private httpStatusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return map[status] ?? 'INTERNAL_SERVER_ERROR';
  }

  private prismaErrorToStatus(code: string): number {
    const map: Record<string, number> = {
      P2002: 409, // Unique constraint
      P2025: 404, // Record not found
      P2003: 400, // Foreign key constraint
    };
    return map[code] ?? 500;
  }

  private prismaErrorToMessage(err: Prisma.PrismaClientKnownRequestError): string {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[])?.join(', ');
      return `Duplicate value for field(s): ${fields}`;
    }
    if (err.code === 'P2025') return 'Record not found';
    return 'Database error';
  }
}
