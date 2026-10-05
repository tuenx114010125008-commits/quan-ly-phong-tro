import { BaseRepository } from './BaseRepository';
import { IEquipment } from '../models/Equipment';
import { ID } from '../types/common.types';
export declare class EquipmentRepository extends BaseRepository<IEquipment> {
    protected tableName: string;
    constructor();
    private syncIdGenerator;
    protected mapRowToEntity(row: any): IEquipment;
    protected mapEntityToRow(entity: IEquipment): Record<string, any>;
    getByRoomId(roomId: ID): IEquipment[];
}
