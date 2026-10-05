import { BaseRepository } from './BaseRepository';
import { IService, ServiceEntity } from '../models/Service';
import { ServiceStatus, ServiceUnit } from '../types/common.types';
import { IdGenerator } from '../utils/IdGenerator';

export class ServiceRepository extends BaseRepository<IService> {
  protected tableName: string = 'services';

  constructor() {
    super();
    this.syncIdGenerator();
  }

  private syncIdGenerator(): void {
    const services = this.getAll();
    IdGenerator.syncFromExistingIds('DV', services.map(s => s.id));
  }

  protected mapRowToEntity(row: any): IService {
    return new ServiceEntity({
      id: row.id,
      name: row.name,
      unit: row.unit as ServiceUnit,
      unitPrice: row.unit_price,
      status: row.status as ServiceStatus,
      description: row.description || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  protected mapEntityToRow(entity: IService): Record<string, any> {
    return {
      id: entity.id,
      name: entity.name,
      unit: entity.unit,
      unit_price: entity.unitPrice,
      status: entity.status,
      description: entity.description || null,
      created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
    };
  }

  public findByName(name: string): IService | undefined {
    const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE name = ?`, [name]);
    return row ? this.mapRowToEntity(row) : undefined;
  }
}
