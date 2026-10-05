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

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLiveDemo() {
  console.log('\x1b[32m========================================================================================\x1b[0m');
  console.log('\x1b[1;36m       🏠 HỆ THỐNG QUẢN LÝ PHÒNG TRỌ — DEMO TỔNG QUAN CHỨC NĂNG THÀNH VIÊN 1           \x1b[0m');
  console.log('\x1b[32m========================================================================================\x1b[0m\n');

  // 1. Database & Repositories Setup
  console.log('\x1b[1;33m[BƯỚC 1] KHỞI TẠO CƠ SỞ DỮ LIỆU SQLITE & NẠP DỮ LIỆU MẪU...\x1b[0m');
  const db = DatabaseConnection.getInstance();
  db.seedDatabase();

  const userRepo = new UserRepository();
  const equipmentRepo = new EquipmentRepository();
  const roomRepo = new RoomRepository(equipmentRepo);
  const customerRepo = new CustomerRepository();
  const serviceRepo = new ServiceRepository();

  const authService = new AuthService(userRepo);
  const roomService = new RoomService(roomRepo, equipmentRepo);
  const customerService = new CustomerService(customerRepo);
  const serviceService = new ServiceService(serviceRepo);
  const equipmentService = new EquipmentService(equipmentRepo);

  console.log('✔ Cơ sở dữ liệu SQLite đã sẵn sàng.');
  console.log(`✔ Dữ liệu hiện có: ${roomRepo.count()} phòng, ${customerRepo.count()} khách thuê, ${serviceRepo.count()} dịch vụ, ${userRepo.count()} tài khoản.\n`);

  // 2. Authentication Flow
  console.log('\x1b[1;33m[BƯỚC 2] DEMO ĐĂNG NHẬP & PHÂN QUYỀN (AUTHENTICATION)...\x1b[0m');
  console.log('👉 Đăng nhập với tài khoản Admin (admin / admin123):');
  const loginRes = authService.login('admin', 'admin123');
  if (loginRes.success && loginRes.data) {
    console.log(`✔ Đăng nhập thành công: \x1b[32m${loginRes.data.fullName}\x1b[0m (Vai trò: ${Formatter.formatStatus(loginRes.data.role)})\n`);
  }

  // 3. Room Management
  console.log('\x1b[1;33m[BƯỚC 3] DEMO QUẢN LÝ PHÒNG TRỌ (ROOM MANAGEMENT)...\x1b[0m');
  console.log('📋 Danh sách tất cả phòng trọ hiện có:');
  const rooms = roomService.getAllRooms();
  Formatter.formatTable(
    ['Mã Phòng', 'Số Phòng', 'Trạng Thái', 'Diện Tích', 'Giá Thuê / Tháng', 'Mô Tả'],
    rooms.map(r => [
      r.id,
      r.roomNumber,
      Formatter.formatStatus(r.status),
      `${r.area} m²`,
      Formatter.formatCurrency(r.monthlyRent),
      r.description || '-'
    ])
  );

  console.log('\n👉 So sánh 2 phòng P001 và P005:');
  const compareRes = roomService.compareRooms('P001', 'P005');
  if (compareRes.success && compareRes.data) {
    const { room1, room2, priceDiff, areaDiff } = compareRes.data;
    Formatter.formatTable(
      ['Tiêu chí', `Phòng ${room1.roomNumber} (${room1.id})`, `Phòng ${room2.roomNumber} (${room2.id})`, 'Chênh lệch'],
      [
        ['Trạng thái', Formatter.formatStatus(room1.status), Formatter.formatStatus(room2.status), '-'],
        ['Diện tích', `${room1.area} m²`, `${room2.area} m²`, `${areaDiff > 0 ? '+' : ''}${areaDiff} m²`],
        ['Giá thuê / tháng', Formatter.formatCurrency(room1.monthlyRent), Formatter.formatCurrency(room2.monthlyRent), `${priceDiff > 0 ? '+' : ''}${Formatter.formatCurrency(priceDiff)}`],
        ['Thiết bị', `${room1.equipment?.length || 0} thiết bị`, `${room2.equipment?.length || 0} thiết bị`, '-']
      ]
    );
  }

  // 4. Equipment Management
  console.log('\n\x1b[1;33m[BƯỚC 4] DEMO TRANG THIẾT BỊ PHÒNG (EQUIPMENT)...\x1b[0m');
  console.log('📋 Danh sách trang thiết bị trong phòng P001:');
  const eqList = equipmentService.getByRoomId('P001');
  Formatter.formatTable(
    ['Mã TB', 'Tên Thiết Bị', 'Tình Trạng', 'Giá Trị (VNĐ)'],
    eqList.map(e => [e.id, e.name, Formatter.formatStatus(e.condition), Formatter.formatCurrency(e.value)])
  );

  // 5. Customer Management
  console.log('\n\x1b[1;33m[BƯỚC 5] DEMO QUẢN LÝ KHÁCH THUÊ (CUSTOMER MANAGEMENT)...\x1b[0m');
  console.log('📋 Danh sách khách thuê trọ:');
  const customers = customerService.getAllCustomers();
  Formatter.formatTable(
    ['Mã KH', 'Họ Và Tên', 'Ngày Sinh', 'Số CCCD', 'Số ĐT', 'Quê Quán', 'Xe / Biển Số', 'Trạng Thái'],
    customers.map(c => [
      c.id,
      c.fullName,
      Formatter.formatDate(c.dateOfBirth),
      c.cccd,
      c.phone,
      c.hometown,
      c.vehicle || '-',
      Formatter.formatStatus(c.status)
    ])
  );

  // 6. Service Management
  console.log('\n\x1b[1;33m[BƯỚC 6] DEMO BẢNG GIÁ DỊCH VỤ (SERVICE MANAGEMENT)...\x1b[0m');
  console.log('📋 Bảng giá dịch vụ hiện hành:');
  const services = serviceService.getAllServices();
  Formatter.formatTable(
    ['Mã DV', 'Tên Dịch Vụ', 'Đơn Vị Tính', 'Đơn Giá (VNĐ)', 'Trạng Thái', 'Ghi Chú'],
    services.map(s => [
      s.id,
      s.name,
      s.unit,
      Formatter.formatCurrency(s.unitPrice),
      Formatter.formatStatus(s.status),
      s.description || '-'
    ])
  );

  // 7. Users & Roles
  console.log('\n\x1b[1;33m[BƯỚC 7] DEMO TÀI KHOẢN VÀ PHÂN QUYỀN (USERS & ROLES)...\x1b[0m');
  console.log('📋 Danh sách tài khoản hệ thống:');
  const users = authService.getAllUsers();
  Formatter.formatTable(
    ['Mã USR', 'Tên Đăng Nhập', 'Họ Tên', 'Vai Trò (Role)', 'Trạng Thái', 'Đăng Nhập Gần Nhất'],
    users.map(u => [
      u.id,
      u.username,
      u.fullName,
      Formatter.formatStatus(u.role),
      Formatter.formatStatus(u.status),
      Formatter.formatDateTime(u.lastLoginAt)
    ])
  );

  console.log('\x1b[32m========================================================================================\x1b[0m');
  console.log('\x1b[1;32m       🎉 DEMO THÀNH CÔNG! HỆ THỐNG HOẠT ĐỘNG HOÀN TOÀN ỔN ĐỊNH VÀ CHUẨN XÁC!           \x1b[0m');
  console.log('\x1b[32m========================================================================================\x1b[0m\n');
}

runLiveDemo().catch(console.error);
