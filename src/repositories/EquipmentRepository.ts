import { BaseRepository } from './BaseRepository';
import { IEquipment, EquipmentEntity } from '../models/Equipment';
import { EquipmentCondition, ID } from '../types/common.types';
import { IdGenerator } from '../utils/IdGenerator';

export class EquipmentRepository extends BaseRepository<IEquipment> {
  protected tableName: string = 'equipment';

  constructor() {
    super();
    this.syncIdGenerator();
  }

  private syncIdGenerator(): void {
    const items = this.getAll();
    IdGenerator.syncFromExistingIds('TB', items.map(e => e.id));
  }

  protected mapRowToEntity(row: any): IEquipment {
    return new EquipmentEntity({
      id: row.id,
      roomId: row.room_id,
      name: row.name,
      condition: row.condition as EquipmentCondition,
      value: row.value,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  protected mapEntityToRow(entity: IEquipment): Record<string, any> {
    return {
      id: entity.id,
      room_id: entity.roomId,
      name: entity.name,
      condition: entity.condition,
      value: entity.value,
      created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
    };
  }

  public getByRoomId(roomId: ID): IEquipment[] {
    const rows = this.db.queryAll(`SELECT * FROM ${this.tableName} WHERE room_id = ?`, [roomId]);
    return rows.map(r => this.mapRowToEntity(r));
  }
}
