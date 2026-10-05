import * as readline from 'readline';

/**
 * Tiện ích đọc dữ liệu nhập từ bàn phím trên Console
 */
export class InputPrompt {
  private static rl: readline.Interface | null = null;

  private static getInterface(): readline.Interface {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
    return this.rl;
  }

  public static ask(question: string): Promise<string> {
    const rl = this.getInterface();
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  public static async askNumber(question: string, defaultValue?: number): Promise<number> {
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

  public static async pause(message: string = '\nNhấn phím [Enter] để tiếp tục...'): Promise<void> {
    await this.ask(message);
  }

  public static close(): void {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}
