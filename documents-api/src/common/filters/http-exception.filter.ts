import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || 'Error';
        details = (exceptionResponse as any);
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.stack);
    } else {
      this.logger.error('Unknown error:', exception);
    }

    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { details }),
    };

    this.logger.error(
      `[${status}] ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.code(status).send(errorResponse);
  }
}
