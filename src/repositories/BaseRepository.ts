import { BaseEntity } from '../models/BaseEntity';
import { IRepository } from './IRepository';
import { ID } from '../types/common.types';
import { DatabaseConnection } from '../database/connection';

/**
 * Lớp trừu tượng BaseRepository triển khai IRepository kết hợp SQLite Database
 */
export abstract class BaseRepository<T extends BaseEntity> implements IRepository<T> {
  protected db: DatabaseConnection;
  protected abstract tableName: string;

  constructor(db?: DatabaseConnection) {
    this.db = db || DatabaseConnection.getInstance();
  }

  protected abstract mapRowToEntity(row: any): T;
  protected abstract mapEntityToRow(entity: T): Record<string, any>;

  public getAll(): T[] {
    const rows = this.db.queryAll(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    return rows.map(r => this.mapRowToEntity(r));
  }

  public getById(id: ID): T | undefined {
    const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return row ? this.mapRowToEntity(row) : undefined;
  }

  public create(item: T): T {
    const row = this.mapEntityToRow(item);
    const columns = Object.keys(row);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(row);

    const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    this.db.execute(sql, values);
    return item;
  }

  public update(id: ID, item: Partial<T>): T | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const updatedEntity = { ...existing, ...item, updatedAt: new Date() } as T;
    const row = this.mapEntityToRow(updatedEntity);
    delete row.id; // Không update khóa chính

    const setClauses = Object.keys(row).map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(row), id];

    const sql = `UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`;
    this.db.execute(sql, values);
    return updatedEntity;
  }

  public delete(id: ID): boolean {
    if (!this.exists(id)) return false;
    this.db.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return true;
  }

  public exists(id: ID): boolean {
    const row = this.db.queryOne(`SELECT 1 FROM ${this.tableName} WHERE id = ?`, [id]);
    return !!row;
  }

  public count(): number {
    const row = this.db.queryOne<{ total: number }>(`SELECT COUNT(*) as total FROM ${this.tableName}`);
    return row ? row.total : 0;
  }

  public find(predicate: (item: T) => boolean): T[] {
    const all = this.getAll();
    return all.filter(predicate);
  }
}
