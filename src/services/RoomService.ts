import { RoomRepository } from '../repositories/RoomRepository';
import { EquipmentRepository } from '../repositories/EquipmentRepository';
import { IRoom, RoomEntity } from '../models/Room';
import { ApiResponse, successResponse, errorResponse } from '../types/result.types';
import { RoomStatus, ID } from '../types/common.types';
import { IdGenerator } from '../utils/IdGenerator';
import { Validator } from '../utils/Validator';
import { Logger } from '../utils/Logger';

export interface RoomFilterOptions {
  status?: RoomStatus;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
}

export class RoomService {
  private roomRepo: RoomRepository;
  private equipmentRepo: EquipmentRepository;

  constructor(roomRepo?: RoomRepository, equipmentRepo?: EquipmentRepository) {
    this.equipmentRepo = equipmentRepo || new EquipmentRepository();
    this.roomRepo = roomRepo || new RoomRepository(this.equipmentRepo);
  }

  public getAllRooms(): IRoom[] {
    return this.roomRepo.getAll();
  }

  public getRoomById(id: ID): IRoom | undefined {
    return this.roomRepo.getById(id);
  }

  public getRoomByNumber(roomNumber: string): IRoom | undefined {
    return this.roomRepo.findByRoomNumber(roomNumber.trim());
  }

  public addRoom(data: {
    roomNumber: string;
    area: number;
    monthlyRent: number;
    description?: string;
  }): ApiResponse<IRoom> {
    const rules = [
      { condition: Validator.isNotEmpty(data.roomNumber), message: 'Số phòng không được để trống.' },
      { condition: Validator.isPositiveNumber(data.area), message: 'Diện tích phòng phải > 0 m².' },
      { condition: Validator.isPositiveNumber(data.monthlyRent), message: 'Giá thuê phòng phải > 0 VNĐ.' }
    ];

    const validation = Validator.validate(rules);
    if (!validation.isValid) {
      return errorResponse('Thông tin phòng không hợp lệ.', validation.errors);
    }

    const existing = this.roomRepo.findByRoomNumber(data.roomNumber.trim());
    if (existing) {
      return errorResponse(`Số phòng "${data.roomNumber}" đã tồn tại trên hệ thống.`);
    }

    const newRoom = new RoomEntity({
      id: IdGenerator.generate('P'),
      roomNumber: data.roomNumber.trim(),
      status: RoomStatus.AVAILABLE,
      area: data.area,
      monthlyRent: data.monthlyRent,
      description: data.description?.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.roomRepo.create(newRoom);
    Logger.info(`Thêm mới phòng trọ: ${newRoom.roomNumber} (ID: ${newRoom.id}).`, 'RoomService');
    return successResponse(newRoom, `Thêm phòng "${newRoom.roomNumber}" thành công.`);
  }

  public updateRoom(id: ID, data: Partial<IRoom>): ApiResponse<IRoom> {
    const existing = this.roomRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy phòng với mã ID: ${id}`);
    }

    if (data.roomNumber && data.roomNumber !== existing.roomNumber) {
      const duplicate = this.roomRepo.findByRoomNumber(data.roomNumber.trim());
      if (duplicate && duplicate.id !== id) {
        return errorResponse(`Số phòng "${data.roomNumber}" đã trùng với phòng khác.`);
      }
    }

    if (data.area !== undefined && !Validator.isPositiveNumber(data.area)) {
      return errorResponse('Diện tích phòng phải là số thực > 0.');
    }

    if (data.monthlyRent !== undefined && !Validator.isPositiveNumber(data.monthlyRent)) {
      return errorResponse('Giá thuê phòng phải là số thực > 0.');
    }

    const updated = this.roomRepo.update(id, data);
    Logger.info(`Cập nhật thông tin phòng ID: ${id}.`, 'RoomService');
    return successResponse(updated!, `Cập nhật phòng thành công.`);
  }

  public deleteRoom(id: ID): ApiResponse<boolean> {
    const existing = this.roomRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy phòng với mã ID: ${id}`);
    }

    if (existing.status === RoomStatus.RENTED) {
      return errorResponse(`Không thể xóa phòng "${existing.roomNumber}" vì phòng đang có người thuê.`);
    }

    this.roomRepo.delete(id);
    Logger.info(`Đã xóa phòng ${existing.roomNumber} (ID: ${id}).`, 'RoomService');
    return successResponse(true, `Đã xóa phòng "${existing.roomNumber}" thành công.`);
  }

  public updateStatus(id: ID, status: RoomStatus): ApiResponse<IRoom> {
    const existing = this.roomRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy phòng với mã ID: ${id}`);
    }

    const updated = this.roomRepo.update(id, { status });
    Logger.info(`Chuyển trạng thái phòng ${existing.roomNumber} sang ${status}.`, 'RoomService');
    return successResponse(updated!, `Đã cập nhật trạng thái phòng thành ${status}.`);
  }

  public searchRooms(keyword: string): IRoom[] {
    const term = keyword.trim().toLowerCase();
    if (!term) return this.getAllRooms();

    return this.roomRepo.find(room =>
      room.roomNumber.toLowerCase().includes(term) ||
      room.id.toLowerCase().includes(term) ||
      Boolean(room.description?.toLowerCase().includes(term))
    );
  }

  public filterRooms(options: RoomFilterOptions): IRoom[] {
    return this.roomRepo.find(room => {
      if (options.status && room.status !== options.status) return false;
      if (options.minPrice !== undefined && room.monthlyRent < options.minPrice) return false;
      if (options.maxPrice !== undefined && room.monthlyRent > options.maxPrice) return false;
      if (options.minArea !== undefined && room.area < options.minArea) return false;
      if (options.maxArea !== undefined && room.area > options.maxArea) return false;
      return true;
    });
  }

  public compareRooms(roomId1: ID, roomId2: ID): ApiResponse<{ room1: IRoom; room2: IRoom; priceDiff: number; areaDiff: number }> {
    const room1 = this.roomRepo.getById(roomId1);
    const room2 = this.roomRepo.getById(roomId2);

    if (!room1 || !room2) {
      return errorResponse('Một trong hai phòng đem so sánh không tồn tại trên hệ thống.');
    }

    const priceDiff = room1.monthlyRent - room2.monthlyRent;
    const areaDiff = room1.area - room2.area;

    return successResponse({
      room1,
      room2,
      priceDiff,
      areaDiff
    }, 'So sánh thông tin 2 phòng thành công.');
  }
}
