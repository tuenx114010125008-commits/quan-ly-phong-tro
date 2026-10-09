import { BaseEntity } from '../models/BaseEntity';
import { IRepository } from './IRepository';
import { ID } from '../types/common.types';
import { DatabaseConnection } from '../database/connection';

/**
 * LỚP CƠ SỞ BASE REPOSITORY (Thủ kho dùng chung)
 * 
 * 💡 Dễ hiểu cho người mới:
 * - Thay vì mỗi bảng (Phòng, Khách, Hợp đồng...) phải viết lại các câu lệnh SQL:
 *   + SELECT * FROM ... (Lấy tất cả)
 *   + INSERT INTO ... (Thêm mới)
 *   + UPDATE ... (Cập nhật)
 *   + DELETE ... (Xóa)
 * - Lớp BaseRepository này viết sẵn toàn bộ logic chung đó cho kiểu dữ liệu `<T>`.
 * - Các repository cụ thể (`RoomRepository`, `CustomerRepository`...) chỉ cần kế thừa lại.
 */
export abstract class BaseRepository<T extends BaseEntity> implements IRepository<T> {
  protected db: DatabaseConnection;
  protected abstract tableName: string;

  constructor(db?: DatabaseConnection) {
    this.db = db || DatabaseConnection.getInstance();
  }

  // Phương thức chuyển đổi dữ liệu từ dòng trong SQLite sang Đối tượng TypeScript
  protected abstract mapRowToEntity(row: any): T;
  // Phương thức chuyển đổi từ Đối tượng TypeScript sang dòng để lưu vào SQLite
  protected abstract mapEntityToRow(entity: T): Record<string, any>;

  /**
   * 1. Lấy toàn bộ danh sách bản ghi từ bảng CSDL
   */
  public getAll(): T[] {
    const rows = this.db.queryAll(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    return rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * 2. Tìm 1 bản ghi theo mã ID
   */
  public getById(id: ID): T | undefined {
    const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return row ? this.mapRowToEntity(row) : undefined;
  }

  /**
   * 3. Thêm mới một bản ghi vào CSDL
   */
  public create(item: T): T {
    const row = this.mapEntityToRow(item);
    const columns = Object.keys(row);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(row);

    const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    this.db.execute(sql, values);
    return item;
  }

  /**
   * 4. Cập nhật thông tin bản ghi theo ID
   */
  public update(id: ID, item: Partial<T>): T | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;

    const updatedEntity = { ...existing, ...item, updatedAt: new Date() } as T;
    const row = this.mapEntityToRow(updatedEntity);
    delete row.id; // Không thay đổi khóa chính ID

    const setClauses = Object.keys(row).map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(row), id];

    const sql = `UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`;
    this.db.execute(sql, values);
    return updatedEntity;
  }

  /**
   * 5. Xóa bản ghi theo ID
   */
  public delete(id: ID): boolean {
    if (!this.exists(id)) return false;
    this.db.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return true;
  }

  /**
   * 6. Kiểm tra bản ghi có tồn tại trong CSDL hay không
   */
  public exists(id: ID): boolean {
    const row = this.db.queryOne(`SELECT 1 FROM ${this.tableName} WHERE id = ?`, [id]);
    return !!row;
  }

  /**
   * 7. Đếm tổng số bản ghi trong bảng
   */
  public count(): number {
    const row = this.db.queryOne<{ total: number }>(`SELECT COUNT(*) as total FROM ${this.tableName}`);
    return row ? row.total : 0;
  }

  /**
   * 8. Tìm kiếm bản ghi theo điều kiện lọc tùy biến
   */
  public find(predicate: (item: T) => boolean): T[] {
    const all = this.getAll();
    return all.filter(predicate);
  }
}
