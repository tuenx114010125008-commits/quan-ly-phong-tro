import { BaseRepository } from './BaseRepository';
import { IContract, ContractEntity, ContractStatus } from '../models/Contract';
import { ID } from '../types/common.types';
import { IdGenerator } from '../utils/IdGenerator';

export class ContractRepository extends BaseRepository<IContract> {
  protected tableName: string = 'contracts';

  constructor() {
    super();
    this.syncIdGenerator();
  }

  private syncIdGenerator(): void {
    const contracts = this.getAll();
    IdGenerator.syncFromExistingIds('HD', contracts.map(c => c.id));
  }

  protected mapRowToEntity(row: any): IContract {
    // Lấy danh sách khách hàng trong hợp đồng từ bảng contract_customers
    const custRows = this.db.queryAll<{ customer_id: string }>(
      'SELECT customer_id FROM contract_customers WHERE contract_id = ?',
      [row.id]
    );
    const customerIds = custRows.map(c => c.customer_id);

    return new ContractEntity({
      id: row.id,
      roomId: row.room_id,
      customerIds,
      startDate: row.start_date,
      endDate: row.end_date,
      deposit: row.deposit,
      monthlyRent: row.monthly_rent,
      status: row.status as ContractStatus,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  protected mapEntityToRow(entity: IContract): Record<string, any> {
    return {
      id: entity.id,
      room_id: entity.roomId,
      start_date: entity.startDate,
      end_date: entity.endDate,
      deposit: entity.deposit,
      monthly_rent: entity.monthlyRent,
      status: entity.status,
      notes: entity.notes || null,
      created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
    };
  }

  public override create(item: IContract): IContract {
    super.create(item);

    // Lưu danh sách khách hàng vào bảng liên kết
    if (item.customerIds && item.customerIds.length > 0) {
      for (const custId of item.customerIds) {
        this.db.execute(
          'INSERT OR IGNORE INTO contract_customers (contract_id, customer_id) VALUES (?, ?)',
          [item.id, custId]
        );
      }
    }

    return item;
  }

  public override update(id: ID, item: Partial<IContract>): IContract | undefined {
    const updated = super.update(id, item);
    if (!updated) return undefined;

    if (item.customerIds) {
      this.db.execute('DELETE FROM contract_customers WHERE contract_id = ?', [id]);
      for (const custId of item.customerIds) {
        this.db.execute(
          'INSERT OR IGNORE INTO contract_customers (contract_id, customer_id) VALUES (?, ?)',
          [id, custId]
        );
      }
    }

    return this.getById(id);
  }

  public getActiveContractByRoomId(roomId: ID): IContract | undefined {
    const row = this.db.queryOne(
      `SELECT * FROM ${this.tableName} WHERE room_id = ? AND status = 'ACTIVE' LIMIT 1`,
      [roomId]
    );
    return row ? this.mapRowToEntity(row) : undefined;
  }

  public getContractsByCustomerId(customerId: ID): IContract[] {
    const rows = this.db.queryAll(
      `SELECT c.* FROM contracts c 
       INNER JOIN contract_customers cc ON c.id = cc.contract_id 
       WHERE cc.customer_id = ?`,
      [customerId]
    );
    return rows.map(r => this.mapRowToEntity(r));
  }
}
