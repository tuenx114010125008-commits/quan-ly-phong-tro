/**
 * Tiện ích định dạng dữ liệu cho Console
 */
export declare class Formatter {
    /**
     * Định dạng tiền tệ Việt Nam (VD: 3.500.000 VNĐ)
     */
    static formatCurrency(amount: number): string;
    /**
     * Định dạng ngày tháng (VD: 05/10/2026)
     */
    static formatDate(date: Date | string | undefined): string;
    /**
     * Định dạng ngày giờ chi tiết (VD: 05/10/2026 18:30:00)
     */
    static formatDateTime(date: Date | string | undefined): string;
    /**
     * Định dạng trạng thái sang chuỗi tiếng Việt dễ hiểu
     */
    static formatStatus(status: string): string;
    /**
     * Hiển thị bảng dạng Console Table đẹp mắt
     */
    static formatTable(headers: string[], rows: (string | number)[][]): void;
}
