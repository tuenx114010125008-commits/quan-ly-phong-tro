import { BaseRepository } from './BaseRepository';
import { ICustomer, CustomerEntity } from '../models/Customer';
import { CustomerStatus } from '../types/common.types';
import { IdGenerator } from '../utils/IdGenerator';

export class CustomerRepository extends BaseRepository<ICustomer> {
  protected tableName: string = 'customers';

  constructor() {
    super();
    this.syncIdGenerator();
  }

  private syncIdGenerator(): void {
    const customers = this.getAll();
    IdGenerator.syncFromExistingIds('KH', customers.map(c => c.id));
  }

  protected mapRowToEntity(row: any): ICustomer {
    return new CustomerEntity({
      id: row.id,
      fullName: row.full_name,
      dateOfBirth: row.date_of_birth,
      cccd: row.cccd,
      phone: row.phone,
      hometown: row.hometown,
      vehicle: row.vehicle || undefined,
      status: row.status as CustomerStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  protected mapEntityToRow(entity: ICustomer): Record<string, any> {
    return {
      id: entity.id,
      full_name: entity.fullName,
      date_of_birth: entity.dateOfBirth,
      cccd: entity.cccd,
      phone: entity.phone,
      hometown: entity.hometown,
      vehicle: entity.vehicle || null,
      status: entity.status,
      created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
    };
  }

  public findByCCCD(cccd: string): ICustomer | undefined {
    const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE cccd = ?`, [cccd]);
    return row ? this.mapRowToEntity(row) : undefined;
  }

  public findByPhone(phone: string): ICustomer | undefined {
    const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE phone = ?`, [phone]);
    return row ? this.mapRowToEntity(row) : undefined;
  }
}
