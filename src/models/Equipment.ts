import { BaseEntity } from './BaseEntity';
import { ID, EquipmentCondition } from '../types/common.types';

/**
 * Interface biểu diễn thiết bị trong phòng
 */
export interface IEquipment extends BaseEntity {
  roomId: ID;
  name: string;
  condition: EquipmentCondition;
  value: number; // Giá trị thiết bị (VNĐ)
}

/**
 * Lớp EquipmentEntity biểu diễn thực thể thiết bị
 */
export class EquipmentEntity implements IEquipment {
  public id: ID;
  public roomId: ID;
  public name: string;
  public condition: EquipmentCondition;
  public value: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<IEquipment> & { roomId: ID; name: string; value: number }) {
    this.id = data.id || '';
    this.roomId = data.roomId;
    this.name = data.name;
    this.condition = data.condition || EquipmentCondition.GOOD;
    this.value = data.value;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  public isUsable(): boolean {
    return this.condition === EquipmentCondition.GOOD || this.condition === EquipmentCondition.NEW;
  }
}
