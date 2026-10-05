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
exports.InputPrompt = void 0;
const readline = __importStar(require("readline"));
/**
 * Tiện ích đọc dữ liệu nhập từ bàn phím trên Console
 */
class InputPrompt {
    static rl = null;
    static getInterface() {
        if (!this.rl) {
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
        }
        return this.rl;
    }
    static ask(question) {
        const rl = this.getInterface();
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }
    static async askNumber(question, defaultValue) {
        while (true) {
            const input = await this.ask(question);
            if (input === '' && defaultValue !== undefined) {
                return defaultValue;
            }
            const num = Number(input);
            if (!isNaN(num)) {
                return num;
            }
            console.log('\x1b[31m⚠️ Vui lòng nhập số hợp lệ!\x1b[0m');
        }
    }
    static async pause(message = '\nNhấn phím [Enter] để tiếp tục...') {
        await this.ask(message);
    }
    static close() {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
    }
}
exports.InputPrompt = InputPrompt;
//# sourceMappingURL=InputPrompt.js.map