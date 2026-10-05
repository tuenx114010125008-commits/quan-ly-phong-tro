import { BaseEntity } from './BaseEntity';
import { ID, EquipmentCondition } from '../types/common.types';
/**
 * Interface biểu diễn thiết bị trong phòng
 */
export interface IEquipment extends BaseEntity {
    roomId: ID;
    name: string;
    condition: EquipmentCondition;
    value: number;
}
/**
 * Lớp EquipmentEntity biểu diễn thực thể thiết bị
 */
export declare class EquipmentEntity implements IEquipment {
    id: ID;
    roomId: ID;
    name: string;
    condition: EquipmentCondition;
    value: number;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: Partial<IEquipment> & {
        roomId: ID;
        name: string;
        value: number;
    });
    isUsable(): boolean;
}
