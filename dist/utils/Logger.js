"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Formatter_1 = require("./Formatter");
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Tiện ích ghi log hệ thống ra console và file
 */
class Logger {
    static logFilePath = path.join(process.cwd(), 'app.log');
    static setLogFile(filePath) {
        this.logFilePath = filePath;
    }
    static log(level, message, context, data) {
        const timestamp = Formatter_1.Formatter.formatDateTime(new Date());
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
        }
        catch {
            // Bỏ qua lỗi ghi file nếu quyền truy cập bị hạn chế
        }
    }
    static debug(message, context, data) {
        this.log(LogLevel.DEBUG, message, context, data);
    }
    static info(message, context, data) {
        this.log(LogLevel.INFO, message, context, data);
    }
    static warn(message, context, data) {
        this.log(LogLevel.WARN, message, context, data);
    }
    static error(message, context, data) {
        this.log(LogLevel.ERROR, message, context, data);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map