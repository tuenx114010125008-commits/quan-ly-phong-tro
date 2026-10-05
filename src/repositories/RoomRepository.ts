import { BaseRepository } from './BaseRepository';
import { IRoom, RoomEntity } from '../models/Room';
import { ID, RoomStatus } from '../types/common.types';
import { EquipmentRepository } from './EquipmentRepository';
import { IdGenerator } from '../utils/IdGenerator';

export class RoomRepository extends BaseRepository<IRoom> {
  protected tableName: string = 'rooms';
  private equipmentRepo: EquipmentRepository;

  constructor(equipmentRepo?: EquipmentRepository) {
    super();
    this.equipmentRepo = equipmentRepo || new EquipmentRepository();
    this.syncIdGenerator();
  }

  private syncIdGenerator(): void {
    const rooms = this.getAll();
    IdGenerator.syncFromExistingIds('P', rooms.map(r => r.id));
  }

  protected mapRowToEntity(row: any): IRoom {
    return new RoomEntity({
      id: row.id,
      roomNumber: row.room_number,
      status: row.status as RoomStatus,
      area: row.area,
      monthlyRent: row.monthly_rent,
      description: row.description || undefined,
      equipment: this.equipmentRepo.getByRoomId(row.id),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  protected mapEntityToRow(entity: IRoom): Record<string, any> {
    return {
      id: entity.id,
      room_number: entity.roomNumber,
      status: entity.status,
      area: entity.area,
      monthly_rent: entity.monthlyRent,
      description: entity.description || null,
      created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
    };
  }

  public findByRoomNumber(roomNumber: string): IRoom | undefined {
    const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE room_number = ?`, [roomNumber]);
    return row ? this.mapRowToEntity(row) : undefined;
  }

  public getRoomsByStatus(status: RoomStatus): IRoom[] {
    const rows = this.db.queryAll(`SELECT * FROM ${this.tableName} WHERE status = ?`, [status]);
    return rows.map(r => this.mapRowToEntity(r));
  }
}
