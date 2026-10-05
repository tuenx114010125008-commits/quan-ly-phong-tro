import { BaseRepository } from './BaseRepository';
import { IInvoice, InvoiceEntity, InvoiceStatus } from '../models/Invoice';
import { ID } from '../types/common.types';
import { IdGenerator } from '../utils/IdGenerator';

export class InvoiceRepository extends BaseRepository<IInvoice> {
  protected tableName: string = 'invoices';

  constructor() {
    super();
    this.syncIdGenerator();
  }

  private syncIdGenerator(): void {
    const invoices = this.getAll();
    IdGenerator.syncFromExistingIds('INV', invoices.map(i => i.id));
  }

  protected mapRowToEntity(row: any): IInvoice {
    return new InvoiceEntity({
      id: row.id,
      contractId: row.contract_id,
      roomId: row.room_id,
      month: row.month,
      year: row.year,
      roomRentAmount: row.room_rent_amount,
      oldElectricity: row.old_electricity,
      newElectricity: row.new_electricity,
      electricityAmount: row.electricity_amount,
      oldWater: row.old_water,
      newWater: row.new_water,
      waterAmount: row.water_amount,
      internetAmount: row.internet_amount,
      cleaningAmount: row.cleaning_amount,
      surcharge: row.surcharge,
      discount: row.discount,
      totalAmount: row.total_amount,
      status: row.status as InvoiceStatus,
      paymentDate: row.payment_date ? new Date(row.payment_date) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  protected mapEntityToRow(entity: IInvoice): Record<string, any> {
    return {
      id: entity.id,
      contract_id: entity.contractId,
      room_id: entity.roomId,
      month: entity.month,
      year: entity.year,
      room_rent_amount: entity.roomRentAmount,
      old_electricity: entity.oldElectricity,
      new_electricity: entity.newElectricity,
      electricity_amount: entity.electricityAmount,
      old_water: entity.oldWater,
      new_water: entity.newWater,
      water_amount: entity.waterAmount,
      internet_amount: entity.internetAmount,
      cleaning_amount: entity.cleaningAmount,
      surcharge: entity.surcharge,
      discount: entity.discount,
      total_amount: entity.totalAmount,
      status: entity.status,
      payment_date: entity.paymentDate ? entity.paymentDate.toISOString() : null,
      created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
    };
  }

  public findByContractAndPeriod(contractId: ID, month: number, year: number): IInvoice | undefined {
    const row = this.db.queryOne(
      `SELECT * FROM ${this.tableName} WHERE contract_id = ? AND month = ? AND year = ?`,
      [contractId, month, year]
    );
    return row ? this.mapRowToEntity(row) : undefined;
  }

  public getInvoicesByRoomId(roomId: ID): IInvoice[] {
    const rows = this.db.queryAll(`SELECT * FROM ${this.tableName} WHERE room_id = ? ORDER BY year DESC, month DESC`, [roomId]);
    return rows.map(r => this.mapRowToEntity(r));
  }

  public getUnpaidInvoices(): IInvoice[] {
    const rows = this.db.queryAll(`SELECT * FROM ${this.tableName} WHERE status = 'UNPAID' ORDER BY year ASC, month ASC`);
    return rows.map(r => this.mapRowToEntity(r));
  }

  public getLatestInvoiceByRoom(roomId: ID): IInvoice | undefined {
    const row = this.db.queryOne(
      `SELECT * FROM ${this.tableName} WHERE room_id = ? ORDER BY year DESC, month DESC LIMIT 1`,
      [roomId]
    );
    return row ? this.mapRowToEntity(row) : undefined;
  }
}
