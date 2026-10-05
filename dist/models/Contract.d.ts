import { BaseEntity } from './BaseEntity';
import { ID } from '../types/common.types';
export declare enum ContractStatus {
    ACTIVE = "ACTIVE",// Đang có hiệu lực
    EXPIRED = "EXPIRED",// Đã hết hạn
    TERMINATED = "TERMINATED"
}
export interface IContract extends BaseEntity {
    roomId: ID;
    customerIds: ID[];
    startDate: string;
    endDate: string;
    deposit: number;
    monthlyRent: number;
    status: ContractStatus;
    notes?: string;
}
