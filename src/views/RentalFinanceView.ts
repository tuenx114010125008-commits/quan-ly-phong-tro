import { ContractService } from '../services/ContractService';
import { InvoiceService } from '../services/InvoiceService';
import { PaymentService } from '../services/PaymentService';
import { ReportService } from '../services/ReportService';
import { CustomerService } from '../services/CustomerService';
import { RoomService } from '../services/RoomService';
import { AuthService } from '../services/AuthService';
import { InputPrompt } from './InputPrompt';
import { Formatter } from '../utils/Formatter';
import { ContractStatus } from '../models/Contract';
import { InvoiceStatus } from '../models/Invoice';

export class RentalFinanceView {
  constructor(
    private contractService: ContractService,
    private invoiceService: InvoiceService,
    private paymentService: PaymentService,
    private reportService: ReportService,
    private customerService: CustomerService,
    private roomService: RoomService,
    private authService: AuthService
  ) { }

  // 1. Menu hop dong
  public async handleContractMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('=========================================================');
      console.log('                   QUAN LY HOP DONG THUE                 ');
      console.log('=========================================================');
      console.log(' [1] Danh sach hop dong');
      console.log(' [2] Tao hop dong moi');
      console.log(' [3] Gia han hop dong');
      console.log(' [4] Ket thuc hop dong');
      console.log(' [5] Tim kiem hop dong');
      console.log(' [6] Danh sach hop dong sap het han (trong 30 ngay)');
      console.log(' [0] Quay lai menu chinh');
      console.log('---------------------------------------------------------');

      const choice = await InputPrompt.ask('Nhap lua chon: ');
      if (choice === '0') break;

