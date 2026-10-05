import { ServiceRepository } from '../repositories/ServiceRepository';
import { IService, ServiceEntity } from '../models/Service';
import { ApiResponse, successResponse, errorResponse } from '../types/result.types';
import { ServiceStatus, ServiceUnit, ID } from '../types/common.types';
import { IdGenerator } from '../utils/IdGenerator';
import { Validator } from '../utils/Validator';
import { Logger } from '../utils/Logger';

export class ServiceService {
  private serviceRepo: ServiceRepository;

  constructor(serviceRepo?: ServiceRepository) {
    this.serviceRepo = serviceRepo || new ServiceRepository();
  }

  public getAllServices(): IService[] {
    return this.serviceRepo.getAll();
  }

  public getActiveServices(): IService[] {
    return this.serviceRepo.find(s => s.status === ServiceStatus.ACTIVE);
  }

  public getServiceById(id: ID): IService | undefined {
    return this.serviceRepo.getById(id);
  }

  public getServiceByName(name: string): IService | undefined {
    return this.serviceRepo.findByName(name.trim());
  }

  public addService(data: {
    name: string;
    unit: ServiceUnit;
    unitPrice: number;
    description?: string;
  }): ApiResponse<IService> {
    const rules = [
      { condition: Validator.isNotEmpty(data.name), message: 'Tên dịch vụ không được để trống.' },
      { condition: Validator.isNonNegativeNumber(data.unitPrice), message: 'Đơn giá dịch vụ phải >= 0 VNĐ.' },
      { condition: Validator.isNotEmpty(data.unit), message: 'Đơn vị tính không được để trống.' }
    ];

    const validation = Validator.validate(rules);
    if (!validation.isValid) {
      return errorResponse('Thông tin dịch vụ không hợp lệ.', validation.errors);
    }

    if (this.serviceRepo.findByName(data.name.trim())) {
      return errorResponse(`Dịch vụ "${data.name}" đã tồn tại trong hệ thống.`);
    }

    const newService = new ServiceEntity({
      id: IdGenerator.generate('DV'),
      name: data.name.trim(),
      unit: data.unit,
      unitPrice: data.unitPrice,
      status: ServiceStatus.ACTIVE,
      description: data.description?.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.serviceRepo.create(newService);
    Logger.info(`Thêm dịch vụ mới: ${newService.name} (Đơn giá: ${newService.unitPrice}/${newService.unit}).`, 'ServiceService');
    return successResponse(newService, `Thêm dịch vụ "${newService.name}" thành công.`);
  }

  public updatePrice(id: ID, newPrice: number): ApiResponse<IService> {
    const existing = this.serviceRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy dịch vụ với mã ID: ${id}`);
    }

    if (!Validator.isNonNegativeNumber(newPrice)) {
      return errorResponse('Đơn giá dịch vụ phải >= 0 VNĐ.');
    }

    const oldPrice = existing.unitPrice;
    const updated = this.serviceRepo.update(id, { unitPrice: newPrice });
    Logger.info(`Cập nhật giá dịch vụ "${existing.name}" từ ${oldPrice} -> ${newPrice} VNĐ.`, 'ServiceService');
    return successResponse(updated!, `Đã cập nhật giá dịch vụ "${existing.name}" thành ${newPrice} VNĐ.`);
  }

  public updateService(id: ID, data: Partial<IService>): ApiResponse<IService> {
    const existing = this.serviceRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy dịch vụ với mã ID: ${id}`);
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = this.serviceRepo.findByName(data.name.trim());
      if (duplicate && duplicate.id !== id) {
        return errorResponse(`Tên dịch vụ "${data.name}" đã tồn tại.`);
      }
    }

    if (data.unitPrice !== undefined && !Validator.isNonNegativeNumber(data.unitPrice)) {
      return errorResponse('Đơn giá dịch vụ phải >= 0 VNĐ.');
    }

    const updated = this.serviceRepo.update(id, data);
    Logger.info(`Cập nhật thông tin dịch vụ ID: ${id}.`, 'ServiceService');
    return successResponse(updated!, 'Cập nhật dịch vụ thành công.');
  }

  public toggleStatus(id: ID): ApiResponse<IService> {
    const existing = this.serviceRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy dịch vụ với mã ID: ${id}`);
    }

    const newStatus = existing.status === ServiceStatus.ACTIVE ? ServiceStatus.DISABLED : ServiceStatus.ACTIVE;
    const updated = this.serviceRepo.update(id, { status: newStatus });
    Logger.info(`Chuyển trạng thái dịch vụ "${existing.name}" sang ${newStatus}.`, 'ServiceService');
    return successResponse(updated!, `Đã chuyển trạng thái dịch vụ sang ${newStatus}.`);
  }

  public deleteService(id: ID): ApiResponse<boolean> {
    const existing = this.serviceRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy dịch vụ với mã ID: ${id}`);
    }

    this.serviceRepo.delete(id);
    Logger.info(`Đã xóa dịch vụ "${existing.name}" (ID: ${id}).`, 'ServiceService');
    return successResponse(true, `Đã xóa dịch vụ "${existing.name}" thành công.`);
  }

  public searchServices(keyword: string): IService[] {
    const term = keyword.trim().toLowerCase();
    if (!term) return this.getAllServices();

    return this.serviceRepo.find(s => 
      s.name.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term) ||
      Boolean(s.description?.toLowerCase().includes(term))
    );
  }
}
