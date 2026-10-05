import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { ContractRepository } from '../repositories/ContractRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { ServiceRepository } from '../repositories/ServiceRepository';
import { IInvoice, InvoiceEntity, InvoiceStatus } from '../models/Invoice';
import { ApiResponse, successResponse, errorResponse } from '../types/result.types';
import { ID } from '../types/common.types';
import { BillingCalculator } from './BillingCalculator';
import { IdGenerator } from '../utils/IdGenerator';
import { Validator } from '../utils/Validator';
import { Logger } from '../utils/Logger';

export interface CreateInvoiceInput {
  contractId: ID;
  month: number;
  year: number;
  oldElectricity: number;
  newElectricity: number;
  oldWater: number;
  newWater: number;
  internetAmount?: number;
  cleaningAmount?: number;
  surcharge?: number;
  discount?: number;
  useTieredElectricity?: boolean; // Tùy chọn tính điện bậc thang EVN hay theo đơn giá dịch vụ
}

export class InvoiceService {
  private invoiceRepo: InvoiceRepository;
  private contractRepo: ContractRepository;
  private roomRepo: RoomRepository;
  private serviceRepo: ServiceRepository;

  constructor(
    invoiceRepo?: InvoiceRepository,
    contractRepo?: ContractRepository,
    roomRepo?: RoomRepository,
    serviceRepo?: ServiceRepository
  ) {
    this.invoiceRepo = invoiceRepo || new InvoiceRepository();
    this.contractRepo = contractRepo || new ContractRepository();
    this.roomRepo = roomRepo || new RoomRepository();
    this.serviceRepo = serviceRepo || new ServiceRepository();
  }

  public getAllInvoices(): IInvoice[] {
    return this.invoiceRepo.getAll();
  }

  public getInvoiceById(id: ID): IInvoice | undefined {
    return this.invoiceRepo.getById(id);
  }

  public getUnpaidInvoices(): IInvoice[] {
    return this.invoiceRepo.getUnpaidInvoices();
  }

  public createInvoice(input: CreateInvoiceInput): ApiResponse<IInvoice> {
    // 1. Validation cơ bản
    const rules = [
      { condition: Validator.isNotEmpty(input.contractId), message: 'Mã hợp đồng không được để trống.' },
      { condition: Validator.isInRange(input.month, 1, 12), message: 'Tháng lập hóa đơn phải từ 1 đến 12.' },
      { condition: input.year >= 2000, message: 'Năm lập hóa đơn không hợp lệ.' },
      { condition: input.newElectricity >= input.oldElectricity, message: 'Chỉ số điện mới phải >= chỉ số điện cũ.' },
      { condition: input.newWater >= input.oldWater, message: 'Chỉ số nước mới phải >= chỉ số nước cũ.' }
    ];

    const validation = Validator.validate(rules);
    if (!validation.isValid) {
      return errorResponse('Thông tin lập hóa đơn không hợp lệ.', validation.errors);
    }

    // 2. Kiểm tra hợp đồng
    const contract = this.contractRepo.getById(input.contractId);
    if (!contract) {
      return errorResponse(`Không tìm thấy hợp đồng với mã: ${input.contractId}`);
    }

    // 3. Kiểm tra xem đã có hóa đơn cùng tháng/năm cho hợp đồng này chưa
    const existing = this.invoiceRepo.findByContractAndPeriod(input.contractId, input.month, input.year);
    if (existing) {
      return errorResponse(`Hóa đơn tháng ${input.month}/${input.year} cho hợp đồng "${input.contractId}" đã tồn tại (Mã HĐ: ${existing.id}).`);
    }

    // 4. Lấy đơn giá dịch vụ
    const electricService = this.serviceRepo.findByName('Điện sinh hoạt');
    const waterService = this.serviceRepo.findByName('Nước sinh hoạt');
    const internetService = this.serviceRepo.findByName('Internet / Wifi tốc độ cao');
    const cleaningService = this.serviceRepo.findByName('Vệ sinh & Rác');

    const electricConsumption = input.newElectricity - input.oldElectricity;
    let electricityAmount = 0;

    if (input.useTieredElectricity) {
      const elRes = BillingCalculator.calculateTieredElectricityBill(electricConsumption);
      electricityAmount = elRes.total;
    } else {
      const unitPrice = electricService ? electricService.unitPrice : 3800;
      const elRes = BillingCalculator.calculateServiceElectricityBill(electricConsumption, unitPrice);
      electricityAmount = elRes.total;
    }

    const waterConsumption = input.newWater - input.oldWater;
    const waterUnitPrice = waterService ? waterService.unitPrice : 25000;
    const waterAmount = BillingCalculator.calculateWaterBill(waterConsumption, waterUnitPrice);

    const internetAmount = input.internetAmount !== undefined ? input.internetAmount : (internetService?.unitPrice || 100000);
    const cleaningAmount = input.cleaningAmount !== undefined ? input.cleaningAmount : (cleaningService?.unitPrice || 30000);
    const surcharge = input.surcharge || 0;
    const discount = input.discount || 0;

    const newInvoice = new InvoiceEntity({
      id: IdGenerator.generate('INV'),
      contractId: contract.id,
      roomId: contract.roomId,
      month: input.month,
      year: input.year,
      roomRentAmount: contract.monthlyRent,
      oldElectricity: input.oldElectricity,
      newElectricity: input.newElectricity,
      electricityAmount,
      oldWater: input.oldWater,
      newWater: input.newWater,
      waterAmount,
      internetAmount,
      cleaningAmount,
      surcharge,
      discount,
      status: InvoiceStatus.UNPAID,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.invoiceRepo.create(newInvoice);
    Logger.info(`Lập hóa đơn ${newInvoice.id} tháng ${input.month}/${input.year} cho phòng ${contract.roomId}. Tổng tiền: ${newInvoice.totalAmount} VNĐ.`, 'InvoiceService');
    return successResponse(newInvoice, `Lập hóa đơn tháng ${input.month}/${input.year} thành công.`);
  }

  public cancelInvoice(id: ID): ApiResponse<IInvoice> {
    const existing = this.invoiceRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy hóa đơn mã: ${id}`);
    }

    if (existing.status === InvoiceStatus.PAID) {
      return errorResponse('Không thể hủy hóa đơn đã thanh toán.');
    }

    const updated = this.invoiceRepo.update(id, { status: InvoiceStatus.CANCELLED });
    Logger.info(`Đã hủy hóa đơn ${id}.`, 'InvoiceService');
    return successResponse(updated!, `Đã hủy hóa đơn ${id} thành công.`);
  }

  public searchInvoices(keyword: string): IInvoice[] {
    const term = keyword.trim().toLowerCase();
    if (!term) return this.getAllInvoices();

    return this.invoiceRepo.find(i =>
      i.id.toLowerCase().includes(term) ||
      i.contractId.toLowerCase().includes(term) ||
      i.roomId.toLowerCase().includes(term) ||
      `tháng ${i.month}/${i.year}`.includes(term)
    );
  }

  public filterInvoices(status?: InvoiceStatus, roomId?: ID, month?: number, year?: number): IInvoice[] {
    return this.invoiceRepo.find(i => {
      if (status && i.status !== status) return false;
      if (roomId && i.roomId !== roomId) return false;
      if (month && i.month !== month) return false;
      if (year && i.year !== year) return false;
      return true;
    });
  }
}
