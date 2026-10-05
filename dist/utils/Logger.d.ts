export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}
/**
 * Tiện ích ghi log hệ thống ra console và file
 */
export declare class Logger {
    private static logFilePath;
    static setLogFile(filePath: string): void;
    private static log;
    static debug(message: string, context?: string, data?: any): void;
    static info(message: string, context?: string, data?: any): void;
    static warn(message: string, context?: string, data?: any): void;
    static error(message: string, context?: string, data?: any): void;
}
