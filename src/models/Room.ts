import { BaseEntity } from './BaseEntity';
import { ID, RoomStatus } from '../types/common.types';
import { IEquipment } from './Equipment';

/**
 * Interface biểu diễn phòng trọ
 */
export interface IRoom extends BaseEntity {
  roomNumber: string;
  status: RoomStatus;
  area: number;           // Diện tích (m2)
  monthlyRent: number;    // Tiền thuê theo tháng (VNĐ)
  description?: string;
  equipment?: IEquipment[];
}

/**
 * Lớp RoomEntity quản lý các hành vi và nghiệp vụ của một phòng
 */
export class RoomEntity implements IRoom {
  public id: ID;
  public roomNumber: string;
  public status: RoomStatus;
  public area: number;
  public monthlyRent: number;
  public description?: string;
  public equipment: IEquipment[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<IRoom> & { roomNumber: string; area: number; monthlyRent: number }) {
    this.id = data.id || '';
    this.roomNumber = data.roomNumber;
    this.status = data.status || RoomStatus.AVAILABLE;
    this.area = data.area;
    this.monthlyRent = data.monthlyRent;
    this.description = data.description;
    this.equipment = data.equipment || [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  public isAvailable(): boolean {
    return this.status === RoomStatus.AVAILABLE;
  }

  public isRented(): boolean {
    return this.status === RoomStatus.RENTED;
  }

  public isMaintenance(): boolean {
    return this.status === RoomStatus.MAINTENANCE;
  }

  public markAsRented(): void {
    this.status = RoomStatus.RENTED;
    this.updatedAt = new Date();
  }

  public markAsAvailable(): void {
    this.status = RoomStatus.AVAILABLE;
    this.updatedAt = new Date();
  }

  public markAsMaintenance(): void {
    this.status = RoomStatus.MAINTENANCE;
    this.updatedAt = new Date();
  }

  public getTotalEquipmentValue(): number {
    return this.equipment.reduce((sum, item) => sum + item.value, 0);
  }
}
