import * as fs from 'fs';
import * as path from 'path';
import { RoomRepository } from '../repositories/RoomRepository';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { ContractRepository } from '../repositories/ContractRepository';
import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { RoomStatus, CustomerStatus } from '../types/common.types';
import { InvoiceStatus } from '../models/Invoice';
import { ContractStatus, ContractEntity } from '../models/Contract';
import {
  OverviewReport,
  RevenueTimeReport,
  TopRoomReport,
  TopCustomerReport,
  UnpaidInvoiceReport,
  ExpiringContractReport
} from '../types/report.types';
import { ApiResponse, successResponse, errorResponse } from '../types/result.types';
import { Logger } from '../utils/Logger';

export class ReportService {
  private roomRepo: RoomRepository;
  private customerRepo: CustomerRepository;
  private contractRepo: ContractRepository;
  private invoiceRepo: InvoiceRepository;

  constructor(
    roomRepo?: RoomRepository,
    customerRepo?: CustomerRepository,
    contractRepo?: ContractRepository,
    invoiceRepo?: InvoiceRepository
  ) {
    this.roomRepo = roomRepo || new RoomRepository();
    this.customerRepo = customerRepo || new CustomerRepository();
    this.contractRepo = contractRepo || new ContractRepository();
    this.invoiceRepo = invoiceRepo || new InvoiceRepository();
  }

