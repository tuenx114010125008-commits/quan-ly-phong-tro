import { DatabaseConnection } from './database/connection';
import { RoomRepository } from './repositories/RoomRepository';
import { CustomerRepository } from './repositories/CustomerRepository';
import { ServiceRepository } from './repositories/ServiceRepository';
import { EquipmentRepository } from './repositories/EquipmentRepository';
import { UserRepository } from './repositories/UserRepository';

import { RoomService } from './services/RoomService';
import { CustomerService } from './services/CustomerService';
import { ServiceService } from './services/ServiceService';
import { EquipmentService } from './services/EquipmentService';
import { AuthService } from './services/AuthService';

import { ManagementView } from './views/ManagementView';
import { InputPrompt } from './views/InputPrompt';
import { Formatter } from './utils/Formatter';
import { Logger } from './utils/Logger';

async function bootstrap() {
  // 1. Khởi tạo Database và kết nối
  const db = DatabaseConnection.getInstance();
  
  // Tự động nạp dữ liệu mẫu nếu chưa có dữ liệu phòng
  const userRepo = new UserRepository();
  if (userRepo.count() === 0) {
    Logger.info('Cơ sở dữ liệu mới khởi tạo, đang nạp dữ liệu mẫu ban đầu...', 'System');
    db.seedDatabase();
  }

  // 2. Khởi tạo Repositories & Services
  const equipmentRepo = new EquipmentRepository();
  const roomRepo = new RoomRepository(equipmentRepo);
  const customerRepo = new CustomerRepository();
  const serviceRepo = new ServiceRepository();

  const authService = new AuthService(userRepo);
  const equipmentService = new EquipmentService(equipmentRepo);
  const roomService = new RoomService(roomRepo, equipmentRepo);
  const customerService = new CustomerService(customerRepo);
  const serviceService = new ServiceService(serviceRepo);

  const view = new ManagementView(
    roomService,
    customerService,
    serviceService,
    equipmentService,
    authService
  );

  console.clear();
  console.log('\x1b[32m=================================================================\x1b[0m');
  console.log('\x1b[1;36m       🏠 HỆ THỐNG QUẢN LÝ PHÒNG TRỌ (CONSOLE APPLICATION)      \x1b[0m');
  console.log('\x1b[32m=================================================================\x1b[0m');
  console.log('📌 Công nghệ: TypeScript 5.x | Node.js | SQLite (In-Process SQL)');
  console.log('📌 Phân hệ: Thành viên 1 — Database & Management Core Architecture\n');

  // 3. Vòng lặp Đăng nhập & Menu chính
  while (true) {
    if (!authService.isLoggedIn()) {
      console.log('\x1b[1;33m--- ĐĂNG NHẬP HỆ THỐNG ---\x1b[0m');
      console.log('\x1b[90m(Gợi ý tài khoản: admin / admin123  |  manager / manager123  |  staff / staff123)\x1b[0m');
      
      const username = await InputPrompt.ask('👤 Tên đăng nhập (hoặc gõ "exit" để thoát): ');
      if (username.toLowerCase() === 'exit') {
        console.log('\nCảm ơn bạn đã sử dụng hệ thống. Hẹn gặp lại!');
        break;
      }

      const password = await InputPrompt.ask('🔑 Mật khẩu: ');
      const loginRes = authService.login(username, password);

      if (!loginRes.success) {
        console.log(`\x1b[31m✖ ${loginRes.message}\x1b[0m\n`);
        await InputPrompt.pause();
        console.clear();
        continue;
      }

      console.log(`\x1b[32m✔ ${loginRes.message}\x1b[0m`);
      await InputPrompt.pause();
    }

    const currentUser = authService.getCurrentUser()!;
    console.clear();
    console.log('\x1b[34m=================================================================\x1b[0m');
    console.log(`\x1b[1;37m Xin chào: \x1b[1;32m${currentUser.fullName}\x1b[0m | Vai trò: ${Formatter.formatStatus(currentUser.role)}`);
    console.log('\x1b[34m=================================================================\x1b[0m');
    console.log('\x1b[1;33m                        MENU CHÍNH                              \x1b[0m');
    console.log('\x1b[34m-----------------------------------------------------------------\x1b[0m');
    console.log(' [1] 🏢 Quản lý Phòng trọ (CRUD, Tìm kiếm, Lọc, So sánh)');
    console.log(' [2] 👥 Quản lý Khách thuê (CRUD, CCCD, SĐT, Quê quán)');
    console.log(' [3] 💡 Quản lý Bảng giá Dịch vụ (Điện, Nước, Internet, Rác)');
    console.log(' [4] 🔧 Quản lý Trang thiết bị phòng');
    
    if (currentUser.isAdmin()) {
      console.log(' [5] 🔐 Quản lý Tài khoản & Phân quyền (ADMIN)');
    }

    console.log('\x1b[90m --- Phân hệ Thành viên 2 (Rental & Finance) --- \x1b[0m');
    console.log(' [6] 📝 Quản lý Hợp đồng thuê phòng (Ready for Member 2)');
    console.log(' [7] 🧾 Quản lý Hóa đơn & Tiền Điện/Nước (Ready for Member 2)');
    console.log(' [8] 📊 Báo cáo Doanh thu & Thống kê (Ready for Member 2)');
    console.log('\x1b[34m-----------------------------------------------------------------\x1b[0m');
    console.log(' [9] 🚪 Đăng xuất tài khoản');
    console.log(' [0] ❌ Thoát chương trình');
    console.log('\x1b[34m=================================================================\x1b[0m');

    const choice = await InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');

    switch (choice) {
      case '1':
        await view.handleRoomMenu();
        break;
      case '2':
        await view.handleCustomerMenu();
        break;
      case '3':
        await view.handleServiceMenu();
        break;
      case '4':
        await view.handleRoomMenu();
        break;
      case '5':
        if (currentUser.isAdmin()) {
          await view.handleUserMenu();
        } else {
          console.log('\x1b[31m⚠️ Bạn không có quyền truy cập chức năng này!\x1b[0m');
          await InputPrompt.pause();
        }
        break;
      case '6':
      case '7':
      case '8':
        console.log('\n\x1b[33mℹ️ Module Hợp đồng, Hóa đơn & Báo cáo tài chính thuộc phân hệ Thành viên 2.');
        console.log('Hệ thống Database và Model sẵn sàng cho việc tích hợp!\x1b[0m');
        await InputPrompt.pause();
        break;
      case '9':
        authService.logout();
        console.log('\x1b[32m✔ Đã đăng xuất thành công.\x1b[0m');
        await InputPrompt.pause();
        console.clear();
        break;
      case '0':
        console.log('\nCảm ơn bạn đã sử dụng Hệ thống Quản lý Phòng trọ!');
        InputPrompt.close();
        process.exit(0);
      default:
        console.log('\x1b[31m⚠️ Lựa chọn không hợp lệ, vui lòng thử lại!\x1b[0m');
        await InputPrompt.pause();
    }
  }

  InputPrompt.close();
}

bootstrap().catch(err => {
  console.error('Lỗi khởi động hệ thống:', err);
});
