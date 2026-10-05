import { EquipmentRepository } from '../repositories/EquipmentRepository';
import { IEquipment } from '../models/Equipment';
import { ApiResponse } from '../types/result.types';
import { EquipmentCondition, ID } from '../types/common.types';
export declare class EquipmentService {
    private equipmentRepo;
    constructor(equipmentRepo?: EquipmentRepository);
    getAll(): IEquipment[];
    getById(id: ID): IEquipment | undefined;
    getByRoomId(roomId: ID): IEquipment[];
    addEquipment(data: {
        roomId: ID;
        name: string;
        condition?: EquipmentCondition;
        value: number;
    }): ApiResponse<IEquipment>;
    updateEquipment(id: ID, data: Partial<IEquipment>): ApiResponse<IEquipment>;
    deleteEquipment(id: ID): ApiResponse<boolean>;
    updateCondition(id: ID, condition: EquipmentCondition): ApiResponse<IEquipment>;
}