      switch (choice) {
        case '1':
          this.displayContractList(this.contractService.getAllContracts());
          await InputPrompt.pause();
          break;
        case '2':
          await this.createContract();
          break;
        case '3':
          await this.renewContract();
          break;
        case '4':
          await this.terminateContract();
          break;
        case '5':
          await this.searchContract();
          break;
        case '6':
          this.displayExpiringContracts();
          await InputPrompt.pause();
          break;
        default:
          console.log('[Loi] Lua chon khong hop le.');
          await InputPrompt.pause();
      }
    }
  }

  private displayContractList(contracts: any[]): void {
    console.log(`\n--- DANH SACH HOP DONG (${contracts.length} hop dong) ---`);
    const headers = ['Ma HD', 'Ma Phong', 'So Khach', 'Bat Dau', 'Ket Thuc', 'Tien Coc', 'Gia Thue/Thang', 'Trang Thai'];
    const rows = contracts.map(c => [
      c.id,
      c.roomId,
      `${c.customerIds.length} người`,
      Formatter.formatDate(c.startDate),
      Formatter.formatDate(c.endDate),
      Formatter.formatCurrency(c.deposit),
      Formatter.formatCurrency(c.monthlyRent),
      c.status === ContractStatus.ACTIVE ? 'DANG HIEU LUC' : (c.status === ContractStatus.EXPIRED ? 'HET HAN' : 'DA CHAM DUT')
    ]);
    Formatter.formatTable(headers, rows);
  }

  private async createContract(): Promise<void> {
    console.log('\n--- LAP HOP DONG THUE MOI ---');
    const roomId = await InputPrompt.ask('Ma phong can thue (VD: P002): ');
    const custInput = await InputPrompt.ask('Ma khach thue (cach nhau dau phay, VD: KH001, KH002): ');
    const customerIds = custInput.split(',').map(s => s.trim()).filter(Boolean);

    const startDate = await InputPrompt.ask('Ngay bat dau YYYY-MM-DD (VD: 2026-10-01): ');
    const endDate = await InputPrompt.ask('Ngay ket thuc YYYY-MM-DD (VD: 2027-10-01): ');
    const deposit = await InputPrompt.askNumber('Tien dat coc (VND): ');
    const rentInput = await InputPrompt.ask('Gia thue/thang (de trong de lay gia goc cua phong): ');
    const monthlyRent = rentInput ? Number(rentInput) : undefined;
    const notes = await InputPrompt.ask('Ghi chu: ');

    const res = this.contractService.createContract({
      roomId,
      customerIds,
      startDate,
      endDate,
      deposit,
      monthlyRent,
      notes
    });

    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
      res.errors?.forEach(e => console.log(`   - ${e}`));
    }
    await InputPrompt.pause();
  }

  private async renewContract(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma hop dong can gia han (VD: HD001): ');
    const c = this.contractService.getContractById(id);
    if (!c) {
      console.log('[Loi] Khong tim thay hop dong.');
      await InputPrompt.pause();
      return;
    }

    console.log(`Hop dong ${id} ket thuc vao: ${Formatter.formatDate(c.endDate)}`);
    const newEndDate = await InputPrompt.ask('Ngay ket thuc moi (YYYY-MM-DD): ');
    const newRentStr = await InputPrompt.ask(`Gia thue moi (de trong neu giu ${Formatter.formatCurrency(c.monthlyRent)}): `);
    const newRent = newRentStr ? Number(newRentStr) : undefined;

    const res = this.contractService.renewContract(id, newEndDate, newRent);
    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
    }
    await InputPrompt.pause();
  }

  private async terminateContract(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma hop dong can ket thuc: ');
    const confirm = await InputPrompt.ask(`Ket thuc hop dong "${id}"? Phong se chuyen ve TRONG (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      const reason = await InputPrompt.ask('Ly do ket thuc: ');
      const res = this.contractService.terminateContract(id, reason);
      if (res.success) {
        console.log(`[Thanh cong] ${res.message}`);
      } else {
        console.log(`[Loi] ${res.message}`);
      }
    }
    await InputPrompt.pause();
  }

  private async searchContract(): Promise<void> {
    const kw = await InputPrompt.ask('\nNhap tu khoa tim kiem (Ma HD / Ma Phong): ');
    const results = this.contractService.searchContracts(kw);
    this.displayContractList(results);
    await InputPrompt.pause();
  }

  private displayExpiringContracts(): void {
    const reports = this.reportService.getExpiringContractsReport(30);
    console.log(`\n--- HOP DONG SAP HET HAN TRONG 30 NGAY (${reports.length} hop dong) ---`);
    const headers = ['Ma HD', 'So Phong', 'Khach Thue', 'Ngay Het Han', 'Con Lai', 'Tien Coc'];
    const rows = reports.map(r => [
      r.contractId,
      r.roomNumber,
      r.customerNames,
      Formatter.formatDate(r.endDate),
      `${r.remainingDays} ngay`,
      Formatter.formatCurrency(r.deposit)
    ]);
    Formatter.formatTable(headers, rows);
  }

  // 2. Menu hoa don
  public async handleInvoiceMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('=========================================================');
      console.log('                   QUAN LY HOA DON HANG THANG            ');
      console.log('=========================================================');
      console.log(' [1] Danh sach hoa don');
      console.log(' [2] Lap hoa don tien phong & dich vu');
      console.log(' [3] Xem chi tiet hoa don');
      console.log(' [4] Danh sach hoa don chua thanh toan (cong no)');
      console.log(' [5] Huy hoa don');
      console.log(' [6] Tim kiem hoa don');
      console.log(' [0] Quay lai menu chinh');
      console.log('---------------------------------------------------------');

      const choice = await InputPrompt.ask('Nhap lua chon: ');
      if (choice === '0') break;

      switch (choice) {
        case '1':
          this.displayInvoiceList(this.invoiceService.getAllInvoices());
          await InputPrompt.pause();
          break;
        case '2':
          await this.createInvoice();
          break;
        case '3':
          await this.viewInvoiceDetail();
          break;
        case '4':
          this.displayInvoiceList(this.invoiceService.getUnpaidInvoices());
          await InputPrompt.pause();
          break;
        case '5':
          await this.cancelInvoice();
          break;
        case '6':
          await this.searchInvoice();
          break;
        default:
          console.log('[Loi] Lua chon khong hop le.');
          await InputPrompt.pause();
      }
    }
  }

  private displayInvoiceList(invoices: any[]): void {
    console.log(`\n--- DANH SACH HOA DON (${invoices.length} hoa don) ---`);
    const headers = ['Ma HDN', 'Ma Hop Dong', 'Ma Phong', 'Ky Thu', 'Tien Phong', 'Tien Dien', 'Tien Nuoc', 'TONG TIEN', 'Trang Thai'];
    const rows = invoices.map(i => [
      i.id,
      i.contractId,
      i.roomId,
      `T${i.month}/${i.year}`,
      Formatter.formatCurrency(i.roomRentAmount),
      Formatter.formatCurrency(i.electricityAmount),
      Formatter.formatCurrency(i.waterAmount),
      Formatter.formatCurrency(i.totalAmount),
      i.status === InvoiceStatus.PAID ? 'DA THANH TOAN' : (i.status === InvoiceStatus.UNPAID ? 'CHUA THANH TOAN' : 'DA HUY')
    ]);
    Formatter.formatTable(headers, rows);
  }

  private async createInvoice(): Promise<void> {
    console.log('\n--- LAP HOA DON TIEN PHONG & DICH VU ---');
    const contractId = await InputPrompt.ask('Ma hop dong (VD: HD001): ');
    const month = await InputPrompt.askNumber('Thang tinh tien (1-12): ');
    const year = await InputPrompt.askNumber('Nam tinh tien (VD: 2026): ');

    console.log('--- Chi so dien & nuoc ---');
    const oldElectricity = await InputPrompt.askNumber('Chi so dien CU (kWh): ');
    const newElectricity = await InputPrompt.askNumber('Chi so dien MOI (kWh): ');
    const oldWater = await InputPrompt.askNumber('Chi so nuoc CU (m3): ');
    const newWater = await InputPrompt.askNumber('Chi so nuoc MOI (m3): ');

    const surcharge = await InputPrompt.askNumber('Phu phi phat sinh (mac dinh 0): ', 0);
    const discount = await InputPrompt.askNumber('Giam gia (mac dinh 0): ', 0);

    const tieredChoice = await InputPrompt.ask('Tinh tien dien theo bac thang EVN? (y/N): ');
    const useTieredElectricity = tieredChoice.toLowerCase() === 'y';

    const res = this.invoiceService.createInvoice({
      contractId,
      month,
      year,
      oldElectricity,
      newElectricity,
      oldWater,
      newWater,
      surcharge,
      discount,
      useTieredElectricity
    });

    if (res.success && res.data) {
      console.log(`[Thanh cong] ${res.message}`);
      console.log(`Tong tien: ${Formatter.formatCurrency(res.data.totalAmount)}`);
    } else {
      console.log(`[Loi] ${res.message}`);
      res.errors?.forEach(e => console.log(`   - ${e}`));
    }
    await InputPrompt.pause();
  }

  private async viewInvoiceDetail(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma hoa don can xem: ');
    const inv = this.invoiceService.getInvoiceById(id);
    if (!inv) {
      console.log('[Loi] Khong tim thay hoa don.');
      await InputPrompt.pause();
      return;
    }

    console.log('\n=========================================================');
    console.log(`            CHI TIET HOA DON THANG ${inv.month}/${inv.year}       `);
    console.log('=========================================================');
    console.log(` Ma hoa don: ${inv.id} | Hop dong: ${inv.contractId} | Phong: ${inv.roomId}`);
    console.log(` Trang thai: ${inv.status === InvoiceStatus.PAID ? 'DA THANH TOAN' : 'CHUA THANH TOAN'}`);
    if (inv.paymentDate) {
      console.log(` Ngay thanh toan: ${Formatter.formatDateTime(inv.paymentDate)}`);
    }

    const headers = ['Khoan Muc', 'Chi Tiet', 'Thanh Tien (VND)'];
    const rows = [
      ['Tien thue phong', '1 thang', Formatter.formatCurrency(inv.roomRentAmount)],
      ['Tien dien', `${inv.newElectricity - inv.oldElectricity} kWh (${inv.oldElectricity} -> ${inv.newElectricity})`, Formatter.formatCurrency(inv.electricityAmount)],
      ['Tien nuoc', `${inv.newWater - inv.oldWater} m3 (${inv.oldWater} -> ${inv.newWater})`, Formatter.formatCurrency(inv.waterAmount)],
      ['Internet / Wifi', 'Goi cuoc thang', Formatter.formatCurrency(inv.internetAmount)],
      ['Ve sinh & Rac', 'Phi ve sinh', Formatter.formatCurrency(inv.cleaningAmount)],
      ['Phu phi', 'Phat sinh', Formatter.formatCurrency(inv.surcharge)],
      ['Giam gia', 'Khuyen mai', `-${Formatter.formatCurrency(inv.discount)}`],
      ['TONG CONG', 'Tong can thanh toan', Formatter.formatCurrency(inv.totalAmount)]
    ];
    Formatter.formatTable(headers, rows);
    await InputPrompt.pause();
  }

  private async cancelInvoice(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma hoa don can huy: ');
    const confirm = await InputPrompt.ask(`Huy hoa don "${id}"? (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      const res = this.invoiceService.cancelInvoice(id);
      if (res.success) {
        console.log(`[Thanh cong] ${res.message}`);
      } else {
        console.log(`[Loi] ${res.message}`);
      }
    }
    await InputPrompt.pause();
  }

  private async searchInvoice(): Promise<void> {
    const kw = await InputPrompt.ask('\nNhap tu khoa tim kiem (Ma HDN / Ma HD / Ma Phong): ');
    const results = this.invoiceService.searchInvoices(kw);
    this.displayInvoiceList(results);
    await InputPrompt.pause();
  }

  // 3. Menu thanh toan
  public async handlePaymentMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('=========================================================');
      console.log('                   THANH TOAN HOA DON                    ');
      console.log('=========================================================');
      console.log(' [1] Xem hoa don chua thanh toan');
      console.log(' [2] Thanh toan hoa don');
      console.log(' [0] Quay lai menu chinh');
      console.log('---------------------------------------------------------');

      const choice = await InputPrompt.ask('Nhap lua chon: ');
      if (choice === '0') break;

      switch (choice) {
        case '1':
          this.displayInvoiceList(this.invoiceService.getUnpaidInvoices());
          await InputPrompt.pause();
          break;
        case '2':
          await this.processPayment();
          break;
        default:
          console.log('[Loi] Lua chon khong hop le.');
          await InputPrompt.pause();
      }
    }
  }

  private async processPayment(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma hoa don can thanh toan (VD: INV001): ');
    const inv = this.invoiceService.getInvoiceById(id);
    if (!inv) {
      console.log('[Loi] Khong tim thay hoa don.');
      await InputPrompt.pause();
      return;
    }

    if (inv.status === InvoiceStatus.PAID) {
      console.log(`[Thong bao] Hoa don nay da duoc thanh toan truoc do.`);
      await InputPrompt.pause();
      return;
    }

    console.log(`So tien can thanh toan: ${Formatter.formatCurrency(inv.totalAmount)}`);
    console.log('Phuong thuc: 1. Tien mat | 2. Chuyen khoan | 3. QR Code');
    const pChoice = await InputPrompt.ask('Chon phuong thuc (1-3): ');
    const methods: Record<string, string> = {
      '1': 'Tiền mặt',
      '2': 'Chuyển khoản',
      '3': 'QR Code'
    };
    const paymentMethod = methods[pChoice] || 'Tiền mặt';
    const currentUser = this.authService.getCurrentUser();

    const res = this.paymentService.payInvoice(id, paymentMethod, currentUser?.fullName);
    if (res.success && res.data) {
      console.log('\n=========================================================');
      console.log('                 BIEN LAI THU TIEN                       ');
      console.log('=========================================================');
      console.log(` Ma bien lai: ${res.data.receiptId}`);
      console.log(` Ma hoa don: ${res.data.invoiceId} (Phong: ${res.data.roomId} - T${res.data.month}/${res.data.year})`);
      console.log(` So tien: ${Formatter.formatCurrency(res.data.totalAmount)}`);
      console.log(` Hinh thuc: ${res.data.paymentMethod}`);
      console.log(` Nguoi thu: ${res.data.paidBy || 'Thu ngân'}`);
      console.log(` Thoi gian: ${Formatter.formatDateTime(res.data.paidAt)}`);
      console.log('=========================================================');
    } else {
      console.log(`[Loi] ${res.message}`);
    }
    await InputPrompt.pause();
  }

  // 4. Menu bao cao
  public async handleReportMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('=========================================================');
      console.log('                   BAO CAO DOANH THU                     ');
      console.log('=========================================================');
      console.log(' [1] Bao cao tong quan');
      console.log(' [2] Doanh thu theo thang trong nam');
      console.log(' [3] Top 5 phong doanh thu cao nhat');
      console.log(' [4] Top 5 khach hang chi tieu nhieu nhat');
      console.log(' [5] Bao cao cong no chua thu');
      console.log(' [6] Xuat bao cao ra file JSON');
      console.log(' [0] Quay lai menu chinh');
      console.log('---------------------------------------------------------');

      const choice = await InputPrompt.ask('Nhap lua chon: ');
      if (choice === '0') break;

      switch (choice) {
        case '1':
          this.displayOverviewReport();
          await InputPrompt.pause();
          break;
        case '2':
          await this.displayRevenueByMonth();
          break;
        case '3':
          this.displayTopRooms();
          await InputPrompt.pause();
          break;
        case '4':
          this.displayTopCustomers();
          await InputPrompt.pause();
          break;
        case '5':
          this.displayDebtReport();
          await InputPrompt.pause();
          break;
        case '6':
          await this.exportReports();
          break;
        default:
          console.log('[Loi] Lua chon khong hop le.');
          await InputPrompt.pause();
      }
    }
  }

  private displayOverviewReport(): void {
    const report = this.reportService.getOverviewReport();
    console.log('\n--- BAO CAO TONG QUAN ---');
    const headers = ['Chi So', 'Gia Tri'];
    const rows = [
      ['Tong so phong', `${report.totalRooms} phong`],
      ['So phong da thue', `${report.rentedRooms} phong`],
      ['So phong trong', `${report.availableRooms} phong`],
      ['So phong bao tri', `${report.maintenanceRooms} phong`],
      ['Ty le lap day', `${report.occupancyRate}%`],
      ['Tong so khach thue', `${report.totalCustomers} khach`],
      ['Hop dong dang hieu luc', `${report.activeContracts} hop dong`],
      ['Hoa don da thanh toan', `${report.paidInvoices} hoa don`],
      ['Hoa don chua thanh toan', `${report.unpaidInvoices} hoa don`],
      ['Tong doanh thu thuc thu', Formatter.formatCurrency(report.totalRevenue)],
      ['Tong cong no chua thu', Formatter.formatCurrency(report.totalOutstanding)]
    ];
    Formatter.formatTable(headers, rows);
  }

  private async displayRevenueByMonth(): Promise<void> {
    const currentYear = new Date().getFullYear();
    const yearInput = await InputPrompt.ask(`\nNhap nam can xem [${currentYear}]: `);
    const year = yearInput ? Number(yearInput) : currentYear;

    const reports = this.reportService.getRevenueByMonth(year);
    console.log(`\n--- DOANH THU THEO THANG NĂM ${year} ---`);
    const headers = ['Ky', 'Tien Phong', 'Tien Dien', 'Tien Nuoc', 'Dich Vu Khac', 'Tong Doanh Thu'];
    const rows = reports.map(r => [
      r.period,
      Formatter.formatCurrency(r.roomRentRevenue),
      Formatter.formatCurrency(r.electricityRevenue),
      Formatter.formatCurrency(r.waterRevenue),
      Formatter.formatCurrency(r.serviceRevenue),
      Formatter.formatCurrency(r.totalRevenue)
    ]);
    Formatter.formatTable(headers, rows);
    await InputPrompt.pause();
  }

  private displayTopRooms(): void {
    const topRooms = this.reportService.getTopRooms(5);
    console.log('\n--- TOP 5 PHONG DOANH THU CAO NHAT ---');
    const headers = ['Hang', 'Ma Phong', 'So Phong', 'So Hoa Don', 'Tong Doanh Thu'];
    const rows = topRooms.map((r, index) => [
      `#${index + 1}`,
      r.roomId,
      `Phong ${r.roomNumber}`,
      `${r.invoiceCount}`,
      Formatter.formatCurrency(r.totalRevenue)
    ]);
    Formatter.formatTable(headers, rows);
  }

  private displayTopCustomers(): void {
    const topCust = this.reportService.getTopCustomers(5);
    console.log('\n--- TOP 5 KHACH HANG CHI TIEU NHIEU NHAT ---');
    const headers = ['Hang', 'Ma KH', 'Ho Ten', 'So Dien Thoai', 'Tong Chi'];
    const rows = topCust.map((c, index) => [
      `#${index + 1}`,
      c.customerId,
      c.fullName,
      c.phone,
      Formatter.formatCurrency(c.totalSpent)
    ]);
    Formatter.formatTable(headers, rows);
  }

  private displayDebtReport(): void {
    const debts = this.reportService.getUnpaidInvoicesReport();
    console.log(`\n--- DANH SACH CONG NO (${debts.length} hoa don) ---`);
    const headers = ['Ma HDN', 'Phong', 'Khach Thue', 'Ky', 'Han Nop', 'So Tien No'];
    const rows = debts.map(d => [
      d.invoiceId,
      d.roomNumber,
      d.customerNames,
      `T${d.month}/${d.year}`,
      d.dueDate,
      Formatter.formatCurrency(d.totalAmount)
    ]);
    Formatter.formatTable(headers, rows);
  }

  private async exportReports(): Promise<void> {
    console.log('\n--- XUAT BAO CAO JSON ---');
    console.log('1. Bao cao Tong quan');
    console.log('2. Bao cao Doanh thu');
    console.log('3. Bao cao Cong no');
    console.log('4. Bao cao Hop dong sap het han');
    console.log('5. Xuat tat ca');

    const choice = await InputPrompt.ask('Chon loai (1-5): ');
    if (choice === '1') {
      const res = this.reportService.exportReportToJson('overview');
      console.log(`[Thanh cong] ${res.message}`);
    } else if (choice === '2') {
      const res = this.reportService.exportReportToJson('revenue');
      console.log(`[Thanh cong] ${res.message}`);
    } else if (choice === '3') {
      const res = this.reportService.exportReportToJson('debt');
      console.log(`[Thanh cong] ${res.message}`);
    } else if (choice === '4') {
      const res = this.reportService.exportReportToJson('expiring');
      console.log(`[Thanh cong] ${res.message}`);
    } else if (choice === '5') {
      this.reportService.exportReportToJson('overview');
      this.reportService.exportReportToJson('revenue');
      this.reportService.exportReportToJson('debt');
      this.reportService.exportReportToJson('expiring');
      console.log('[Thanh cong] Da xuat tat ca bao cao vao thu muc reports/');
    }
    await InputPrompt.pause();
  }
}
