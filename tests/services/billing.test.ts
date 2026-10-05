import { BillingCalculator } from '../../src/services/BillingCalculator';

describe('BillingCalculator Service Unit Tests', () => {
  test('calculateTieredElectricityBill calculates tier 1 (under 50 kWh)', () => {
    const res = BillingCalculator.calculateTieredElectricityBill(40);
    expect(res.consumption).toBe(40);
    expect(res.tierDetails.length).toBe(1);
    expect(res.tierDetails[0].kwhInTier).toBe(40);
    expect(res.tierDetails[0].unitPrice).toBe(1806);
    expect(res.subtotal).toBe(40 * 1806);
    expect(res.vatAmount).toBe(Math.round(40 * 1806 * 0.08));
    expect(res.total).toBe(res.subtotal + res.vatAmount);
  });

  test('calculateTieredElectricityBill calculates multi-tier progressive pricing (250 kWh)', () => {
    const res = BillingCalculator.calculateTieredElectricityBill(250);
    expect(res.consumption).toBe(250);
    expect(res.tierDetails.length).toBe(4);

    // Bậc 1 (50 kWh * 1806) = 90300
    // Bậc 2 (50 kWh * 1866) = 93300
    // Bậc 3 (100 kWh * 2167) = 216700
    // Bậc 4 (50 kWh * 2729) = 136450
    const expectedSubtotal = 90300 + 93300 + 216700 + 136450;
    expect(res.subtotal).toBe(expectedSubtotal);
    expect(res.total).toBe(expectedSubtotal + Math.round(expectedSubtotal * 0.08));
  });

  test('calculateTieredElectricityBill throws error on negative consumption', () => {
    expect(() => BillingCalculator.calculateTieredElectricityBill(-10)).toThrow();
  });

  test('calculateWaterBill computes consumption * unit price', () => {
    const bill = BillingCalculator.calculateWaterBill(10, 25000);
    expect(bill).toBe(250000);
  });
});
