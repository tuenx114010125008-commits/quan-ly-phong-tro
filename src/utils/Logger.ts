import * as fs from 'fs';
import * as path from 'path';
import { Formatter } from './Formatter';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Tiện ích ghi log hệ thống ra console và file
 */
export class Logger {
  private static logFilePath: string = path.join(process.cwd(), 'app.log');

  public static setLogFile(filePath: string): void {
    this.logFilePath = filePath;
  }

  private static log(level: LogLevel, message: string, context?: string, data?: any): void {
    const timestamp = Formatter.formatDateTime(new Date());
    const contextStr = context ? `[${context}]` : '';
    const logMessage = `[${timestamp}] [${level.padEnd(5)}] ${contextStr} ${message}`;

    // Console output with colors
    switch (level) {
      case LogLevel.DEBUG:
        console.log(`\x1b[90m${logMessage}\x1b[0m`);
        break;
      case LogLevel.INFO:
        console.log(`\x1b[36m${logMessage}\x1b[0m`);
        break;
      case LogLevel.WARN:
        console.log(`\x1b[33m${logMessage}\x1b[0m`);
        break;
      case LogLevel.ERROR:
        console.log(`\x1b[31m${logMessage}\x1b[0m`);
        break;
    }

    if (data) {
      console.log(data);
    }

    // Ghi file log
    try {
      const fileEntry = `${logMessage} ${data ? JSON.stringify(data) : ''}\n`;
      fs.appendFileSync(this.logFilePath, fileEntry, 'utf-8');
    } catch {
      // Bỏ qua lỗi ghi file nếu quyền truy cập bị hạn chế
    }
  }

  public static debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  public static info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  public static warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  public static error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }
}
