import { BaseEntity } from './BaseEntity';
import { ID, CustomerStatus } from '../types/common.types';
/**
 * Interface biểu diễn khách thuê phòng
 */
export interface ICustomer extends BaseEntity {
    fullName: string;
    dateOfBirth: string;
    cccd: string;
    phone: string;
    hometown: string;
    vehicle?: string;
    status: CustomerStatus;
}
/**
 * Lớp CustomerEntity triển khai các phương thức thông tin khách thuê
 */
export declare class CustomerEntity implements ICustomer {
    id: ID;
    fullName: string;
    dateOfBirth: string;
    cccd: string;
    phone: string;
    hometown: string;
    vehicle?: string;
    status: CustomerStatus;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: Partial<ICustomer> & {
        fullName: string;
        dateOfBirth: string;
        cccd: string;
        phone: string;
        hometown: string;
    });
    isActive(): boolean;
    getAge(): number;
}
