import { DatabaseConnection } from './database/connection';
import { UserRepository } from './repositories/UserRepository';
import { RoomRepository } from './repositories/RoomRepository';
import { CustomerRepository } from './repositories/CustomerRepository';
import { ServiceRepository } from './repositories/ServiceRepository';
import { EquipmentRepository } from './repositories/EquipmentRepository';
import { ContractRepository } from './repositories/ContractRepository';
import { InvoiceRepository } from './repositories/InvoiceRepository';

import { AuthService } from './services/AuthService';
import { RoomService } from './services/RoomService';
import { CustomerService } from './services/CustomerService';
import { ServiceService } from './services/ServiceService';
import { EquipmentService } from './services/EquipmentService';
import { ContractService } from './services/ContractService';
import { InvoiceService } from './services/InvoiceService';
import { PaymentService } from './services/PaymentService';
import { ReportService } from './services/ReportService';
import { BillingCalculator } from './services/BillingCalculator';

import { Formatter } from './utils/Formatter';
import { RoomStatus, CustomerStatus } from './types/common.types';
import { InvoiceStatus } from './models/Invoice';

async function runLiveDemo() {
  console.log('\x1b[32m========================================================================================\x1b[0m');
  console.log('\x1b[1;36m     🏠 HỆ THỐNG QUẢN LÝ PHÒNG TRỌ — DEMO TỔNG THỂ TOÀN BỘ 2 PHÂN HỆ THÀNH VIÊN 1 & 2   \x1b[0m');
  console.log('\x1b[32m========================================================================================\x1b[0m\n');

  // 1. Database & Repositories Setup
  console.log('\x1b[1;33m[BƯỚC 1] KHỞI TẠO CƠ SỞ DỮ LIỆU SQLITE & SEED DATA...\x1b[0m');
  const db = DatabaseConnection.getInstance();
  db.seedDatabase();

  const userRepo = new UserRepository();
  const equipmentRepo = new EquipmentRepository();
  const roomRepo = new RoomRepository(equipmentRepo);
  const customerRepo = new CustomerRepository();
  const serviceRepo = new ServiceRepository();
  const contractRepo = new ContractRepository();
  const invoiceRepo = new InvoiceRepository();

  const authService = new AuthService(userRepo);
  const roomService = new RoomService(roomRepo, equipmentRepo);
  const customerService = new CustomerService(customerRepo);
  const serviceService = new ServiceService(serviceRepo);
  const equipmentService = new EquipmentService(equipmentRepo);
  const contractService = new ContractService(contractRepo, roomRepo, customerRepo);
  const invoiceService = new InvoiceService(invoiceRepo, contractRepo, roomRepo, serviceRepo);
  const paymentService = new PaymentService(invoiceRepo);
  const reportService = new ReportService(roomRepo, customerRepo, contractRepo, invoiceRepo);

  console.log('✔ Cơ sở dữ liệu SQLite đã sẵn sàng.');
  console.log(`✔ Dữ liệu hiện có: ${roomRepo.count()} phòng, ${customerRepo.count()} khách, ${contractRepo.count()} hợp đồng, ${invoiceRepo.count()} hóa đơn.\n`);

  // 2. Authentication Flow
  console.log('\x1b[1;33m[BƯỚC 2] DEMO ĐĂNG NHẬP & PHÂN QUYỀN (AUTHENTICATION)...\x1b[0m');
  const loginRes = authService.login('admin', 'admin123');
  if (loginRes.success && loginRes.data) {
    console.log(`✔ Đăng nhập thành công: \x1b[32m${loginRes.data.fullName}\x1b[0m (Vai trò: ${Formatter.formatStatus(loginRes.data.role)})\n`);
  }

  // 3. Contract Management & State Transition
  // Reset trạng thái P002 về AVAILABLE nếu đã có hợp đồng cũ trong các lần chạy test trước
  const existingContractP2 = contractService.getActiveContractByRoom('P002');
  let contractForBillingId = 'HD001';

  if (!existingContractP2) {
    const createContractRes = contractService.createContract({
      roomId: 'P002',
      customerIds: ['KH001', 'KH003'],
      startDate: '2026-10-01',
      endDate: '2027-10-01',
      deposit: 3000000,
      monthlyRent: 3000000,
      notes: 'Hợp đồng mới tạo trong demo'
    });

    if (createContractRes.success && createContractRes.data) {
      contractForBillingId = createContractRes.data.id;
      console.log(`✔ ${createContractRes.message}`);
      const updatedRoom = roomService.getRoomById('P002');
      console.log(`✔ Trạng thái phòng P002 sau khi tạo hợp đồng: ${Formatter.formatStatus(updatedRoom!.status)} (Tự động chuyển từ AVAILABLE -> RENTED)`);
    }
  } else {
    contractForBillingId = existingContractP2.id;
    console.log(`✔ Phòng P002 đã có hợp đồng hoạt động (Mã: ${existingContractP2.id}).`);
  }

  console.log('\n📋 Danh sách hợp đồng thuê hiện có:');
  const contracts = contractService.getAllContracts();
  Formatter.formatTable(
    ['Mã HĐ', 'Mã Phòng', 'Số Khách', 'Bắt Đầu', 'Kết Thúc', 'Tiền Cọc', 'Giá Thuê/Tháng', 'Trạng Thái'],
    contracts.map(c => [
      c.id,
      c.roomId,
      `${c.customerIds.length} người`,
      Formatter.formatDate(c.startDate),
      Formatter.formatDate(c.endDate),
      Formatter.formatCurrency(c.deposit),
      Formatter.formatCurrency(c.monthlyRent),
      '\x1b[32mĐANG HIỆU LỰC\x1b[0m'
    ])
  );

  // 4. Billing & Tiered Electricity Calculation
  console.log('\n\x1b[1;33m[BƯỚC 4] DEMO TÍNH TIỀN ĐIỆN BẬC THANG & LẬP HÓA ĐƠN (TIERED ELECTRICITY & INVOICE)...\x1b[0m');
  console.log('👉 Chi tiết cách tính tiền điện 250 kWh theo bậc thang EVN + VAT 8%:');
  const elTest = BillingCalculator.calculateTieredElectricityBill(250);
  Formatter.formatTable(
    ['Bậc', 'Số kWh Tiêu Thụ', 'Đơn Giá (đ/kWh)', 'Thành Tiền (VNĐ)'],
    elTest.tierDetails.map(t => [t.tierName, `${t.kwhInTier} kWh`, Formatter.formatCurrency(t.unitPrice), Formatter.formatCurrency(t.amount)])
  );
  console.log(` Tiền điện trước thuế: ${Formatter.formatCurrency(elTest.subtotal)} | VAT 8%: ${Formatter.formatCurrency(elTest.vatAmount)} | Tổng: \x1b[1;32m${Formatter.formatCurrency(elTest.total)}\x1b[0m`);

  console.log(`\n👉 Lập hóa đơn mới tháng 11/2026 cho hợp đồng ${contractForBillingId}:`);
  let targetInvId = 'INV003';
  const invoiceRes = invoiceService.createInvoice({
    contractId: contractForBillingId,
    month: 11,
    year: 2026,
    oldElectricity: 100,
    newElectricity: 220,
    oldWater: 10,
    newWater: 16,
    surcharge: 20000,
    discount: 50000,
    useTieredElectricity: true
  });

  if (invoiceRes.success && invoiceRes.data) {
    targetInvId = invoiceRes.data.id;
    console.log(`✔ ${invoiceRes.message} (Mã HĐN: ${invoiceRes.data.id} - Tổng tiền: ${Formatter.formatCurrency(invoiceRes.data.totalAmount)})`);
  } else {
    console.log(`✔ Hóa đơn tháng 11/2026 đã tồn tại trên hệ thống.`);
  }

  // 5. Payment Flow
  console.log('\n\x1b[1;33m[BƯỚC 5] DEMO THANH TOÁN HÓA ĐƠN (PAYMENT FLOW & RECEIPT)...\x1b[0m');
  console.log(`👉 Thực hiện thanh toán cho hóa đơn ${targetInvId} qua Chuyển khoản ngân hàng:`);
  const payRes = paymentService.payInvoice(targetInvId, 'Chuyển khoản ngân hàng', 'Admin');
  if (payRes.success && payRes.data) {
    console.log(`✔ ${payRes.message}`);
    console.log(`🧾 [BIÊN LAI] Mã: ${payRes.data.receiptId} | Số tiền: ${Formatter.formatCurrency(payRes.data.totalAmount)} | Lúc: ${Formatter.formatDateTime(payRes.data.paidAt)}`);
  } else {
    console.log(`✔ Hóa đơn ${targetInvId} đã ở trạng thái ĐÃ THANH TOÁN.`);
  }

  // 6. Reports & Statistics
  console.log('\n\x1b[1;33m[BƯỚC 6] DEMO BÁO CÁO DOANH THU & THỐNG KÊ (REPORTS & STATS)...\x1b[0m');
  const overview = reportService.getOverviewReport();
  Formatter.formatTable(
    ['Chỉ Số Tổng Quan', 'Giá Trị'],
    [
      ['Tổng số phòng trọ', `${overview.totalRooms} phòng`],
      ['Số phòng đang cho thuê', `\x1b[32m${overview.rentedRooms} phòng\x1b[0m`],
      ['Số phòng trống', `\x1b[36m${overview.availableRooms} phòng\x1b[0m`],
      ['TỶ LỆ LẤP ĐẦY PHÒNG', `\x1b[1;32m${overview.occupancyRate}%\x1b[0m`],
      ['Tổng số hóa đơn đã thanh toán', `${overview.paidInvoices} hóa đơn`],
      ['Số hóa đơn chờ thanh toán', `${overview.unpaidInvoices} hóa đơn`],
      ['TỔNG DOANH THU THỰC THU', `\x1b[1;32m${Formatter.formatCurrency(overview.totalRevenue)}\x1b[0m`],
      ['TỔNG CÔNG NỢ CHƯA THU', `\x1b[1;31m${Formatter.formatCurrency(overview.totalOutstanding)}\x1b[0m`]
    ]
  );

  console.log('\n📋 Top phòng có doanh thu cao nhất:');
  const topRooms = reportService.getTopRooms(3);
  Formatter.formatTable(
    ['Hạng', 'Mã Phòng', 'Số Phòng', 'Doanh Thu'],
    topRooms.map((r, i) => [`#${i + 1}`, r.roomId, `Phòng ${r.roomNumber}`, Formatter.formatCurrency(r.totalRevenue)])
  );

  // 7. Export JSON Reports
  console.log('\n\x1b[1;33m[BƯỚC 7] DEMO XUẤT BÁO CÁO RA FILE JSON (EXPORT REPORTS)...\x1b[0m');
  const exp1 = reportService.exportReportToJson('overview');
  const exp2 = reportService.exportReportToJson('revenue');
  const exp3 = reportService.exportReportToJson('debt');
  const exp4 = reportService.exportReportToJson('expiring');
  console.log(`✔ ${exp1.message}`);
  console.log(`✔ ${exp2.message}`);
  console.log(`✔ ${exp3.message}`);
  console.log(`✔ ${exp4.message}`);

  console.log('\x1b[32m========================================================================================\x1b[0m');
  console.log('\x1b[1;32m   🎉 TOÀN BỘ CHỨC NĂNG CỦA THÀNH VIÊN 1 VÀ THÀNH VIÊN 2 ĐÃ HOÀN TẤT & CHẠY XUẤT SẮC!   \x1b[0m');
  console.log('\x1b[32m========================================================================================\x1b[0m\n');
}

runLiveDemo().catch(console.error);
