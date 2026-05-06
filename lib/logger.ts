/**
 * Simple logger for production monitoring
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogData {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, any>;
}

export class Logger {
  private static formatLog(data: LogData): string {
    return JSON.stringify({
      ...data,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  }

  static info(message: string, context?: Record<string, any>) {
    console.log(this.formatLog({ message, level: 'info', timestamp: new Date().toISOString(), context }));
  }

  static warn(message: string, context?: Record<string, any>) {
    console.warn(this.formatLog({ message, level: 'warn', timestamp: new Date().toISOString(), context }));
  }

  static error(message: string, error?: Error, context?: Record<string, any>) {
    console.error(this.formatLog({
      message,
      level: 'error',
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        error: error?.message,
        stack: error?.stack,
      },
    }));
  }

  // User actions for analytics
  static userAction(action: string, userId: string, metadata?: Record<string, any>) {
    this.info(`User action: ${action}`, { userId, ...metadata });
  }
}
