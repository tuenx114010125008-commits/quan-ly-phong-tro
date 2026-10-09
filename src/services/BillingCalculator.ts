/**
 * Chi tiết từng bậc tính tiền điện
 */
export interface ElectricityTierDetail {
  tierName: string;
  kwhInTier: number;
  unitPrice: number;
  amount: number;
}

/**
 * Kết quả tính tiền điện
 */
export interface ElectricityBillResult {
  consumption: number;       // Số kWh tiêu thụ
  tierDetails: ElectricityTierDetail[];
  subtotal: number;          // Tiền điện trước thuế
  vatRate: number;           // Tỷ lệ VAT (8%)
  vatAmount: number;         // Tiền thuế VAT
  total: number;             // Tổng tiền điện sau thuế
}

/**
 * Tiện ích tính toán hóa đơn điện / nước / dịch vụ kế thừa từ đồ án gốc
 */
export class BillingCalculator {
  /**
   * 💡 CÔNG THỨC TÍNH TIỀN ĐIỆN BẬC THANG SINH HOẠT (EVN)
   * 
   * Quy tắc chia bậc:
   * - Bậc 1: 50 kWh đầu tiên   👉 Giá: 1.806 đ/kWh
   * - Bậc 2: 50 kWh tiếp theo  👉 Giá: 1.866 đ/kWh
   * - Bậc 3: 100 kWh tiếp theo 👉 Giá: 2.167 đ/kWh
   * - Bậc 4: 100 kWh tiếp theo 👉 Giá: 2.729 đ/kWh
   * - Bậc 5: 100 kWh tiếp theo 👉 Giá: 3.050 đ/kWh
   * - Bậc 6: Từ kWh thứ 401 trở đi 👉 Giá: 3.151 đ/kWh
   * 
   * Thuế VAT: 8% trên tổng tiền điện.
   * 
   * @param consumption Số kWh điện tiêu thụ (Chỉ số mới - Chỉ số cũ)
   * @param vatRate Tỷ lệ thuế VAT (Mặc định 8% = 0.08)
   */
  public static calculateTieredElectricityBill(consumption: number, vatRate: number = 0.08): ElectricityBillResult {
    // 1. Kiểm tra đầu vào hợp lệ
    if (consumption < 0) {
      throw new Error('Số điện tiêu thụ không được âm.');
    }

    // 2. Định nghĩa danh sách 6 bậc thang theo quy định
    const tiers = [
      { name: 'Bậc 1 (0 - 50 kWh)', limit: 50, price: 1806 },
      { name: 'Bậc 2 (51 - 100 kWh)', limit: 50, price: 1866 },
      { name: 'Bậc 3 (101 - 200 kWh)', limit: 100, price: 2167 },
      { name: 'Bậc 4 (201 - 300 kWh)', limit: 100, price: 2729 },
      { name: 'Bậc 5 (301 - 400 kWh)', limit: 100, price: 3050 },
      { name: 'Bậc 6 (> 400 kWh)', limit: Infinity, price: 3151 }
    ];

    let remaining = consumption;
    const tierDetails: ElectricityTierDetail[] = [];
    let subtotal = 0;

    // 3. Phân bổ số điện vào từng bậc (Tương tự rót nước qua các bình dung tích giới hạn)
    for (const tier of tiers) {
      if (remaining <= 0) break;

      // Số kWh lọt vào bậc hiện tại
      const kwh = Math.min(remaining, tier.limit);
      const amount = Math.round(kwh * tier.price);
      subtotal += amount;

      tierDetails.push({
        tierName: tier.name,
        kwhInTier: kwh,
        unitPrice: tier.price,
        amount
      });

      // Trừ đi số kWh đã tính ở bậc này
      remaining -= kwh;
    }

    // 4. Tính tiền thuế VAT 8% và Tổng cộng sau thuế
    const vatAmount = Math.round(subtotal * vatRate);
    const total = subtotal + vatAmount;

    return {
      consumption,
      tierDetails,
      subtotal,
      vatRate,
      vatAmount,
      total
    };
  }

  /**
   * Tính tiền điện theo đơn giá cố định (phòng trọ kinh doanh) + VAT 8%
   */
  public static calculateServiceElectricityBill(consumption: number, unitPrice: number, vatRate: number = 0.08): ElectricityBillResult {
    if (consumption < 0) throw new Error('Số điện tiêu thụ không được âm.');
    const subtotal = Math.round(consumption * unitPrice);
    const vatAmount = Math.round(subtotal * vatRate);
    const total = subtotal + vatAmount;

    return {
      consumption,
      tierDetails: [{
        tierName: 'Điện kinh doanh phòng trọ',
        kwhInTier: consumption,
        unitPrice,
        amount: subtotal
      }],
      subtotal,
      vatRate,
      vatAmount,
      total
    };
  }

  /**
   * Tính tiền nước sinh hoạt theo chỉ số m3
   */
  public static calculateWaterBill(consumption: number, unitPrice: number): number {
    if (consumption < 0) throw new Error('Số nước tiêu thụ không được âm.');
    return Math.round(consumption * unitPrice);
  }
}
