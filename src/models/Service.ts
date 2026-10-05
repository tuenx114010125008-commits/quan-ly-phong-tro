import { BaseEntity } from './BaseEntity';
import { ID, ServiceStatus, ServiceUnit } from '../types/common.types';

/**
 * Interface biểu diễn dịch vụ phòng trọ (Điện, Nước, Internet, Rác...)
 */
export interface IService extends BaseEntity {
  name: string;
  unit: ServiceUnit;
  unitPrice: number;     // Đơn giá (VNĐ)
  status: ServiceStatus;
  description?: string;
}

/**
 * Lớp ServiceEntity quản lý thông tin dịch vụ
 */
export class ServiceEntity implements IService {
  public id: ID;
  public name: string;
  public unit: ServiceUnit;
  public unitPrice: number;
  public status: ServiceStatus;
  public description?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<IService> & { name: string; unit: ServiceUnit; unitPrice: number }) {
    this.id = data.id || '';
    this.name = data.name;
    this.unit = data.unit;
    this.unitPrice = data.unitPrice;
    this.status = data.status || ServiceStatus.ACTIVE;
    this.description = data.description;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  public isActive(): boolean {
    return this.status === ServiceStatus.ACTIVE;
  }

  public updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Đơn giá dịch vụ không được âm.');
    }
    this.unitPrice = newPrice;
    this.updatedAt = new Date();
  }
}
