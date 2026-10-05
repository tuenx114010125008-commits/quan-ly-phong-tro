import { ContractRepository } from '../repositories/ContractRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { IContract, ContractEntity, ContractStatus } from '../models/Contract';
import { RoomStatus, CustomerStatus, ID } from '../types/common.types';
import { ApiResponse, successResponse, errorResponse } from '../types/result.types';
import { IdGenerator } from '../utils/IdGenerator';
import { Validator } from '../utils/Validator';
import { Logger } from '../utils/Logger';

export interface ContractFilterOptions {
  status?: ContractStatus;
  roomId?: ID;
  customerId?: ID;
}

export class ContractService {
  private contractRepo: ContractRepository;
  private roomRepo: RoomRepository;
  private customerRepo: CustomerRepository;

  constructor(
    contractRepo?: ContractRepository,
    roomRepo?: RoomRepository,
    customerRepo?: CustomerRepository
  ) {
    this.contractRepo = contractRepo || new ContractRepository();
    this.roomRepo = roomRepo || new RoomRepository();
    this.customerRepo = customerRepo || new CustomerRepository();
  }

  public getAllContracts(): IContract[] {
    return this.contractRepo.getAll();
  }

  public getContractById(id: ID): IContract | undefined {
    return this.contractRepo.getById(id);
  }

  public getActiveContractByRoom(roomId: ID): IContract | undefined {
    return this.contractRepo.getActiveContractByRoomId(roomId);
  }

