import { ID } from './common.types';

/**
 * Thống kê tổng quan hệ thống phòng trọ
 */
export interface OverviewReport {
  totalRooms: number;
  availableRooms: number;
  rentedRooms: number;
  maintenanceRooms: number;
  occupancyRate: number; // Tỷ lệ lấp đầy (%)
  totalCustomers: number;
  activeContracts: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  totalRevenue: number;     // Tổng doanh thu thực thu (VNĐ)
  totalOutstanding: number; // Tổng công nợ chưa thu (VNĐ)
}

/**
 * Thống kê doanh thu theo thời gian (Tháng / Quý / Năm)
 */
export interface RevenueTimeReport {
  period: string; // VD: "Tháng 10/2026", "Quý 4/2026", "Năm 2026"
  roomRentRevenue: number;
  electricityRevenue: number;
  waterRevenue: number;
  serviceRevenue: number;
  totalRevenue: number;
  invoiceCount: number;
}

/**
 * Top phòng trọ có doanh thu cao nhất
 */
export interface TopRoomReport {
  roomId: ID;
  roomNumber: string;
  totalRevenue: number;
  invoiceCount: number;
}

/**
 * Top khách hàng chi trả nhiều nhất
 */
export interface TopCustomerReport {
  customerId: ID;
  fullName: string;
  phone: string;
  totalSpent: number;
}

/**
 * Báo cáo hóa đơn chưa thanh toán (công nợ)
 */
export interface UnpaidInvoiceReport {
  invoiceId: ID;
  contractId: ID;
  roomNumber: string;
  customerNames: string;
  month: number;
  year: number;
  totalAmount: number;
  dueDate: string;
}

/**
 * Báo cáo hợp đồng sắp hết hạn (trong vòng 30 ngày)
 */
export interface ExpiringContractReport {
  contractId: ID;
  roomNumber: string;
  customerNames: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
  deposit: number;
}
