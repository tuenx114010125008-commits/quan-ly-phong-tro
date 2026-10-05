import { BaseEntity } from './BaseEntity';
import { ID, CustomerStatus } from '../types/common.types';

/**
 * Interface biểu diễn khách thuê phòng
 */
export interface ICustomer extends BaseEntity {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  cccd: string;        // 12 chữ số
  phone: string;       // 10 chữ số
  hometown: string;    // Quê quán
  vehicle?: string;    // Biển số xe / Loại xe
  status: CustomerStatus;
}

/**
 * Lớp CustomerEntity triển khai các phương thức thông tin khách thuê
 */
export class CustomerEntity implements ICustomer {
  public id: ID;
  public fullName: string;
  public dateOfBirth: string;
  public cccd: string;
  public phone: string;
  public hometown: string;
  public vehicle?: string;
  public status: CustomerStatus;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<ICustomer> & {
    fullName: string;
    dateOfBirth: string;
    cccd: string;
    phone: string;
    hometown: string;
  }) {
    this.id = data.id || '';
    this.fullName = data.fullName;
    this.dateOfBirth = data.dateOfBirth;
    this.cccd = data.cccd;
    this.phone = data.phone;
    this.hometown = data.hometown;
    this.vehicle = data.vehicle;
    this.status = data.status || CustomerStatus.ACTIVE;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  public isActive(): boolean {
    return this.status === CustomerStatus.ACTIVE;
  }

  public getAge(): number {
    const birthYear = new Date(this.dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  }
}