  public createContract(data: {
    roomId: ID;
    customerIds: ID[];
    startDate: string;
    endDate: string;
    deposit: number;
    monthlyRent?: number;
    notes?: string;
  }): ApiResponse<IContract> {
    // 1. Kiểm tra validation cơ bản
    const rules = [
      { condition: Validator.isNotEmpty(data.roomId), message: 'Mã phòng không được để trống.' },
      { condition: data.customerIds && data.customerIds.length > 0, message: 'Hợp đồng phải có ít nhất 1 khách thuê.' },
      { condition: Validator.isValidDate(data.startDate), message: 'Ngày bắt đầu hợp đồng không hợp lệ (YYYY-MM-DD).' },
      { condition: Validator.isValidDate(data.endDate), message: 'Ngày kết thúc hợp đồng không hợp lệ (YYYY-MM-DD).' },
      { condition: new Date(data.endDate) >= new Date(data.startDate), message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.' },
      { condition: Validator.isNonNegativeNumber(data.deposit), message: 'Tiền đặt cọc phải >= 0 VNĐ.' }
    ];

    const validation = Validator.validate(rules);
    if (!validation.isValid) {
      return errorResponse('Thông tin hợp đồng không hợp lệ.', validation.errors);
    }

    // 2. Kiểm tra phòng tồn tại và đang TRỐNG
    const room = this.roomRepo.getById(data.roomId);
    if (!room) {
      return errorResponse(`Phòng với mã ID "${data.roomId}" không tồn tại.`);
    }

    if (room.status !== RoomStatus.AVAILABLE) {
      return errorResponse(`Phòng "${room.roomNumber}" hiện không ở trạng thái TRỐNG (Trạng thái hiện tại: ${room.status}).`);
    }

    // 3. Kiểm tra các khách hàng tồn tại và đang ACTIVE
    for (const custId of data.customerIds) {
      const customer = this.customerRepo.getById(custId);
      if (!customer) {
        return errorResponse(`Khách hàng với mã ID "${custId}" không tồn tại.`);
      }
      if (customer.status !== CustomerStatus.ACTIVE) {
        return errorResponse(`Khách hàng "${customer.fullName}" đang bị khóa hoặc ngưng hoạt động.`);
      }
    }

    // 4. Kiểm tra xem phòng đã có hợp đồng ACTIVE nào chưa
    const existingActive = this.contractRepo.getActiveContractByRoomId(data.roomId);
    if (existingActive) {
      return errorResponse(`Phòng "${room.roomNumber}" đã có một hợp đồng khác đang có hiệu lực (ID: ${existingActive.id}).`);
    }

    const rent = data.monthlyRent !== undefined ? data.monthlyRent : room.monthlyRent;

    const newContract = new ContractEntity({
      id: IdGenerator.generate('HD'),
      roomId: data.roomId,
      customerIds: data.customerIds,
      startDate: data.startDate,
      endDate: data.endDate,
      deposit: data.deposit,
      monthlyRent: rent,
      status: ContractStatus.ACTIVE,
      notes: data.notes?.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 5. Lưu hợp đồng và tự động chuyển trạng thái phòng sang RENTED
    this.contractRepo.create(newContract);
    this.roomRepo.update(room.id, { status: RoomStatus.RENTED });

    Logger.info(`Tạo hợp đồng thành công: ${newContract.id} cho phòng ${room.roomNumber}. Phòng đã chuyển sang ĐÃ THUÊ (RENTED).`, 'ContractService');
    return successResponse(newContract, `Tạo hợp đồng thuê phòng "${room.roomNumber}" thành công.`);
  }

  public renewContract(id: ID, newEndDate: string, newRent?: number): ApiResponse<IContract> {
    const contract = this.contractRepo.getById(id);
    if (!contract) {
      return errorResponse(`Không tìm thấy hợp đồng với mã ID: ${id}`);
    }

    if (!Validator.isValidDate(newEndDate) || new Date(newEndDate) <= new Date(contract.endDate)) {
      return errorResponse('Ngày gia hạn mới phải sau ngày kết thúc hợp đồng hiện tại.');
    }

    const updateData: Partial<IContract> = {
      endDate: newEndDate,
      status: ContractStatus.ACTIVE
    };
    if (newRent !== undefined && Validator.isPositiveNumber(newRent)) {
      updateData.monthlyRent = newRent;
    }

    const updated = this.contractRepo.update(id, updateData);
    Logger.info(`Gia hạn hợp đồng ${id} đến ngày ${newEndDate}.`, 'ContractService');
    return successResponse(updated!, `Gia hạn hợp đồng ${id} thành công.`);
  }

  public terminateContract(id: ID, reason?: string): ApiResponse<IContract> {
    const contract = this.contractRepo.getById(id);
    if (!contract) {
      return errorResponse(`Không tìm thấy hợp đồng với mã ID: ${id}`);
    }

    if (contract.status === ContractStatus.TERMINATED) {
      return errorResponse('Hợp đồng này đã chấm dứt trước đó.');
    }

    const notes = reason ? `${contract.notes ? contract.notes + ' | ' : ''}Lý do kết thúc: ${reason}` : contract.notes;
    const updated = this.contractRepo.update(id, {
      status: ContractStatus.TERMINATED,
      notes
    });

    // Tự động chuyển phòng về trạng thái TRỐNG (AVAILABLE)
    this.roomRepo.update(contract.roomId, { status: RoomStatus.AVAILABLE });

    Logger.info(`Chấm dứt hợp đồng ${id}. Phòng ${contract.roomId} đã chuyển về TRỐNG (AVAILABLE).`, 'ContractService');
    return successResponse(updated!, `Đã kết thúc hợp đồng ${id}. Phòng đã chuyển về trạng thái sẵn sàng cho thuê.`);
  }

  public searchContracts(keyword: string): IContract[] {
    const term = keyword.trim().toLowerCase();
    if (!term) return this.getAllContracts();

    return this.contractRepo.find(c =>
      c.id.toLowerCase().includes(term) ||
      c.roomId.toLowerCase().includes(term) ||
      (c.notes && c.notes.toLowerCase().includes(term))
    );
  }

  public filterContracts(options: ContractFilterOptions): IContract[] {
    return this.contractRepo.find(c => {
      if (options.status && c.status !== options.status) return false;
      if (options.roomId && c.roomId !== options.roomId) return false;
      if (options.customerId && !c.customerIds.includes(options.customerId)) return false;
      return true;
    });
  }

  public getExpiringContracts(daysThreshold: number = 30): IContract[] {
    return this.contractRepo.find(c => {
      if (c.status !== ContractStatus.ACTIVE) return false;
      const entity = c instanceof ContractEntity ? c : new ContractEntity(c);
      return entity.isExpiringSoon(daysThreshold);
    });
  }
}
