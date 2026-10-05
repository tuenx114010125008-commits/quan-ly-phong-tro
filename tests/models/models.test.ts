import { RoomEntity } from '../../src/models/Room';
import { CustomerEntity } from '../../src/models/Customer';
import { UserEntity } from '../../src/models/User';
import { ContractEntity, ContractStatus } from '../../src/models/Contract';
import { InvoiceEntity, InvoiceStatus } from '../../src/models/Invoice';
import { RoomStatus, CustomerStatus } from '../../src/types/common.types';
import { UserRole, UserStatus } from '../../src/types/role.types';

describe('Domain Models Entity Unit Tests', () => {
  test('RoomEntity status helpers and total equipment value', () => {
    const room = new RoomEntity({
      roomNumber: '501',
      area: 30,
      monthlyRent: 4000000,
      equipment: [
        { id: '1', roomId: '1', name: 'Điều hòa', condition: 'GOOD' as any, value: 5000000, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', roomId: '1', name: 'Quạt', condition: 'GOOD' as any, value: 500000, createdAt: new Date(), updatedAt: new Date() }
      ]
    });

    expect(room.isAvailable()).toBe(true);
    expect(room.getTotalEquipmentValue()).toBe(5500000);

    room.markAsRented();
    expect(room.isRented()).toBe(true);
  });

  test('UserEntity permissions checking', () => {
    const admin = new UserEntity({ username: 'superadmin', role: UserRole.ADMIN });
    const manager = new UserEntity({ username: 'manager1', role: UserRole.MANAGER });
    const staff = new UserEntity({ username: 'staff1', role: UserRole.STAFF });

    expect(admin.isAdmin()).toBe(true);
    expect(admin.isManager()).toBe(true);
    expect(admin.isStaff()).toBe(true);

    expect(manager.isAdmin()).toBe(false);
    expect(manager.isManager()).toBe(true);
    expect(manager.hasPermission(UserRole.ADMIN)).toBe(false);
    expect(manager.hasPermission(UserRole.MANAGER)).toBe(true);

    expect(staff.isStaff()).toBe(true);
    expect(staff.isManager()).toBe(false);
  });

  test('CustomerEntity age calculation', () => {
    const customer = new CustomerEntity({
      fullName: 'Trần Văn B',
      dateOfBirth: '2000-01-01',
      cccd: '001200009999',
      phone: '0912345678',
      hometown: 'Hà Nội'
    });

    expect(customer.getAge()).toBeGreaterThan(20);
    expect(customer.isActive()).toBe(true);
  });

  test('ContractEntity remaining days and expiring soon logic', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15); // 15 days in future
    const endDateStr = futureDate.toISOString().split('T')[0];

    const contract = new ContractEntity({
      roomId: 'P001',
      customerIds: ['KH001'],
      startDate: '2026-01-01',
      endDate: endDateStr,
      deposit: 3000000,
      monthlyRent: 3000000
    });

    expect(contract.isExpiringSoon(30)).toBe(true);
    expect(contract.isExpiringSoon(10)).toBe(false);
  });

  test('InvoiceEntity total calculation and payment state', () => {
    const inv = new InvoiceEntity({
      contractId: 'HD001',
      roomId: 'P001',
      month: 10,
      year: 2026,
      roomRentAmount: 3500000,
      electricityAmount: 300000,
      waterAmount: 100000,
      internetAmount: 100000,
      cleaningAmount: 30000,
      surcharge: 50000,
      discount: 100000
    });

    const expectedTotal = 3500000 + 300000 + 100000 + 100000 + 30000 + 50000 - 100000;
    expect(inv.totalAmount).toBe(expectedTotal);
    expect(inv.isUnpaid()).toBe(true);

    inv.markAsPaid();
    expect(inv.isPaid()).toBe(true);
    expect(inv.paymentDate).toBeDefined();
  });
});
