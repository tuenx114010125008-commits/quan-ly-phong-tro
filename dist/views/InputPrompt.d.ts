/**
 * Tiện ích đọc dữ liệu nhập từ bàn phím trên Console
 */
export declare class InputPrompt {
    private static rl;
    private static getInterface;
    static ask(question: string): Promise<string>;
    static askNumber(question: string, defaultValue?: number): Promise<number>;
    static pause(message?: string): Promise<void>;
    static close(): void;
}
