/**
 * Kết quả trả về chuẩn của các thao tác Service / Action
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
    timestamp: Date;
}
/**
 * Hàm trợ giúp tạo ApiResponse thành công
 */
export declare function successResponse<T>(data: T, message?: string): ApiResponse<T>;
/**
 * Hàm trợ giúp tạo ApiResponse thất bại
 */
export declare function errorResponse<T = undefined>(message: string, errors?: string[]): ApiResponse<T>;
