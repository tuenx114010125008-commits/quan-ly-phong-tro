import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { IInvoice, InvoiceEntity, InvoiceStatus } from '../models/Invoice';
import { ApiResponse, successResponse, errorResponse } from '../types/result.types';
import { ID } from '../types/common.types';
import { Logger } from '../utils/Logger';

export interface PaymentReceipt {
  receiptId: string;
  invoiceId: ID;
  contractId: ID;
  roomId: ID;
  month: number;
  year: number;
  totalAmount: number;
  paymentMethod: string;
  paidAt: Date;
  paidBy?: string;
}

export class PaymentService {
  private invoiceRepo: InvoiceRepository;

  constructor(invoiceRepo?: InvoiceRepository) {
    this.invoiceRepo = invoiceRepo || new InvoiceRepository();
  }

  public payInvoice(invoiceId: ID, paymentMethod: string = 'Tiền mặt', paidBy?: string): ApiResponse<PaymentReceipt> {
    const invoice = this.invoiceRepo.getById(invoiceId);
    if (!invoice) {
      return errorResponse(`Không tìm thấy hóa đơn với mã ID: ${invoiceId}`);
    }

    if (invoice.status === InvoiceStatus.PAID) {
      return errorResponse(`Hóa đơn "${invoiceId}" đã được thanh toán trước đó vào ngày ${invoice.paymentDate?.toLocaleDateString('vi-VN')}.`);
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      return errorResponse(`Hóa đơn "${invoiceId}" đã bị hủy, không thể thực hiện thanh toán.`);
    }

    const now = new Date();
    const updated = this.invoiceRepo.update(invoiceId, {
      status: InvoiceStatus.PAID,
      paymentDate: now
    });

    const receipt: PaymentReceipt = {
      receiptId: `REC-${invoice.id}-${Date.now().toString().slice(-4)}`,
      invoiceId: invoice.id,
      contractId: invoice.contractId,
      roomId: invoice.roomId,
      month: invoice.month,
      year: invoice.year,
      totalAmount: invoice.totalAmount,
      paymentMethod,
      paidAt: now,
      paidBy
    };

    Logger.info(`Thanh toán thành công hóa đơn ${invoiceId}. Số tiền: ${invoice.totalAmount} VNĐ qua ${paymentMethod}.`, 'PaymentService');
    return successResponse(receipt, `Thanh toán thành công hóa đơn ${invoiceId}.`);
  }
}
