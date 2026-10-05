import { BaseRepository } from './BaseRepository';
import { IRoom } from '../models/Room';
import { RoomStatus } from '../types/common.types';
import { EquipmentRepository } from './EquipmentRepository';
export declare class RoomRepository extends BaseRepository<IRoom> {
    protected tableName: string;
    private equipmentRepo;
    constructor(equipmentRepo?: EquipmentRepository);
    private syncIdGenerator;
    protected mapRowToEntity(row: any): IRoom;
    protected mapEntityToRow(entity: IRoom): Record<string, any>;
    findByRoomNumber(roomNumber: string): IRoom | undefined;
    getRoomsByStatus(status: RoomStatus): IRoom[];
}
