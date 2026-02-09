import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CustomLogger extends Logger {
  log(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    super.log('[' + timestamp + '] ' + message, context);
  }

  error(message: string, trace?: string, context?: string) {
    const timestamp = new Date().toISOString();
    super.error('[' + timestamp + '] ' + message, trace, context);
  }

  warn(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    super.warn('[' + timestamp + '] ' + message, context);
  }

  debug(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    super.debug('[' + timestamp + '] ' + message, context);
  }
}
