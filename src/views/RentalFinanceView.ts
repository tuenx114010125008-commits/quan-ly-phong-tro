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
  ) {}

  // ==========================================
  // 1. QUẢN LÝ HỢP ĐỒNG THUÊ PHÒNG
  // ==========================================
  public async handleContractMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log('\x1b[1;33m               📝 QUẢN LÝ HỢP ĐỒNG THUÊ PHÒNG           \x1b[0m');
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log(' [1] Danh sách tất cả hợp đồng');
      console.log(' [2] Tạo hợp đồng thuê phòng mới');
      console.log(' [3] Gia hạn thời hạn hợp đồng');
      console.log(' [4] Kết thúc / Hủy hợp đồng trước hạn');
      console.log(' [5] Tìm kiếm hợp đồng');
      console.log(' [6] Danh sách hợp đồng sắp hết hạn (trong 30 ngày)');
      console.log(' [0] Quay lại Menu chính');
      console.log('\x1b[36m---------------------------------------------------------\x1b[0m');

      const choice = await InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');
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
          console.log('\x1b[31m⚠️ Lựa chọn không hợp lệ!\x1b[0m');
          await InputPrompt.pause();
      }
    }
  }

  private displayContractList(contracts: any[]): void {
    console.log(`\n\x1b[1m--- DANH SÁCH HỢP ĐỒNG THUÊ (${contracts.length} hợp đồng) ---\x1b[0m`);
    const headers = ['Mã HĐ', 'Mã Phòng', 'Số Khách', 'Bắt Đầu', 'Kết Thúc', 'Tiền Cọc', 'Giá Thuê/Tháng', 'Trạng Thái'];
    const rows = contracts.map(c => [
      c.id,
      c.roomId,
      `${c.customerIds.length} người`,
      Formatter.formatDate(c.startDate),
      Formatter.formatDate(c.endDate),
      Formatter.formatCurrency(c.deposit),
      Formatter.formatCurrency(c.monthlyRent),
      c.status === ContractStatus.ACTIVE ? '\x1b[32mĐANG HIỆU LỰC\x1b[0m' : (c.status === ContractStatus.EXPIRED ? '\x1b[33mHẾT HẠN\x1b[0m' : '\x1b[31mĐÃ CHẤM DỨT\x1b[0m')
    ]);
    Formatter.formatTable(headers, rows);
  }

  private async createContract(): Promise<void> {
    console.log('\n\x1b[1;32m--- LẬP HỢP ĐỒNG THUÊ PHÒNG MỚI ---\x1b[0m');
    const roomId = await InputPrompt.ask('Nhập mã phòng cần thuê (VD: P002): ');
    const custInput = await InputPrompt.ask('Nhập các mã khách thuê (cách nhau dấu phẩy, VD: KH001, KH002): ');
    const customerIds = custInput.split(',').map(s => s.trim()).filter(Boolean);

    const startDate = await InputPrompt.ask('Ngày bắt đầu YYYY-MM-DD (VD: 2026-10-01): ');
    const endDate = await InputPrompt.ask('Ngày kết thúc YYYY-MM-DD (VD: 2027-10-01): ');
    const deposit = await InputPrompt.askNumber('Tiền đặt cọc VNĐ (VD: 3000000): ');
    const rentInput = await InputPrompt.ask('Giá thuê/tháng (để trống để lấy giá mặc định của phòng): ');
    const monthlyRent = rentInput ? Number(rentInput) : undefined;
    const notes = await InputPrompt.ask('Ghi chú hợp đồng: ');

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
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      res.errors?.forEach(e => console.log(`   - ${e}`));
    }
    await InputPrompt.pause();
  }

  private async renewContract(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã hợp đồng cần gia hạn (VD: HD001): ');
    const c = this.contractService.getContractById(id);
    if (!c) {
      console.log('\x1b[31m✖ Không tìm thấy hợp đồng!\x1b[0m');
      await InputPrompt.pause();
      return;
    }

    console.log(`Hợp đồng ${id} hiện tại kết thúc vào ngày: ${Formatter.formatDate(c.endDate)}`);
    const newEndDate = await InputPrompt.ask('Nhập ngày kết thúc mới (YYYY-MM-DD): ');
    const newRentStr = await InputPrompt.ask(`Giá thuê mới VNĐ (để trống nếu giữ nguyên ${Formatter.formatCurrency(c.monthlyRent)}): `);
    const newRent = newRentStr ? Number(newRentStr) : undefined;

    const res = this.contractService.renewContract(id, newEndDate, newRent);
    if (res.success) {
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
    }
    await InputPrompt.pause();
  }

  private async terminateContract(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã hợp đồng cần kết thúc (VD: HD001): ');
    const confirm = await InputPrompt.ask(`Bạn có chắc muốn kết thúc hợp đồng "${id}"? Phòng sẽ chuyển về TRỐNG (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      const reason = await InputPrompt.ask('Lý do kết thúc hợp đồng: ');
      const res = this.contractService.terminateContract(id, reason);
      if (res.success) {
        console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      }
    }
    await InputPrompt.pause();
  }

  private async searchContract(): Promise<void> {
    const kw = await InputPrompt.ask('\nNhập từ khóa tìm kiếm (Mã HĐ / Mã Phòng): ');
    const results = this.contractService.searchContracts(kw);
    this.displayContractList(results);
    await InputPrompt.pause();
  }

  private displayExpiringContracts(): void {
    const reports = this.reportService.getExpiringContractsReport(30);
    console.log(`\n\x1b[1;33m--- CẢNH BÁO: HỢP ĐỒNG SẮP HẾT HẠN TRONG 30 NGÀY (${reports.length} hợp đồng) ---\x1b[0m`);
    const headers = ['Mã HĐ', 'Số Phòng', 'Khách Thuê', 'Ngày Hết Hạn', 'Còn Lại', 'Tiền Cọc'];
    const rows = reports.map(r => [
      r.contractId,
      r.roomNumber,
      r.customerNames,
      Formatter.formatDate(r.endDate),
      `\x1b[31m${r.remainingDays} ngày\x1b[0m`,
      Formatter.formatCurrency(r.deposit)
    ]);
    Formatter.formatTable(headers, rows);
  }

  // ==========================================
  // 2. QUẢN LÝ HÓA ĐƠN & TÍNH TIỀN
  // ==========================================
  public async handleInvoiceMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log('\x1b[1;33m               🧾 QUẢN LÝ HÓA ĐƠN HÀNG THÁNG            \x1b[0m');
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log(' [1] Danh sách tất cả hóa đơn');
      console.log(' [2] Lập hóa đơn tiền phòng & dịch vụ tháng mới');
      console.log(' [3] Xem chi tiết một hóa đơn');
      console.log(' [4] Danh sách hóa đơn chưa thanh toán (công nợ)');
      console.log(' [5] Hủy hóa đơn');
      console.log(' [6] Tìm kiếm hóa đơn');
      console.log(' [0] Quay lại Menu chính');
      console.log('\x1b[36m---------------------------------------------------------\x1b[0m');

      const choice = await InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');
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
          console.log('\x1b[31m⚠️ Lựa chọn không hợp lệ!\x1b[0m');
          await InputPrompt.pause();
      }
    }
  }

  private displayInvoiceList(invoices: any[]): void {
    console.log(`\n\x1b[1m--- DANH SÁCH HÓA ĐƠN (${invoices.length} hóa đơn) ---\x1b[0m`);
    const headers = ['Mã HĐN', 'Mã Hợp Đồng', 'Mã Phòng', 'Kỳ Thu', 'Tiền Phòng', 'Tiền Điện', 'Tiền Nước', 'TỔNG TIỀN', 'Trạng Thái'];
    const rows = invoices.map(i => [
      i.id,
      i.contractId,
      i.roomId,
      `T${i.month}/${i.year}`,
      Formatter.formatCurrency(i.roomRentAmount),
      Formatter.formatCurrency(i.electricityAmount),
      Formatter.formatCurrency(i.waterAmount),
      `\x1b[1;32m${Formatter.formatCurrency(i.totalAmount)}\x1b[0m`,
      i.status === InvoiceStatus.PAID ? '\x1b[32mĐÃ THANH TOÁN\x1b[0m' : (i.status === InvoiceStatus.UNPAID ? '\x1b[31mCHƯA THANH TOÁN\x1b[0m' : '\x1b[90mĐÃ HỦY\x1b[0m')
    ]);
    Formatter.formatTable(headers, rows);
  }

  private async createInvoice(): Promise<void> {
    console.log('\n\x1b[1;32m--- LẬP HÓA ĐƠN TIỀN PHÒNG & DỊCH VỤ ---\x1b[0m');
    const contractId = await InputPrompt.ask('Nhập mã hợp đồng (VD: HD001): ');
    const month = await InputPrompt.askNumber('Tháng tính tiền (1-12): ');
    const year = await InputPrompt.askNumber('Năm tính tiền (VD: 2026): ');

    console.log('\n--- Chỉ số điện & nước ---');
    const oldElectricity = await InputPrompt.askNumber('Chỉ số điện CŨ (kWh): ');
    const newElectricity = await InputPrompt.askNumber('Chỉ số điện MỚI (kWh): ');
    const oldWater = await InputPrompt.askNumber('Chỉ số nước CŨ (m³): ');
    const newWater = await InputPrompt.askNumber('Chỉ số nước MỚI (m³): ');

    console.log('\n--- Phụ phí & Khuyến mãi (Tùy chọn) ---');
    const surcharge = await InputPrompt.askNumber('Phụ phí phát sinh (mặc định 0 VNĐ): ', 0);
    const discount = await InputPrompt.askNumber('Giảm giá / Chiết khấu (mặc định 0 VNĐ): ', 0);

    const tieredChoice = await InputPrompt.ask('Tính tiền điện theo biểu giá bậc thang EVN? (y/N - mặc định đơn giá kinh doanh): ');
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
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
      console.log(`💰 Tổng số tiền hóa đơn: \x1b[1;33m${Formatter.formatCurrency(res.data.totalAmount)}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      res.errors?.forEach(e => console.log(`   - ${e}`));
    }
    await InputPrompt.pause();
  }

  private async viewInvoiceDetail(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã hóa đơn cần xem (VD: INV001): ');
    const inv = this.invoiceService.getInvoiceById(id);
    if (!inv) {
      console.log('\x1b[31m✖ Không tìm thấy hóa đơn!\x1b[0m');
      await InputPrompt.pause();
      return;
    }

    console.log('\n\x1b[1;36m=========================================================\x1b[0m');
    console.log(`\x1b[1;33m          CHI TIẾT HÓA ĐƠN THÁNG ${inv.month}/${inv.year}        \x1b[0m`);
    console.log('\x1b[1;36m=========================================================\x1b[0m');
    console.log(` Mã hóa đơn: ${inv.id} | Hợp đồng: ${inv.contractId} | Phòng: ${inv.roomId}`);
    console.log(` Trạng thái: ${inv.status === InvoiceStatus.PAID ? '\x1b[32mĐÃ THANH TOÁN\x1b[0m' : '\x1b[31mCHƯA THANH TOÁN\x1b[0m'}`);
    if (inv.paymentDate) {
      console.log(` Ngày thanh toán: ${Formatter.formatDateTime(inv.paymentDate)}`);
    }

    const headers = ['Khoản Mục', 'Chi Tiết / Chỉ Số', 'Thành Tiền (VNĐ)'];
    const rows = [
      ['Tiền thuê phòng', '1 tháng', Formatter.formatCurrency(inv.roomRentAmount)],
      ['Tiền điện', `${inv.newElectricity - inv.oldElectricity} kWh (${inv.oldElectricity} -> ${inv.newElectricity})`, Formatter.formatCurrency(inv.electricityAmount)],
      ['Tiền nước', `${inv.newWater - inv.oldWater} m³ (${inv.oldWater} -> ${inv.newWater})`, Formatter.formatCurrency(inv.waterAmount)],
      ['Internet / Wifi', 'Cáp quang tốc độ cao', Formatter.formatCurrency(inv.internetAmount)],
      ['Vệ sinh & Rác', 'Phí dọn dẹp hàng tháng', Formatter.formatCurrency(inv.cleaningAmount)],
      ['Phụ phí', 'Phí phát sinh', Formatter.formatCurrency(inv.surcharge)],
      ['Giảm giá', 'Khuyến mãi / Giảm trừ', `-${Formatter.formatCurrency(inv.discount)}`],
      ['TỔNG CỘNG', 'Số tiền cần thanh toán', `\x1b[1;32m${Formatter.formatCurrency(inv.totalAmount)}\x1b[0m`]
    ];
    Formatter.formatTable(headers, rows);
    await InputPrompt.pause();
  }

  private async cancelInvoice(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã hóa đơn cần hủy (VD: INV001): ');
    const confirm = await InputPrompt.ask(`Bạn có chắc muốn hủy hóa đơn "${id}"? (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      const res = this.invoiceService.cancelInvoice(id);
      if (res.success) {
        console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      }
    }
    await InputPrompt.pause();
  }

  private async searchInvoice(): Promise<void> {
    const kw = await InputPrompt.ask('\nNhập từ khóa tìm kiếm (Mã HĐN / Mã HĐ / Mã Phòng): ');
    const results = this.invoiceService.searchInvoices(kw);
    this.displayInvoiceList(results);
    await InputPrompt.pause();
  }

  // ==========================================
  // 3. THANH TOÁN HÓA ĐƠN
  // ==========================================
  public async handlePaymentMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log('\x1b[1;33m               💳 THANH TOÁN HÓA ĐƠN                    \x1b[0m');
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log(' [1] Xem danh sách các hóa đơn chờ thanh toán');
      console.log(' [2] Thực hiện thanh toán hóa đơn');
      console.log(' [0] Quay lại Menu chính');
      console.log('\x1b[36m---------------------------------------------------------\x1b[0m');

      const choice = await InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');
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
          console.log('\x1b[31m⚠️ Lựa chọn không hợp lệ!\x1b[0m');
          await InputPrompt.pause();
      }
    }
  }

  private async processPayment(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã hóa đơn cần thanh toán (VD: INV001): ');
    const inv = this.invoiceService.getInvoiceById(id);
    if (!inv) {
      console.log('\x1b[31m✖ Không tìm thấy hóa đơn!\x1b[0m');
      await InputPrompt.pause();
      return;
    }

    if (inv.status === InvoiceStatus.PAID) {
      console.log(`\x1b[33m⚠️ Hóa đơn này đã được thanh toán vào ngày ${Formatter.formatDateTime(inv.paymentDate)}!\x1b[0m`);
      await InputPrompt.pause();
      return;
    }

    console.log(`\nKhách cần thanh toán số tiền: \x1b[1;32m${Formatter.formatCurrency(inv.totalAmount)}\x1b[0m`);
    console.log('Phương thức thanh toán: 1. Tiền mặt | 2. Chuyển khoản ngân hàng | 3. Quét mã QR');
    const pChoice = await InputPrompt.ask('Chọn phương thức (1-3): ');
    const methods: Record<string, string> = {
      '1': 'Tiền mặt',
      '2': 'Chuyển khoản ngân hàng',
      '3': 'Quét mã QR'
    };
    const paymentMethod = methods[pChoice] || 'Tiền mặt';
    const currentUser = this.authService.getCurrentUser();

    const res = this.paymentService.payInvoice(id, paymentMethod, currentUser?.fullName);
    if (res.success && res.data) {
      console.log('\n\x1b[1;32m=========================================================\x1b[0m');
      console.log('\x1b[1;32m               🎉 BIÊN LAI THU TIỀN THÀNH CÔNG           \x1b[0m');
      console.log('\x1b[1;32m=========================================================\x1b[0m');
      console.log(` Mã biên lai: ${res.data.receiptId}`);
      console.log(` Mã hóa đơn: ${res.data.invoiceId} (Phòng: ${res.data.roomId} - T${res.data.month}/${res.data.year})`);
      console.log(` Số tiền thu: \x1b[1;33m${Formatter.formatCurrency(res.data.totalAmount)}\x1b[0m`);
      console.log(` Hình thức: ${res.data.paymentMethod}`);
      console.log(` Người thực hiện thu: ${res.data.paidBy || 'Thu ngân'}`);
      console.log(` Thời gian thanh toán: ${Formatter.formatDateTime(res.data.paidAt)}`);
      console.log('\x1b[1;32m=========================================================\x1b[0m');
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
    }
    await InputPrompt.pause();
  }

  // ==========================================
  // 4. BÁO CÁO DOANH THU & THỐNG KÊ
  // ==========================================
  public async handleReportMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log('\x1b[1;33m               📊 BÁO CÁO DOANH THU & THỐNG KÊ          \x1b[0m');
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log(' [1] Báo cáo Tổng quan Tình hình Hoạt động');
      console.log(' [2] Thống kê Doanh thu theo Tháng trong năm');
      console.log(' [3] Top 5 Phòng có doanh thu cao nhất');
      console.log(' [4] Top 5 Khách hàng chi tiêu nhiều nhất');
      console.log(' [5] Báo cáo Công nợ & Hóa đơn chưa thu');
      console.log(' [6] Xuất toàn bộ Báo cáo ra file JSON (Export Report)');
      console.log(' [0] Quay lại Menu chính');
      console.log('\x1b[36m---------------------------------------------------------\x1b[0m');

      const choice = await InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');
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
          console.log('\x1b[31m⚠️ Lựa chọn không hợp lệ!\x1b[0m');
          await InputPrompt.pause();
      }
    }
  }

  private displayOverviewReport(): void {
    const report = this.reportService.getOverviewReport();
    console.log('\n\x1b[1;33m=========================================================\x1b[0m');
    console.log('\x1b[1;33m             BÁO CÁO TỔNG QUAN HỆ THỐNG PHÒNG TRỌ        \x1b[0m');
    console.log('\x1b[1;33m=========================================================\x1b[0m');

    const headers = ['Chỉ Số Thống Kê', 'Giá Trị'];
    const rows = [
      ['Tổng số phòng trọ', `${report.totalRooms} phòng`],
      ['Số phòng đang có khách thuê', `\x1b[32m${report.rentedRooms} phòng\x1b[0m`],
      ['Số phòng còn trống', `\x1b[36m${report.availableRooms} phòng\x1b[0m`],
      ['Số phòng đang bảo trì', `\x1b[31m${report.maintenanceRooms} phòng\x1b[0m`],
      ['TỶ LỆ LẤP ĐẦY PHÒNG', `\x1b[1;32m${report.occupancyRate}%\x1b[0m`],
      ['Tổng số khách thuê', `${report.totalCustomers} khách`],
      ['Số hợp đồng đang có hiệu lực', `${report.activeContracts} hợp đồng`],
      ['Tổng số hóa đơn đã lập', `${report.totalInvoices} hóa đơn`],
      ['Số hóa đơn đã thanh toán', `\x1b[32m${report.paidInvoices} hóa đơn\x1b[0m`],
      ['Số hóa đơn chưa thanh toán', `\x1b[31m${report.unpaidInvoices} hóa đơn\x1b[0m`],
      ['TỔNG DOANH THU THỰC THU', `\x1b[1;32m${Formatter.formatCurrency(report.totalRevenue)}\x1b[0m`],
      ['TỔNG CÔNG NỢ CHƯA THU', `\x1b[1;31m${Formatter.formatCurrency(report.totalOutstanding)}\x1b[0m`]
    ];
    Formatter.formatTable(headers, rows);
  }

  private async displayRevenueByMonth(): Promise<void> {
    const currentYear = new Date().getFullYear();
    const yearInput = await InputPrompt.ask(`\nNhập năm cần xem báo cáo [${currentYear}]: `);
    const year = yearInput ? Number(yearInput) : currentYear;

    const reports = this.reportService.getRevenueByMonth(year);
    console.log(`\n\x1b[1;33m--- BÁO CÁO DOANH THU THEO THÁNG TRONG NĂM ${year} ---\x1b[0m`);
    const headers = ['Kỳ Báo Cáo', 'Tiền Phòng', 'Tiền Điện', 'Tiền Nước', 'Dịch Vụ Khác', 'TỔNG DOANH THU'];
    const rows = reports.map(r => [
      r.period,
      Formatter.formatCurrency(r.roomRentRevenue),
      Formatter.formatCurrency(r.electricityRevenue),
      Formatter.formatCurrency(r.waterRevenue),
      Formatter.formatCurrency(r.serviceRevenue),
      `\x1b[1;32m${Formatter.formatCurrency(r.totalRevenue)}\x1b[0m`
    ]);
    Formatter.formatTable(headers, rows);
    await InputPrompt.pause();
  }

  private displayTopRooms(): void {
    const topRooms = this.reportService.getTopRooms(5);
    console.log('\n\x1b[1;33m--- TOP 5 PHÒNG TRỌ CÓ DOANH THU CAO NHẤT ---\x1b[0m');
    const headers = ['Hạng', 'Mã Phòng', 'Số Phòng', 'Số Hóa Đơn Thu', 'Tổng Doanh Thu'];
    const rows = topRooms.map((r, index) => [
      `#${index + 1}`,
      r.roomId,
      `Phòng ${r.roomNumber}`,
      `${r.invoiceCount} hóa đơn`,
      `\x1b[1;32m${Formatter.formatCurrency(r.totalRevenue)}\x1b[0m`
    ]);
    Formatter.formatTable(headers, rows);
  }

  private displayTopCustomers(): void {
    const topCust = this.reportService.getTopCustomers(5);
    console.log('\n\x1b[1;33m--- TOP 5 KHÁCH HÀNG CHI TIÊU NHIỀU NHẤT ---\x1b[0m');
    const headers = ['Hạng', 'Mã KH', 'Họ Và Tên', 'Số Điện Thoại', 'Tổng Chi Tiêu'];
    const rows = topCust.map((c, index) => [
      `#${index + 1}`,
      c.customerId,
      c.fullName,
      c.phone,
      `\x1b[1;32m${Formatter.formatCurrency(c.totalSpent)}\x1b[0m`
    ]);
    Formatter.formatTable(headers, rows);
  }

  private displayDebtReport(): void {
    const debts = this.reportService.getUnpaidInvoicesReport();
    console.log(`\n\x1b[1;31m--- BÁO CÁO CÔNG NỢ / HÓA ĐƠN CHƯA THU (${debts.length} hóa đơn) ---\x1b[0m`);
    const headers = ['Mã HĐN', 'Phòng', 'Khách Thuê', 'Kỳ Hóa Đơn', 'Hạn Nộp', 'Số Tiền Nợ'];
    const rows = debts.map(d => [
      d.invoiceId,
      d.roomNumber,
      d.customerNames,
      `T${d.month}/${d.year}`,
      d.dueDate,
      `\x1b[1;31m${Formatter.formatCurrency(d.totalAmount)}\x1b[0m`
    ]);
    Formatter.formatTable(headers, rows);
  }

  private async exportReports(): Promise<void> {
    console.log('\n\x1b[1;32m--- XUẤT BÁO CÁO RA FILE JSON ---\x1b[0m');
    console.log('1. Xuất Báo cáo Tổng quan (overview_report.json)');
    console.log('2. Xuất Báo cáo Doanh thu chi tiết (revenue_report.json)');
    console.log('3. Xuất Báo cáo Công nợ (debt_report.json)');
    console.log('4. Xuất Báo cáo Hợp đồng sắp hết hạn (expiring_contracts_report.json)');
    console.log('5. Xuất TẤT CẢ các báo cáo');

    const choice = await InputPrompt.ask('Chọn loại báo cáo (1-5): ');
    if (choice === '1') {
      const res = this.reportService.exportReportToJson('overview');
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else if (choice === '2') {
      const res = this.reportService.exportReportToJson('revenue');
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else if (choice === '3') {
      const res = this.reportService.exportReportToJson('debt');
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else if (choice === '4') {
      const res = this.reportService.exportReportToJson('expiring');
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else if (choice === '5') {
      this.reportService.exportReportToJson('overview');
      this.reportService.exportReportToJson('revenue');
      this.reportService.exportReportToJson('debt');
      this.reportService.exportReportToJson('expiring');
      console.log('\x1b[32m✔ Đã xuất tất cả 4 loại báo cáo vào thư mục reports/ thành công!\x1b[0m');
    }
    await InputPrompt.pause();
  }
}
