"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
/**
 * Hàm trợ giúp tạo ApiResponse thành công
 */
function successResponse(data, message = 'Thành công') {
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
function errorResponse(message, errors) {
    return {
        success: false,
        message,
        errors,
        timestamp: new Date()
    };
}
//# sourceMappingURL=result.types.js.map