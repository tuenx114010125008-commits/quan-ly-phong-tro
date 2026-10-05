import { Validator } from '../../src/utils/Validator';

describe('Validator Utils Unit Tests', () => {
  test('isNotEmpty should return true for non-empty strings and false for whitespace/null', () => {
    expect(Validator.isNotEmpty('Phòng 101')).toBe(true);
    expect(Validator.isNotEmpty('')).toBe(false);
    expect(Validator.isNotEmpty('   ')).toBe(false);
    expect(Validator.isNotEmpty(null)).toBe(false);
    expect(Validator.isNotEmpty(undefined)).toBe(false);
  });

  test('isValidPhone should validate 10-digit Vietnamese phone numbers starting with 0', () => {
    expect(Validator.isValidPhone('0912345678')).toBe(true);
    expect(Validator.isValidPhone('0987654321')).toBe(true);
    expect(Validator.isValidPhone('1234567890')).toBe(false); // Does not start with 0
    expect(Validator.isValidPhone('091234567')).toBe(false);  // Only 9 digits
    expect(Validator.isValidPhone('09123456789')).toBe(false); // 11 digits
    expect(Validator.isValidPhone('0912abc678')).toBe(false);  // Contains letters
  });

  test('isValidCCCD should validate exact 12 numeric digits', () => {
    expect(Validator.isValidCCCD('001200001234')).toBe(true);
    expect(Validator.isValidCCCD('038202009876')).toBe(true);
    expect(Validator.isValidCCCD('12345678901')).toBe(false);  // 11 digits
    expect(Validator.isValidCCCD('1234567890123')).toBe(false); // 13 digits
    expect(Validator.isValidCCCD('00120000abcd')).toBe(false);  // Letters
  });

  test('isPositiveNumber and isNonNegativeNumber should validate numbers correctly', () => {
    expect(Validator.isPositiveNumber(100)).toBe(true);
    expect(Validator.isPositiveNumber(0)).toBe(false);
    expect(Validator.isPositiveNumber(-5)).toBe(false);
    expect(Validator.isPositiveNumber(NaN)).toBe(false);

    expect(Validator.isNonNegativeNumber(0)).toBe(true);
    expect(Validator.isNonNegativeNumber(50000)).toBe(true);
    expect(Validator.isNonNegativeNumber(-1)).toBe(false);
  });

  test('isValidDate and date comparisons should work properly', () => {
    expect(Validator.isValidDate('2026-10-05')).toBe(true);
    expect(Validator.isValidDate('invalid-date')).toBe(false);
    expect(Validator.isValidDate('05/10/2026')).toBe(false); // Must be YYYY-MM-DD

    expect(Validator.isDateInPast('2000-01-01')).toBe(true);
    expect(Validator.isDateInFuture('2099-12-31')).toBe(true);
  });

  test('isValidFullName should check Vietnamese and English alphabetic names', () => {
    expect(Validator.isValidFullName('Nguyen Van An')).toBe(true);
    expect(Validator.isValidFullName('Nguyễn Văn An')).toBe(true);
    expect(Validator.isValidFullName('Trần Thị Mai 123')).toBe(false); // Contains numbers
    expect(Validator.isValidFullName('')).toBe(false);
  });
});
