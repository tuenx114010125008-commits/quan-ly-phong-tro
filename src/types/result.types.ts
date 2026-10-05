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
export function successResponse<T>(data: T, message: string = 'Thành công'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date()
  };
}

/**
 * Hàm trợ giúp tạo ApiResponse thất bại
 */
export function errorResponse<T = undefined>(message: string, errors?: string[]): ApiResponse<T> {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date()
  };
}
