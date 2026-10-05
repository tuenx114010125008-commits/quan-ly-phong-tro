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

async function runLiveDemo() {
  console.log('========================================================================================');
  console.log('                 DEMO CHUC NANG HE THONG QUAN LY PHONG TRO                              ');
  console.log('========================================================================================\n');

  // 1. Khoi tao DB & repositories
  console.log('[1] Khoi tao SQLite Database & Seed du lieu mau...');
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

  console.log(`- Phong tro: ${roomRepo.count()}`);
  console.log(`- Khach thue: ${customerRepo.count()}`);
  console.log(`- Hop dong: ${contractRepo.count()}`);
  console.log(`- Hoa don: ${invoiceRepo.count()}\n`);

  // 2. Dang nhap
  console.log('[2] Dang nhap he thong (Admin)...');
  const loginRes = authService.login('admin', 'admin123');
  if (loginRes.success && loginRes.data) {
    console.log(`- Dang nhap thanh cong: ${loginRes.data.fullName} (${loginRes.data.role})\n`);
  }

  // 3. Hop dong
  console.log('[3] Tao va quan ly hop dong thue...');
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
      notes: 'Hop dong demo'
    });

    if (createContractRes.success && createContractRes.data) {
      contractForBillingId = createContractRes.data.id;
      const updatedRoom = roomService.getRoomById('P002');
      console.log(`- Tao hop dong: ${createContractRes.data.id} cho phong P002 (Trang thai: ${updatedRoom?.status})`);
    }
  } else {
    contractForBillingId = existingContractP2.id;
    console.log(`- Hop dong phong P002 da co san: ${existingContractP2.id}`);
  }

  // 4. Tinh tien dien bac thang
  console.log('\n[4] Tinh tien dien theo bieu gia bac thang (250 kWh)...');
  const elTest = BillingCalculator.calculateTieredElectricityBill(250);
  Formatter.formatTable(
    ['Bac', 'So kWh', 'Don Gia', 'Thanh Tien'],
    elTest.tierDetails.map(t => [t.tierName, `${t.kwhInTier} kWh`, Formatter.formatCurrency(t.unitPrice), Formatter.formatCurrency(t.amount)])
  );
  console.log(`- Truoc thue: ${Formatter.formatCurrency(elTest.subtotal)} | VAT 8%: ${Formatter.formatCurrency(elTest.vatAmount)} | Tong: ${Formatter.formatCurrency(elTest.total)}`);

  // 5. Lap hoa don & thanh toan
  console.log(`\n[5] Lap hoa don & Thanh toan cho hop dong ${contractForBillingId}...`);
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
    console.log(`- Lap hoa don ${invoiceRes.data.id}: ${Formatter.formatCurrency(invoiceRes.data.totalAmount)}`);
  }

  const payRes = paymentService.payInvoice(targetInvId, 'Chuyển khoản', 'Admin');
  if (payRes.success && payRes.data) {
    console.log(`- Thanh toan hoa don ${targetInvId}: ${payRes.data.receiptId}`);
  }

  // 6. Bao cao thong ke
  console.log('\n[6] Thong ke tong quan...');
  const overview = reportService.getOverviewReport();
  Formatter.formatTable(
    ['Chi So', 'Gia Tri'],
    [
      ['Tong so phong', `${overview.totalRooms}`],
      ['So phong da thue', `${overview.rentedRooms}`],
      ['Ty le lap day', `${overview.occupancyRate}%`],
      ['Hoa don da thanh toan', `${overview.paidInvoices}`],
      ['Tong doanh thu thuc thu', Formatter.formatCurrency(overview.totalRevenue)],
      ['Tong cong no', Formatter.formatCurrency(overview.totalOutstanding)]
    ]
  );

  // 7. Xuat JSON
  console.log('\n[7] Xuat bao cao ra file JSON vao thu muc reports/...');
  reportService.exportReportToJson('overview');
  reportService.exportReportToJson('revenue');
  reportService.exportReportToJson('debt');
  reportService.exportReportToJson('expiring');
  console.log('- Da xuat day du 4 file bao cao JSON.');

  console.log('\n========================================================================================');
  console.log('                          HOAN TAT CHUONG TRINH DEMO                                    ');
  console.log('========================================================================================\n');
}

runLiveDemo().catch(console.error);
