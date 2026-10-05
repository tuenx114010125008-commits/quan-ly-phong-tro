/**
 * Tiện ích kiểm tra và xác thực dữ liệu
 */
export class Validator {
  /**
   * Kiểm tra chuỗi không rỗng
   */
  public static isNotEmpty(val: string | null | undefined): boolean {
    return val !== null && val !== undefined && val.trim().length > 0;
  }

  /**
   * Kiểm tra số thực dương (> 0)
   */
  public static isPositiveNumber(val: number): boolean {
    return typeof val === 'number' && !isNaN(val) && val > 0;
  }

  /**
   * Kiểm tra số không âm (>= 0)
   */
  public static isNonNegativeNumber(val: number): boolean {
    return typeof val === 'number' && !isNaN(val) && val >= 0;
  }

  /**
   * Kiểm tra số điện thoại Việt Nam (10 chữ số, bắt đầu bằng 0)
   */
  public static isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const cleanPhone = phone.trim();
    return /^0\d{9}$/.test(cleanPhone);
  }

  /**
   * Kiểm tra số CCCD (12 chữ số)
   */
  public static isValidCCCD(cccd: string): boolean {
    if (!cccd) return false;
    const cleanCCCD = cccd.trim();
    return /^\d{12}$/.test(cleanCCCD);
  }

  /**
   * Kiểm tra ngày tháng hợp lệ định dạng YYYY-MM-DD
   */
  public static isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const d = new Date(dateStr);
    return d instanceof Date && !isNaN(d.getTime());
  }

  /**
   * Kiểm tra ngày trong tương lai (sau ngày hôm nay)
   */
  public static isDateInFuture(dateStr: string): boolean {
    if (!this.isValidDate(dateStr)) return false;
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return target.getTime() >= today.getTime();
  }

  /**
   * Kiểm tra ngày trong quá khứ
   */
  public static isDateInPast(dateStr: string): boolean {
    if (!this.isValidDate(dateStr)) return false;
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return target.getTime() <= today.getTime();
  }

  /**
   * Kiểm tra số nằm trong khoảng [min, max]
   */
  public static isInRange(val: number, min: number, max: number): boolean {
    return typeof val === 'number' && !isNaN(val) && val >= min && val <= max;
  }

  /**
   * Kiểm tra họ tên hợp lệ (chỉ chứa chữ cái tiếng Việt / tiếng Anh và khoảng trắng)
   */
  public static isValidFullName(name: string): boolean {
    if (!this.isNotEmpty(name)) return false;
    // Hỗ trợ tiếng Việt có dấu
    const regex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/;
    return regex.test(name.trim()) && name.trim().length <= 50;
  }

  /**
   * Hàm validate generic chạy chuỗi rules
   */
  public static validate(rules: { condition: boolean; message: string }[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
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
