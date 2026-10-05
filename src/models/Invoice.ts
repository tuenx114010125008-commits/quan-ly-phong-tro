import { BaseEntity } from './BaseEntity';
import { ID } from '../types/common.types';

export enum InvoiceStatus {
  UNPAID = 'UNPAID',     // Chưa thanh toán
  PAID = 'PAID',         // Đã thanh toán
  CANCELLED = 'CANCELLED'// Đã hủy
}

export interface IInvoice extends BaseEntity {
  contractId: ID;
  roomId: ID;
  month: number;
  year: number;
  roomRentAmount: number;
  oldElectricity: number;
  newElectricity: number;
  electricityAmount: number;
  oldWater: number;
  newWater: number;
  waterAmount: number;
  internetAmount: number;
  cleaningAmount: number;
  surcharge: number;     // Phụ phí phát sinh
  discount: number;      // Giảm giá
  totalAmount: number;   // Tổng tiền sau giảm giá + phụ phí
  status: InvoiceStatus;
  paymentDate?: Date;
}

export class InvoiceEntity implements IInvoice {
  public id: ID;
  public contractId: ID;
  public roomId: ID;
  public month: number;
  public year: number;
  public roomRentAmount: number;
  public oldElectricity: number;
  public newElectricity: number;
  public electricityAmount: number;
  public oldWater: number;
  public newWater: number;
  public waterAmount: number;
  public internetAmount: number;
  public cleaningAmount: number;
  public surcharge: number;
  public discount: number;
  public totalAmount: number;
  public status: InvoiceStatus;
  public paymentDate?: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<IInvoice> & {
    contractId: ID;
    roomId: ID;
    month: number;
    year: number;
    roomRentAmount: number;
  }) {
    this.id = data.id || '';
    this.contractId = data.contractId;
    this.roomId = data.roomId;
    this.month = data.month;
    this.year = data.year;
    this.roomRentAmount = data.roomRentAmount;
    this.oldElectricity = data.oldElectricity || 0;
    this.newElectricity = data.newElectricity || 0;
    this.electricityAmount = data.electricityAmount || 0;
    this.oldWater = data.oldWater || 0;
    this.newWater = data.newWater || 0;
    this.waterAmount = data.waterAmount || 0;
    this.internetAmount = data.internetAmount || 0;
    this.cleaningAmount = data.cleaningAmount || 0;
    this.surcharge = data.surcharge || 0;
    this.discount = data.discount || 0;
    this.totalAmount = data.totalAmount !== undefined ? data.totalAmount : this.calculateTotal();
    this.status = data.status || InvoiceStatus.UNPAID;
    this.paymentDate = data.paymentDate ? new Date(data.paymentDate) : undefined;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  public calculateTotal(): number {
    const subtotal = this.roomRentAmount +
      this.electricityAmount +
      this.waterAmount +
      this.internetAmount +
      this.cleaningAmount +
      this.surcharge;
    const total = subtotal - this.discount;
    return Math.max(0, total);
  }

  public isPaid(): boolean {
    return this.status === InvoiceStatus.PAID;
  }

  public isUnpaid(): boolean {
    return this.status === InvoiceStatus.UNPAID;
  }

  public markAsPaid(paymentDate: Date = new Date()): void {
    if (this.isPaid()) {
      throw new Error('Hóa đơn này đã được thanh toán trước đó.');
    }
    this.status = InvoiceStatus.PAID;
    this.paymentDate = paymentDate;
    this.updatedAt = new Date();
  }

  public cancel(): void {
    this.status = InvoiceStatus.CANCELLED;
    this.updatedAt = new Date();
  }
}
