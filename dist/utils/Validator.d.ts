/**
 * Tiện ích kiểm tra và xác thực dữ liệu
 */
export declare class Validator {
    /**
     * Kiểm tra chuỗi không rỗng
     */
    static isNotEmpty(val: string | null | undefined): boolean;
    /**
     * Kiểm tra số thực dương (> 0)
     */
    static isPositiveNumber(val: number): boolean;
    /**
     * Kiểm tra số không âm (>= 0)
     */
    static isNonNegativeNumber(val: number): boolean;
    /**
     * Kiểm tra số điện thoại Việt Nam (10 chữ số, bắt đầu bằng 0)
     */
    static isValidPhone(phone: string): boolean;
    /**
     * Kiểm tra số CCCD (12 chữ số)
     */
    static isValidCCCD(cccd: string): boolean;
    /**
     * Kiểm tra ngày tháng hợp lệ định dạng YYYY-MM-DD
     */
    static isValidDate(dateStr: string): boolean;
    /**
     * Kiểm tra ngày trong tương lai (sau ngày hôm nay)
     */
    static isDateInFuture(dateStr: string): boolean;
    /**
     * Kiểm tra ngày trong quá khứ
     */
    static isDateInPast(dateStr: string): boolean;
    /**
     * Kiểm tra số nằm trong khoảng [min, max]
     */
    static isInRange(val: number, min: number, max: number): boolean;
    /**
     * Kiểm tra họ tên hợp lệ (chỉ chứa chữ cái tiếng Việt / tiếng Anh và khoảng trắng)
     */
    static isValidFullName(name: string): boolean;
    /**
     * Hàm validate generic chạy chuỗi rules
     */
    static validate(rules: {
        condition: boolean;
        message: string;
    }[]): {
        isValid: boolean;
        errors: string[];
    };
}