  /**
   * 1. Báo cáo tổng quan hệ thống
   */
  public getOverviewReport(): OverviewReport {
    const rooms = this.roomRepo.getAll();
    const customers = this.customerRepo.getAll();
    const contracts = this.contractRepo.getAll();
    const invoices = this.invoiceRepo.getAll();

    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
    const rentedRooms = rooms.filter(r => r.status === RoomStatus.RENTED).length;
    const maintenanceRooms = rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length;
    const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

    const totalCustomers = customers.filter(c => c.status === CustomerStatus.ACTIVE).length;
    const activeContracts = contracts.filter(c => c.status === ContractStatus.ACTIVE).length;

    const totalInvoices = invoices.length;
    const paidInvoicesList = invoices.filter(i => i.status === InvoiceStatus.PAID);
    const unpaidInvoicesList = invoices.filter(i => i.status === InvoiceStatus.UNPAID);

    const paidInvoices = paidInvoicesList.length;
    const unpaidInvoices = unpaidInvoicesList.length;

    const totalRevenue = paidInvoicesList.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalOutstanding = unpaidInvoicesList.reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      totalRooms,
      availableRooms,
      rentedRooms,
      maintenanceRooms,
      occupancyRate,
      totalCustomers,
      activeContracts,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      totalRevenue,
      totalOutstanding
    };
  }

  /**
   * 2. Báo cáo doanh thu theo tháng trong năm
   */
  public getRevenueByMonth(year: number): RevenueTimeReport[] {
    const paidInvoices = this.invoiceRepo.find(i => i.status === InvoiceStatus.PAID && i.year === year);
    const result: RevenueTimeReport[] = [];

    for (let month = 1; month <= 12; month++) {
      const monthInvoices = paidInvoices.filter(i => i.month === month);
      const roomRentRevenue = monthInvoices.reduce((sum, i) => sum + i.roomRentAmount, 0);
      const electricityRevenue = monthInvoices.reduce((sum, i) => sum + i.electricityAmount, 0);
      const waterRevenue = monthInvoices.reduce((sum, i) => sum + i.waterAmount, 0);
      const serviceRevenue = monthInvoices.reduce((sum, i) => sum + i.internetAmount + i.cleaningAmount + i.surcharge - i.discount, 0);
      const totalRevenue = monthInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

      result.push({
        period: `Tháng ${month}/${year}`,
        roomRentRevenue,
        electricityRevenue,
        waterRevenue,
        serviceRevenue,
        totalRevenue,
        invoiceCount: monthInvoices.length
      });
    }

    return result;
  }

  /**
   * 3. Top N phòng trọ mang lại doanh thu cao nhất
   */
  public getTopRooms(topN: number = 5): TopRoomReport[] {
    const paidInvoices = this.invoiceRepo.find(i => i.status === InvoiceStatus.PAID);
    const roomRevenueMap = new Map<string, { totalRevenue: number; count: number }>();

    for (const inv of paidInvoices) {
      const current = roomRevenueMap.get(inv.roomId) || { totalRevenue: 0, count: 0 };
      current.totalRevenue += inv.totalAmount;
      current.count += 1;
      roomRevenueMap.set(inv.roomId, current);
    }

    const reports: TopRoomReport[] = [];
    for (const [roomId, data] of roomRevenueMap.entries()) {
      const room = this.roomRepo.getById(roomId);
      reports.push({
        roomId,
        roomNumber: room ? room.roomNumber : roomId,
        totalRevenue: data.totalRevenue,
        invoiceCount: data.count
      });
    }

    return reports.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, topN);
  }

  /**
   * 4. Top N khách hàng chi trả nhiều nhất
   */
  public getTopCustomers(topN: number = 5): TopCustomerReport[] {
    const paidInvoices = this.invoiceRepo.find(i => i.status === InvoiceStatus.PAID);
    const customerSpentMap = new Map<string, number>();

    for (const inv of paidInvoices) {
      const contract = this.contractRepo.getById(inv.contractId);
      if (contract && contract.customerIds.length > 0) {
        // Chia đều hoặc tính cho khách đại diện
        const splitAmount = inv.totalAmount / contract.customerIds.length;
        for (const custId of contract.customerIds) {
          const current = customerSpentMap.get(custId) || 0;
          customerSpentMap.set(custId, current + splitAmount);
        }
      }
    }

    const reports: TopCustomerReport[] = [];
    for (const [custId, spent] of customerSpentMap.entries()) {
      const customer = this.customerRepo.getById(custId);
      reports.push({
        customerId: custId,
        fullName: customer ? customer.fullName : custId,
        phone: customer ? customer.phone : '-',
        totalSpent: Math.round(spent)
      });
    }

    return reports.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, topN);
  }

  /**
   * 5. Báo cáo công nợ / Hóa đơn chưa thanh toán
   */
  public getUnpaidInvoicesReport(): UnpaidInvoiceReport[] {
    const unpaid = this.invoiceRepo.getUnpaidInvoices();
    return unpaid.map(inv => {
      const room = this.roomRepo.getById(inv.roomId);
      const contract = this.contractRepo.getById(inv.contractId);
      let customerNames = 'Khách chưa xác định';

      if (contract && contract.customerIds.length > 0) {
        const names = contract.customerIds.map(id => {
          const c = this.customerRepo.getById(id);
          return c ? c.fullName : id;
        });
        customerNames = names.join(', ');
      }

      return {
        invoiceId: inv.id,
        contractId: inv.contractId,
        roomNumber: room ? room.roomNumber : inv.roomId,
        customerNames,
        month: inv.month,
        year: inv.year,
        totalAmount: inv.totalAmount,
        dueDate: `10/${String(inv.month).padStart(2, '0')}/${inv.year}`
      };
    });
  }

  /**
   * 6. Báo cáo hợp đồng sắp hết hạn (trong vòng 30 ngày)
   */
  public getExpiringContractsReport(daysThreshold: number = 30): ExpiringContractReport[] {
    const contracts = this.contractRepo.find(c => c.status === ContractStatus.ACTIVE);
    const expiring: ExpiringContractReport[] = [];

    for (const c of contracts) {
      const entity = c instanceof ContractEntity ? c : new ContractEntity(c);
      if (entity.isExpiringSoon(daysThreshold)) {
        const room = this.roomRepo.getById(c.roomId);
        const names = c.customerIds.map(id => {
          const cust = this.customerRepo.getById(id);
          return cust ? cust.fullName : id;
        }).join(', ');

        expiring.push({
          contractId: c.id,
          roomNumber: room ? room.roomNumber : c.roomId,
          customerNames: names || '-',
          startDate: c.startDate,
          endDate: c.endDate,
          remainingDays: entity.getRemainingDays(),
          deposit: c.deposit
        });
      }
    }

    return expiring.sort((a, b) => a.remainingDays - b.remainingDays);
  }

  /**
   * 7. Xuất dữ liệu báo cáo ra file JSON
   */
  public exportReportToJson(reportType: 'overview' | 'revenue' | 'debt' | 'expiring', customPath?: string): ApiResponse<string> {
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    let fileName = `${reportType}_report_${Date.now()}.json`;
    let data: any = {};

    switch (reportType) {
      case 'overview':
        fileName = 'overview_report.json';
        data = {
          generatedAt: new Date().toISOString(),
          overview: this.getOverviewReport()
        };
        break;
      case 'revenue':
        fileName = 'revenue_report.json';
        const currentYear = new Date().getFullYear();
        data = {
          generatedAt: new Date().toISOString(),
          year: currentYear,
          revenueByMonth: this.getRevenueByMonth(currentYear),
          topRooms: this.getTopRooms(5),
          topCustomers: this.getTopCustomers(5)
        };
        break;
      case 'debt':
        fileName = 'debt_report.json';
        data = {
          generatedAt: new Date().toISOString(),
          unpaidInvoices: this.getUnpaidInvoicesReport()
        };
        break;
      case 'expiring':
        fileName = 'expiring_contracts_report.json';
        data = {
          generatedAt: new Date().toISOString(),
          expiringContracts: this.getExpiringContractsReport(30)
        };
        break;
    }

    const targetFile = customPath || path.join(reportsDir, fileName);
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf-8');

    Logger.info(`Đã xuất báo cáo [${reportType}] thành công ra file: ${targetFile}`, 'ReportService');
    return successResponse(targetFile, `Đã xuất báo cáo "${reportType}" thành công vào file: ${targetFile}`);
  }
}
