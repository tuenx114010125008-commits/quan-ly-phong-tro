import * as readline from 'readline';

/**
 * BỘ TIỆN ÍCH NHẬP LIỆU BÀN PHÍM (InputPrompt)
 * 
 * 💡 Dễ hiểu cho người mới:
 * - Module readline của Node.js dùng để đọc dữ liệu khi người dùng gõ phím trên màn hình Console.
 * - Được bọc trong `Promise` (async/await) để code viết tuần tự, dễ đọc như: `const name = await InputPrompt.ask('Tên: ');`
 */
export class InputPrompt {
  private static rl: readline.Interface | null = null;

  /**
   * Khởi tạo giao diện đọc luồng nhập xuất chuẩn (stdin / stdout)
   */
  private static getInterface(): readline.Interface {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
    return this.rl;
  }

  /**
   * Hỏi một câu hỏi và chờ người dùng gõ câu trả lời + nhấn Enter
   */
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
