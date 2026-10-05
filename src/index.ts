import { DatabaseConnection } from './database/connection';
import { RoomRepository } from './repositories/RoomRepository';
import { CustomerRepository } from './repositories/CustomerRepository';
import { ServiceRepository } from './repositories/ServiceRepository';
import { EquipmentRepository } from './repositories/EquipmentRepository';
import { UserRepository } from './repositories/UserRepository';
import { ContractRepository } from './repositories/ContractRepository';
import { InvoiceRepository } from './repositories/InvoiceRepository';

import { RoomService } from './services/RoomService';
import { CustomerService } from './services/CustomerService';
import { ServiceService } from './services/ServiceService';
import { EquipmentService } from './services/EquipmentService';
import { AuthService } from './services/AuthService';
import { ContractService } from './services/ContractService';
import { InvoiceService } from './services/InvoiceService';
import { PaymentService } from './services/PaymentService';
import { ReportService } from './services/ReportService';

import { ManagementView } from './views/ManagementView';
import { RentalFinanceView } from './views/RentalFinanceView';
import { InputPrompt } from './views/InputPrompt';
import { Formatter } from './utils/Formatter';
import { Logger } from './utils/Logger';

async function bootstrap() {
  // 1. Khởi tạo Database và kết nối
  const db = DatabaseConnection.getInstance();
  
  // Nạp lại dữ liệu mẫu nếu DB mới
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
  const contractRepo = new ContractRepository();
  const invoiceRepo = new InvoiceRepository();

  const authService = new AuthService(userRepo);
  const equipmentService = new EquipmentService(equipmentRepo);
  const roomService = new RoomService(roomRepo, equipmentRepo);
  const customerService = new CustomerService(customerRepo);
  const serviceService = new ServiceService(serviceRepo);
  const contractService = new ContractService(contractRepo, roomRepo, customerRepo);
  const invoiceService = new InvoiceService(invoiceRepo, contractRepo, roomRepo, serviceRepo);
  const paymentService = new PaymentService(invoiceRepo);
  const reportService = new ReportService(roomRepo, customerRepo, contractRepo, invoiceRepo);

  const managementView = new ManagementView(
    roomService,
    customerService,
    serviceService,
    equipmentService,
    authService
  );

  const rentalFinanceView = new RentalFinanceView(
    contractService,
    invoiceService,
    paymentService,
    reportService,
    customerService,
    roomService,
    authService
  );

  console.clear();
  console.log('\x1b[32m=================================================================\x1b[0m');
  console.log('\x1b[1;36m       🏠 HỆ THỐNG QUẢN LÝ PHÒNG TRỌ (CONSOLE APPLICATION)      \x1b[0m');
  console.log('\x1b[32m=================================================================\x1b[0m');
  console.log('📌 Công nghệ: TypeScript 5.x | Node.js | SQLite (In-Process SQL)');
  console.log('📌 Hoàn thiện: Tích hợp đầy đủ cả Phân hệ 1 & Phân hệ 2\n');

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
    console.log('\x1b[1;36m[PHÂN HỆ 1: QUẢN LÝ THỰC THỂ & CƠ SỞ VẬT CHẤT]\x1b[0m');
    console.log(' [1] 🏢 Quản lý Phòng trọ (CRUD, Tìm kiếm, Lọc, So sánh)');
    console.log(' [2] 👥 Quản lý Khách thuê (CRUD, CCCD, SĐT, Quê quán)');
    console.log(' [3] 💡 Quản lý Bảng giá Dịch vụ (Điện, Nước, Internet, Rác)');
    console.log(' [4] 🔧 Quản lý Trang thiết bị phòng');

    console.log('\n\x1b[1;36m[PHÂN HỆ 2: HỢP ĐỒNG, TÀI CHÍNH & THỐNG KÊ]\x1b[0m');
    console.log(' [5] 📝 Quản lý Hợp đồng thuê phòng (Lập HĐ, Gia hạn, Hủy HĐ)');
    console.log(' [6] 🧾 Quản lý Hóa đơn & Tiền Điện/Nước (Tính tiền, Bậc thang)');
    console.log(' [7] 💳 Thanh toán Hóa đơn & In biên lai thu tiền');
    console.log(' [8] 📊 Báo cáo Doanh thu, Thống kê & Xuất file JSON');

    if (currentUser.isAdmin()) {
      console.log('\n\x1b[1;36m[HỆ THỐNG]\x1b[0m');
      console.log(' [9] 🔐 Quản lý Tài khoản & Phân quyền (ADMIN)');
    }

    console.log('\x1b[34m-----------------------------------------------------------------\x1b[0m');
    console.log(' [10] 🚪 Đăng xuất tài khoản');
    console.log(' [0]  ❌ Thoát chương trình');
    console.log('\x1b[34m=================================================================\x1b[0m');

    const choice = await InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');

    switch (choice) {
      case '1':
        await managementView.handleRoomMenu();
        break;
      case '2':
        await managementView.handleCustomerMenu();
        break;
      case '3':
        await managementView.handleServiceMenu();
        break;
      case '4':
        await managementView.handleRoomMenu();
        break;
      case '5':
        await rentalFinanceView.handleContractMenu();
        break;
      case '6':
        await rentalFinanceView.handleInvoiceMenu();
        break;
      case '7':
        await rentalFinanceView.handlePaymentMenu();
        break;
      case '8':
        await rentalFinanceView.handleReportMenu();
        break;
      case '9':
        if (currentUser.isAdmin()) {
          await managementView.handleUserMenu();
        } else {
          console.log('\x1b[31m⚠️ Bạn không có quyền truy cập chức năng này!\x1b[0m');
          await InputPrompt.pause();
        }
        break;
      case '10':
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
