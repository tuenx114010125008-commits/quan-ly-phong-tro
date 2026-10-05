"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
/**
 * Tiện ích kiểm tra và xác thực dữ liệu
 */
class Validator {
    /**
     * Kiểm tra chuỗi không rỗng
     */
    static isNotEmpty(val) {
        return val !== null && val !== undefined && val.trim().length > 0;
    }
    /**
     * Kiểm tra số thực dương (> 0)
     */
    static isPositiveNumber(val) {
        return typeof val === 'number' && !isNaN(val) && val > 0;
    }
    /**
     * Kiểm tra số không âm (>= 0)
     */
    static isNonNegativeNumber(val) {
        return typeof val === 'number' && !isNaN(val) && val >= 0;
    }
    /**
     * Kiểm tra số điện thoại Việt Nam (10 chữ số, bắt đầu bằng 0)
     */
    static isValidPhone(phone) {
        if (!phone)
            return false;
        const cleanPhone = phone.trim();
        return /^0\d{9}$/.test(cleanPhone);
    }
    /**
     * Kiểm tra số CCCD (12 chữ số)
     */
    static isValidCCCD(cccd) {
        if (!cccd)
            return false;
        const cleanCCCD = cccd.trim();
        return /^\d{12}$/.test(cleanCCCD);
    }
    /**
     * Kiểm tra ngày tháng hợp lệ định dạng YYYY-MM-DD
     */
    static isValidDate(dateStr) {
        if (!dateStr)
            return false;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
            return false;
        const d = new Date(dateStr);
        return d instanceof Date && !isNaN(d.getTime());
    }
    /**
     * Kiểm tra ngày trong tương lai (sau ngày hôm nay)
     */
    static isDateInFuture(dateStr) {
        if (!this.isValidDate(dateStr))
            return false;
        const target = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return target.getTime() >= today.getTime();
    }
    /**
     * Kiểm tra ngày trong quá khứ
     */
    static isDateInPast(dateStr) {
        if (!this.isValidDate(dateStr))
            return false;
        const target = new Date(dateStr);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return target.getTime() <= today.getTime();
    }
    /**
     * Kiểm tra số nằm trong khoảng [min, max]
     */
    static isInRange(val, min, max) {
        return typeof val === 'number' && !isNaN(val) && val >= min && val <= max;
    }
    /**
     * Kiểm tra họ tên hợp lệ (chỉ chứa chữ cái tiếng Việt / tiếng Anh và khoảng trắng)
     */
    static isValidFullName(name) {
        if (!this.isNotEmpty(name))
            return false;
        // Hỗ trợ tiếng Việt có dấu
        const regex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/;
        return regex.test(name.trim()) && name.trim().length <= 50;
    }
    /**
     * Hàm validate generic chạy chuỗi rules
     */
    static validate(rules) {
        const errors = [];
        for (const rule of rules) {
            if (!rule.condition) {
                errors.push(rule.message);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.Validator = Validator;
//# sourceMappingURL=Validator.js.map