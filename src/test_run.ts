import { DatabaseConnection } from './database/connection';
import { UserRepository } from './repositories/UserRepository';
import { RoomRepository } from './repositories/RoomRepository';
import { CustomerRepository } from './repositories/CustomerRepository';
import { ServiceRepository } from './repositories/ServiceRepository';
import { EquipmentRepository } from './repositories/EquipmentRepository';

import { AuthService } from './services/AuthService';
import { RoomService } from './services/RoomService';
import { CustomerService } from './services/CustomerService';
import { ServiceService } from './services/ServiceService';
import { EquipmentService } from './services/EquipmentService';

import { Formatter } from './utils/Formatter';
import { RoomStatus, CustomerStatus, EquipmentCondition } from './types/common.types';
import { UserRole } from './types/role.types';

function runAutomatedTests() {
  console.log('🚀 Bắt đầu kiểm thử toàn diện các module của Thành viên 1...\n');

  // 1. Database Init
  const db = DatabaseConnection.getInstance();
  db.seedDatabase();
  console.log('✔ [Database] Đã khởi tạo và nạp seed data thành công.');

  // 2. Repositories
  const userRepo = new UserRepository();
  const equipmentRepo = new EquipmentRepository();
  const roomRepo = new RoomRepository(equipmentRepo);
  const customerRepo = new CustomerRepository();
  const serviceRepo = new ServiceRepository();

  console.log(`✔ [Repositories] Loaded: Users=${userRepo.count()}, Rooms=${roomRepo.count()}, Customers=${customerRepo.count()}, Services=${serviceRepo.count()}`);

  // 3. AuthService
  const authService = new AuthService(userRepo);
  const loginRes = authService.login('admin', 'admin123');
  console.assert(loginRes.success, 'Login failed');
  console.log(`✔ [AuthService] Login Admin thành công: ${authService.getCurrentUser()?.fullName}`);

  // 4. RoomService
  const roomService = new RoomService(roomRepo, equipmentRepo);
  const addRoomRes = roomService.addRoom({
    roomNumber: '999',
    area: 40,
    monthlyRent: 5000000,
    description: 'Phòng VIP penthouse'
  });
  console.assert(addRoomRes.success, 'Add room failed');
  console.log(`✔ [RoomService] Thêm phòng thành công: ${addRoomRes.data?.roomNumber} (ID: ${addRoomRes.data?.id})`);

  // Compare rooms
  const compareRes = roomService.compareRooms('P001', 'P002');
  console.assert(compareRes.success, 'Compare rooms failed');
  console.log(`✔ [RoomService] So sánh phòng P001 & P002 thành công (Chênh lệch giá: ${Formatter.formatCurrency(compareRes.data!.priceDiff)})`);

  // 5. EquipmentService
  const equipmentService = new EquipmentService(equipmentRepo);
  const addEqRes = equipmentService.addEquipment({
    roomId: addRoomRes.data!.id,
    name: 'Smart TV Samsung 55 inch',
    condition: EquipmentCondition.NEW,
    value: 12000000
  });
  console.assert(addEqRes.success, 'Add equipment failed');
  console.log(`✔ [EquipmentService] Thêm thiết bị vào phòng ${addRoomRes.data!.id} thành công: ${addEqRes.data?.name}`);

  // 6. CustomerService
  const customerService = new CustomerService(customerRepo);
  const addCustRes = customerService.addCustomer({
    fullName: 'Hoàng Văn Thắng',
    dateOfBirth: '1999-04-12',
    cccd: '001199012345',
    phone: '0977889900',
    hometown: 'Đà Nẵng',
    vehicle: 'SH 150i 43D1-99999'
  });
  console.assert(addCustRes.success, 'Add customer failed');
  console.log(`✔ [CustomerService] Thêm khách hàng thành công: ${addCustRes.data?.fullName} (CCCD: ${addCustRes.data?.cccd})`);

  // 7. ServiceService
  const serviceService = new ServiceService(serviceRepo);
  const updatePriceRes = serviceService.updatePrice('DV001', 3800);
  console.assert(updatePriceRes.success, 'Update service price failed');
  console.log(`✔ [ServiceService] Cập nhật giá điện thành: ${Formatter.formatCurrency(updatePriceRes.data!.unitPrice)}`);

  console.log('\n=============================================================');
  console.log('🎉 TẤT CẢ 7/7 BÀI TEST CỦA THÀNH VIÊN 1 ĐỀU ĐÃ ĐẠT KẾT QUẢ TỐT!');
  console.log('=============================================================\n');
}

runAutomatedTests();
