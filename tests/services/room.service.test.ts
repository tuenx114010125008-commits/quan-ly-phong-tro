import { RoomService } from '../../src/services/RoomService';
import { RoomRepository } from '../../src/repositories/RoomRepository';
import { EquipmentRepository } from '../../src/repositories/EquipmentRepository';
import { DatabaseConnection } from '../../src/database/connection';
import { RoomStatus } from '../../src/types/common.types';

describe('RoomService Unit Tests', () => {
  let roomService: RoomService;

  beforeAll(() => {
    const db = DatabaseConnection.getInstance();
    db.seedDatabase();
    const eqRepo = new EquipmentRepository();
    const roomRepo = new RoomRepository(eqRepo);
    roomService = new RoomService(roomRepo, eqRepo);
  });

  test('getAllRooms returns non-empty list of seeded rooms', () => {
    const rooms = roomService.getAllRooms();
    expect(rooms.length).toBeGreaterThan(0);
  });

  test('addRoom creates a new room with valid input', () => {
    const testRoomNum = `TEST_${Date.now()}`;
    const res = roomService.addRoom({
      roomNumber: testRoomNum,
      area: 28.5,
      monthlyRent: 3800000,
      description: 'Phòng kiểm thử'
    });

    expect(res.success).toBe(true);
    expect(res.data?.roomNumber).toBe(testRoomNum);
    expect(res.data?.status).toBe(RoomStatus.AVAILABLE);

    // Thử thêm lại phòng cùng số phòng để kiểm tra bắt lỗi trùng lặp
    const duplicateRes = roomService.addRoom({
      roomNumber: testRoomNum,
      area: 25,
      monthlyRent: 3000000
    });

    expect(duplicateRes.success).toBe(false);
    expect(duplicateRes.message).toContain('đã tồn tại');
  });

  test('addRoom fails with invalid area or rent', () => {
    const res1 = roomService.addRoom({
      roomNumber: 'ROOM_INVALID_1',
      area: -10, // Invalid area
      monthlyRent: 3000000
    });
    expect(res1.success).toBe(false);

    const res2 = roomService.addRoom({
      roomNumber: 'ROOM_INVALID_2',
      area: 20,
      monthlyRent: 0 // Invalid rent
    });
    expect(res2.success).toBe(false);
  });

  test('compareRooms compares two valid rooms and returns price/area diff', () => {
    const res = roomService.compareRooms('P001', 'P003');
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(typeof res.data?.priceDiff).toBe('number');
  });
});
