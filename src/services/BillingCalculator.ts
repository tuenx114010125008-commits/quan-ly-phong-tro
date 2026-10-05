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
   * Biểu giá điện sinh hoạt bậc thang (EVN / Chuẩn phòng trọ bậc thang)
   * Bậc 1: 0 - 50 kWh: 1.806 đ
   * Bậc 2: 51 - 100 kWh: 1.866 đ
   * Bậc 3: 101 - 200 kWh: 2.167 đ
   * Bậc 4: 201 - 300 kWh: 2.729 đ
   * Bậc 5: 301 - 400 kWh: 3.050 đ
   * Bậc 6: > 400 kWh: 3.151 đ
   */
  public static calculateTieredElectricityBill(consumption: number, vatRate: number = 0.08): ElectricityBillResult {
    if (consumption < 0) {
      throw new Error('Số điện tiêu thụ không được âm.');
    }

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

    for (const tier of tiers) {
      if (remaining <= 0) break;
      const kwh = Math.min(remaining, tier.limit);
      const amount = Math.round(kwh * tier.price);
      subtotal += amount;
      tierDetails.push({
        tierName: tier.name,
        kwhInTier: kwh,
        unitPrice: tier.price,
        amount
      });
      remaining -= kwh;
    }

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
