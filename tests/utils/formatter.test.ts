import { Formatter } from '../../src/utils/Formatter';
import { RoomStatus } from '../../src/types/common.types';
import { UserRole } from '../../src/types/role.types';

describe('Formatter Utils Unit Tests', () => {
  test('formatCurrency should format numbers into Vietnamese VND format', () => {
    const formatted = Formatter.formatCurrency(3500000);
    expect(formatted).toContain('3.500.000');
    expect(formatted).toContain('VNĐ');

    expect(Formatter.formatCurrency(0)).toContain('0');
  });

  test('formatDate should format valid Date or string into DD/MM/YYYY', () => {
    const date = new Date('2026-10-05T00:00:00Z');
    const formatted = Formatter.formatDate(date);
    expect(formatted).toMatch(/\d{2}\/\d{2}\/2026/);
    expect(Formatter.formatDate(undefined)).toBe('-');
  });

  test('formatStatus should handle different enum status values', () => {
    expect(Formatter.formatStatus(RoomStatus.AVAILABLE)).toContain('AVAILABLE');
    expect(Formatter.formatStatus(RoomStatus.RENTED)).toContain('RENTED');
    expect(Formatter.formatStatus(UserRole.ADMIN)).toContain('ADMIN');
  });
});
