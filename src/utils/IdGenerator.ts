/**
 * Bộ sinh mã ID tự động có tiền tố theo chuẩn
 * VD: P001, KH001, DV001, TB001, USR001, HD001, INV001
 */
export class IdGenerator {
  private static counters: Map<string, number> = new Map();

  /**
   * Sinh ID mới với tiền tố prefix
   */
  public static generate(prefix: string, padding: number = 3): string {
    const current = (this.counters.get(prefix) || 0) + 1;
    this.counters.set(prefix, current);
    return `${prefix}${String(current).padStart(padding, '0')}`;
  }

  /**
   * Đồng bộ bộ đếm từ dữ liệu đã có trong DB
   */
  public static syncFromExistingIds(prefix: string, ids: string[]): void {
    let max = 0;
    const regex = new RegExp(`^${prefix}(\\d+)$`);
    for (const id of ids) {
      const match = id.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    }
    this.counters.set(prefix, max);
  }

  /**
   * Reset counter
   */
  public static reset(prefix?: string): void {
    if (prefix) {
      this.counters.delete(prefix);
    } else {
      this.counters.clear();
    }
  }
}
