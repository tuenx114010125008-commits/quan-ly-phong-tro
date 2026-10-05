import { BaseEntity } from './BaseEntity';
import { ID, ServiceStatus, ServiceUnit } from '../types/common.types';
/**
 * Interface biểu diễn dịch vụ phòng trọ (Điện, Nước, Internet, Rác...)
 */
export interface IService extends BaseEntity {
    name: string;
    unit: ServiceUnit;
    unitPrice: number;
    status: ServiceStatus;
    description?: string;
}
/**
 * Lớp ServiceEntity quản lý thông tin dịch vụ
 */
export declare class ServiceEntity implements IService {
    id: ID;
    name: string;
    unit: ServiceUnit;
    unitPrice: number;
    status: ServiceStatus;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: Partial<IService> & {
        name: string;
        unit: ServiceUnit;
        unitPrice: number;
    });
    isActive(): boolean;
    updatePrice(newPrice: number): void;
}
