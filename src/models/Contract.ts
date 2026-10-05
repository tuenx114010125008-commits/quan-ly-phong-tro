import { BaseEntity } from './BaseEntity';
import { ID } from '../types/common.types';

export enum ContractStatus {
  ACTIVE = 'ACTIVE',       // Đang có hiệu lực
  EXPIRED = 'EXPIRED',     // Đã hết hạn
  TERMINATED = 'TERMINATED'// Đã chấm dứt / hủy trước hạn
}

export interface IContract extends BaseEntity {
  roomId: ID;
  customerIds: ID[];
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  deposit: number;     // Tiền cọc (VNĐ)
  monthlyRent: number; // Giá thuê thỏa thuận (VNĐ)
  status: ContractStatus;
  notes?: string;
}

export class ContractEntity implements IContract {
  public id: ID;
  public roomId: ID;
  public customerIds: ID[];
  public startDate: string;
  public endDate: string;
  public deposit: number;
  public monthlyRent: number;
  public status: ContractStatus;
  public notes?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<IContract> & {
    roomId: ID;
    customerIds: ID[];
    startDate: string;
    endDate: string;
    deposit: number;
    monthlyRent: number;
  }) {
    this.id = data.id || '';
    this.roomId = data.roomId;
    this.customerIds = data.customerIds || [];
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.deposit = data.deposit;
    this.monthlyRent = data.monthlyRent;
    this.status = data.status || ContractStatus.ACTIVE;
    this.notes = data.notes;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  public isActive(): boolean {
    return this.status === ContractStatus.ACTIVE;
  }

  /**
   * Tính số ngày còn lại của hợp đồng so với ngày hiện tại
   */
  public getRemainingDays(): number {
    const end = new Date(this.endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Kiểm tra xem hợp đồng có sắp hết hạn (trong vòng N ngày) hay không
   */
  public isExpiringSoon(daysThreshold: number = 30): boolean {
    if (!this.isActive()) return false;
    const remaining = this.getRemainingDays();
    return remaining >= 0 && remaining <= daysThreshold;
  }

  public terminate(): void {
    this.status = ContractStatus.TERMINATED;
    this.updatedAt = new Date();
  }

  public renew(newEndDate: string): void {
    this.endDate = newEndDate;
    this.status = ContractStatus.ACTIVE;
    this.updatedAt = new Date();
  }
}
