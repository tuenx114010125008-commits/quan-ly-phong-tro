import { EquipmentRepository } from '../repositories/EquipmentRepository';
import { IEquipment, EquipmentEntity } from '../models/Equipment';
import { ApiResponse, successResponse, errorResponse } from '../types/result.types';
import { EquipmentCondition, ID } from '../types/common.types';
import { IdGenerator } from '../utils/IdGenerator';
import { Validator } from '../utils/Validator';
import { Logger } from '../utils/Logger';

export class EquipmentService {
  private equipmentRepo: EquipmentRepository;

  constructor(equipmentRepo?: EquipmentRepository) {
    this.equipmentRepo = equipmentRepo || new EquipmentRepository();
  }

  public getAll(): IEquipment[] {
    return this.equipmentRepo.getAll();
  }

  public getById(id: ID): IEquipment | undefined {
    return this.equipmentRepo.getById(id);
  }

  public getByRoomId(roomId: ID): IEquipment[] {
    return this.equipmentRepo.getByRoomId(roomId);
  }

  public addEquipment(data: {
    roomId: ID;
    name: string;
    condition?: EquipmentCondition;
    value: number;
  }): ApiResponse<IEquipment> {
    const rules = [
      { condition: Validator.isNotEmpty(data.name), message: 'Tên thiết bị không được để trống.' },
      { condition: Validator.isNonNegativeNumber(data.value), message: 'Giá trị thiết bị phải >= 0 VNĐ.' },
      { condition: Validator.isNotEmpty(data.roomId), message: 'Mã phòng không được để trống.' }
    ];

    const validation = Validator.validate(rules);
    if (!validation.isValid) {
      return errorResponse('Thông tin thiết bị không hợp lệ.', validation.errors);
    }

    const newEquipment = new EquipmentEntity({
      id: IdGenerator.generate('TB'),
      roomId: data.roomId,
      name: data.name.trim(),
      condition: data.condition || EquipmentCondition.GOOD,
      value: data.value,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.equipmentRepo.create(newEquipment);
    Logger.info(`Thêm thiết bị "${newEquipment.name}" cho phòng ${newEquipment.roomId}.`, 'EquipmentService');
    return successResponse(newEquipment, 'Thêm thiết bị vào phòng thành công.');
  }

  public updateEquipment(id: ID, data: Partial<IEquipment>): ApiResponse<IEquipment> {
    const existing = this.equipmentRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy thiết bị với mã: ${id}`);
    }

    if (data.value !== undefined && !Validator.isNonNegativeNumber(data.value)) {
      return errorResponse('Giá trị thiết bị phải >= 0.');
    }

    const updated = this.equipmentRepo.update(id, data);
    Logger.info(`Cập nhật thông tin thiết bị: ${id}.`, 'EquipmentService');
    return successResponse(updated!, 'Cập nhật thiết bị thành công.');
  }

  public deleteEquipment(id: ID): ApiResponse<boolean> {
    if (!this.equipmentRepo.exists(id)) {
      return errorResponse(`Không tìm thấy thiết bị với mã: ${id}`);
    }

    this.equipmentRepo.delete(id);
    Logger.info(`Đã xóa thiết bị mã: ${id}.`, 'EquipmentService');
    return successResponse(true, 'Đã xóa thiết bị thành công.');
  }

  public updateCondition(id: ID, condition: EquipmentCondition): ApiResponse<IEquipment> {
    return this.updateEquipment(id, { condition });
  }
}
