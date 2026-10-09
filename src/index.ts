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

/**
 * HÀM KHỞI ĐỘNG CHÍNH CỦA CHƯƠNG TRÌNH (Bootstrap)
 * 
 * Luồng hoạt động cơ bản:
 * 1. Khởi tạo kết nối CSDL SQLite (DatabaseConnection).
 * 2. Nạp dữ liệu mẫu (Seed Data) nếu hệ thống chưa có tài khoản nào.
 * 3. Tạo các Repositories (Tầng giao tiếp trực tiếp với cơ sở dữ liệu).
 * 4. Tạo các Services (Tầng xử lý nghiệp vụ, tính toán, kiểm tra logic).
 * 5. Tạo các Views (Tầng giao diện dòng lệnh Console UI).
 * 6. Chạy vòng lặp Menu chính tương tác với người dùng qua bàn phím.
 */
async function bootstrap() {
  // BƯỚC 1: Lấy kết nối Database duy nhất (mẫu Singleton)
  const db = DatabaseConnection.getInstance();
  
  // BƯỚC 2: Kiểm tra dữ liệu khởi tạo ban đầu (Nếu chưa có User thì nạp mẫu từ seed.sql)
  const userRepo = new UserRepository();
  if (userRepo.count() === 0) {
    db.seedDatabase();
  }

  // BƯỚC 3: Khởi tạo các Repository (Thủ kho chuyên đọc/ghi các bảng dữ liệu)
  const equipmentRepo = new EquipmentRepository();
  const roomRepo = new RoomRepository(equipmentRepo);
  const customerRepo = new CustomerRepository();
  const serviceRepo = new ServiceRepository();
  const contractRepo = new ContractRepository();
  const invoiceRepo = new InvoiceRepository();

  // BƯỚC 4: Khởi tạo các Service (Người quản lý xử lý các quy tắc nghiệp vụ)
  const authService = new AuthService(userRepo);
  const equipmentService = new EquipmentService(equipmentRepo);
  const roomService = new RoomService(roomRepo, equipmentRepo);
  const customerService = new CustomerService(customerRepo);
  const serviceService = new ServiceService(serviceRepo);
  const contractService = new ContractService(contractRepo, roomRepo, customerRepo);
  const invoiceService = new InvoiceService(invoiceRepo, contractRepo, roomRepo, serviceRepo);
  const paymentService = new PaymentService(invoiceRepo);
  const reportService = new ReportService(roomRepo, customerRepo, contractRepo, invoiceRepo);

  // BƯỚC 5: Khởi tạo các View (Lễ tân hiển thị Menu ra màn hình console)
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
  console.log('=================================================================');
  console.log('            CHUONG TRINH QUAN LY PHONG TRO (CONSOLE APP)         ');
  console.log('=================================================================\n');

  while (true) {
    if (!authService.isLoggedIn()) {
      console.log('--- DANG NHAP HE THONG ---');
      
      const username = await InputPrompt.ask('Tai khoan (hoac "exit" de thoat): ');
      if (username.toLowerCase() === 'exit') {
        console.log('\nDa thoat chuong trinh.');
        break;
      }

      const password = await InputPrompt.ask('Mat khau: ');
      const loginRes = authService.login(username, password);

      if (!loginRes.success) {
        console.log(`[Loi] ${loginRes.message}\n`);
        await InputPrompt.pause();
        console.clear();
        continue;
      }

      console.log(`[Thanh cong] ${loginRes.message}`);
      await InputPrompt.pause();
    }

    const currentUser = authService.getCurrentUser()!;
    console.clear();
    console.log('=================================================================');
    console.log(` Nguoi dung: ${currentUser.fullName} | Quyen: ${Formatter.formatStatus(currentUser.role)}`);
    console.log('=================================================================');
    console.log('                          MENU CHINH                             ');
    console.log('-----------------------------------------------------------------');
    console.log(' [1] Quan ly phong tro (CRUD, tim kiem, loc, so sanh)');
    console.log(' [2] Quan ly khach thue (CRUD, thong tin ca nhan, CCCD, SDT)');
    console.log(' [3] Quan ly bang gia dich vu (Dien, nuoc, mang, rac)');
    console.log(' [4] Quan ly thiet bi phong');
    console.log(' [5] Quan ly hop dong thue phong');
    console.log(' [6] Quan ly hoa don & tinh tien dien nuoc');
    console.log(' [7] Thanh toan hoa don');
    console.log(' [8] Bao cao thong ke & xuat file JSON');

    if (currentUser.isAdmin()) {
      console.log(' [9] Quan ly tai khoan he thong (Admin)');
    }

    console.log('-----------------------------------------------------------------');
    console.log(' [10] Dang xuat');
    console.log(' [0]  Thoat');
    console.log('=================================================================');

    const choice = await InputPrompt.ask('Nhap lua chon cua ban: ');

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
          console.log('[Canh bao] Ban khong co quyen truy cap muc nay.');
          await InputPrompt.pause();
        }
        break;
      case '10':
        authService.logout();
        console.log('[Thong bao] Da dang xuat thanh cong.');
        await InputPrompt.pause();
        console.clear();
        break;
      case '0':
        console.log('\nCam on ban da su dung chuong trinh.');
        InputPrompt.close();
        process.exit(0);
      default:
        console.log('[Loi] Lua chon khong hop le, vui long thu lai.');
        await InputPrompt.pause();
    }
  }

  InputPrompt.close();
}

bootstrap().catch(err => {
  console.error('Loi khoi dong:', err);
});
