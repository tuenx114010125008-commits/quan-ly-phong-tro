"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./database/connection");
const RoomRepository_1 = require("./repositories/RoomRepository");
const CustomerRepository_1 = require("./repositories/CustomerRepository");
const ServiceRepository_1 = require("./repositories/ServiceRepository");
const EquipmentRepository_1 = require("./repositories/EquipmentRepository");
const UserRepository_1 = require("./repositories/UserRepository");
const RoomService_1 = require("./services/RoomService");
const CustomerService_1 = require("./services/CustomerService");
const ServiceService_1 = require("./services/ServiceService");
const EquipmentService_1 = require("./services/EquipmentService");
const AuthService_1 = require("./services/AuthService");
const ManagementView_1 = require("./views/ManagementView");
const InputPrompt_1 = require("./views/InputPrompt");
const Formatter_1 = require("./utils/Formatter");
const Logger_1 = require("./utils/Logger");
async function bootstrap() {
    // 1. Khởi tạo Database và kết nối
    const db = connection_1.DatabaseConnection.getInstance();
    // Tự động nạp dữ liệu mẫu nếu chưa có dữ liệu phòng
    const userRepo = new UserRepository_1.UserRepository();
    if (userRepo.count() === 0) {
        Logger_1.Logger.info('Cơ sở dữ liệu mới khởi tạo, đang nạp dữ liệu mẫu ban đầu...', 'System');
        db.seedDatabase();
    }
    // 2. Khởi tạo Repositories & Services
    const equipmentRepo = new EquipmentRepository_1.EquipmentRepository();
    const roomRepo = new RoomRepository_1.RoomRepository(equipmentRepo);
    const customerRepo = new CustomerRepository_1.CustomerRepository();
    const serviceRepo = new ServiceRepository_1.ServiceRepository();
    const authService = new AuthService_1.AuthService(userRepo);
    const equipmentService = new EquipmentService_1.EquipmentService(equipmentRepo);
    const roomService = new RoomService_1.RoomService(roomRepo, equipmentRepo);
    const customerService = new CustomerService_1.CustomerService(customerRepo);
    const serviceService = new ServiceService_1.ServiceService(serviceRepo);
    const view = new ManagementView_1.ManagementView(roomService, customerService, serviceService, equipmentService, authService);
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
            const username = await InputPrompt_1.InputPrompt.ask('👤 Tên đăng nhập (hoặc gõ "exit" để thoát): ');
            if (username.toLowerCase() === 'exit') {
                console.log('\nCảm ơn bạn đã sử dụng hệ thống. Hẹn gặp lại!');
                break;
            }
            const password = await InputPrompt_1.InputPrompt.ask('🔑 Mật khẩu: ');
            const loginRes = authService.login(username, password);
            if (!loginRes.success) {
                console.log(`\x1b[31m✖ ${loginRes.message}\x1b[0m\n`);
                await InputPrompt_1.InputPrompt.pause();
                console.clear();
                continue;
            }
            console.log(`\x1b[32m✔ ${loginRes.message}\x1b[0m`);
            await InputPrompt_1.InputPrompt.pause();
        }
        const currentUser = authService.getCurrentUser();
        console.clear();
        console.log('\x1b[34m=================================================================\x1b[0m');
        console.log(`\x1b[1;37m Xin chào: \x1b[1;32m${currentUser.fullName}\x1b[0m | Vai trò: ${Formatter_1.Formatter.formatStatus(currentUser.role)}`);
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
        const choice = await InputPrompt_1.InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');
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
                }
                else {
                    console.log('\x1b[31m⚠️ Bạn không có quyền truy cập chức năng này!\x1b[0m');
                    await InputPrompt_1.InputPrompt.pause();
                }
                break;
            case '6':
            case '7':
            case '8':
                console.log('\n\x1b[33mℹ️ Module Hợp đồng, Hóa đơn & Báo cáo tài chính thuộc phân hệ Thành viên 2.');
                console.log('Hệ thống Database và Model sẵn sàng cho việc tích hợp!\x1b[0m');
                await InputPrompt_1.InputPrompt.pause();
                break;
            case '9':
                authService.logout();
                console.log('\x1b[32m✔ Đã đăng xuất thành công.\x1b[0m');
                await InputPrompt_1.InputPrompt.pause();
                console.clear();
                break;
            case '0':
                console.log('\nCảm ơn bạn đã sử dụng Hệ thống Quản lý Phòng trọ!');
                InputPrompt_1.InputPrompt.close();
                process.exit(0);
            default:
                console.log('\x1b[31m⚠️ Lựa chọn không hợp lệ, vui lòng thử lại!\x1b[0m');
                await InputPrompt_1.InputPrompt.pause();
        }
    }
    InputPrompt_1.InputPrompt.close();
}
bootstrap().catch(err => {
    console.error('Lỗi khởi động hệ thống:', err);
});
//# sourceMappingURL=index.js.map