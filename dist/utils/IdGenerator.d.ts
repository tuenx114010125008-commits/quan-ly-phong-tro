/**
 * Bộ sinh mã ID tự động có tiền tố theo chuẩn
 * VD: P001, KH001, DV001, TB001, USR001, HD001, INV001
 */
export declare class IdGenerator {
    private static counters;
    /**
     * Sinh ID mới với tiền tố prefix
     */
    static generate(prefix: string, padding?: number): string;
    /**
     * Đồng bộ bộ đếm từ dữ liệu đã có trong DB
     */
    static syncFromExistingIds(prefix: string, ids: string[]): void;
    /**
     * Reset counter
     */
    static reset(prefix?: string): void;
}
