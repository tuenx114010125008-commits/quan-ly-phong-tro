import { BaseEntity } from './BaseEntity';
import { ID } from '../types/common.types';
export declare enum InvoiceStatus {
    UNPAID = "UNPAID",// Chưa thanh toán
    PAID = "PAID",// Đã thanh toán
    CANCELLED = "CANCELLED"
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
    surcharge: number;
    discount: number;
    totalAmount: number;
    status: InvoiceStatus;
    paymentDate?: Date;
}
