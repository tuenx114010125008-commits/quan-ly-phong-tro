import { BaseEntity } from './BaseEntity';
import { ID, RoomStatus } from '../types/common.types';
import { IEquipment } from './Equipment';
/**
 * Interface biểu diễn phòng trọ
 */
export interface IRoom extends BaseEntity {
    roomNumber: string;
    status: RoomStatus;
    area: number;
    monthlyRent: number;
    description?: string;
    equipment?: IEquipment[];
}
/**
 * Lớp RoomEntity quản lý các hành vi và nghiệp vụ của một phòng
 */
export declare class RoomEntity implements IRoom {
    id: ID;
    roomNumber: string;
    status: RoomStatus;
    area: number;
    monthlyRent: number;
    description?: string;
    equipment: IEquipment[];
    createdAt: Date;
    updatedAt: Date;
    constructor(data: Partial<IRoom> & {
        roomNumber: string;
        area: number;
        monthlyRent: number;
    });
    isAvailable(): boolean;
    isRented(): boolean;
    isMaintenance(): boolean;
    markAsRented(): void;
    markAsAvailable(): void;
    markAsMaintenance(): void;
    getTotalEquipmentValue(): number;
}
