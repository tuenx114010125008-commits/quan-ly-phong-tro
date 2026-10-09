import * as fs from 'fs';
import * as path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { Logger } from '../utils/Logger';

/**
 * LỚP QUẢN LÝ KẾT NỐI CƠ SỞ DỮ LIỆU (DatabaseConnection)
 * 
 * 💡 Dễ hiểu cho người mới:
 * - Áp dụng mẫu thiết kế "Singleton" (Chỉ có 1 kết nối duy nhất trong toàn ứng dụng).
 * - Sử dụng SQLite tích hợp sẵn trong Node.js (không cần cài thêm server MySQL hay PostgreSQL).
 * - Tự động tạo thư mục 'data/' và file 'quan_ly_phong_tro.db'.
 */
export class DatabaseConnection {
  // Biến lưu phiên kết nối duy nhất
  private static instance: DatabaseConnection | null = null;
  private db: DatabaseSync;
  private dbFilePath: string;

  /**
   * Hàm khởi tạo riêng tư (private) để ngăn tạo đối tượng bừa bãi bằng từ khóa `new`
   */
  private constructor(dbPath?: string) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbFilePath = dbPath || path.join(dataDir, 'quan_ly_phong_tro.db');
    this.db = new DatabaseSync(this.dbFilePath);
    this.initDatabase();
  }

  /**
   * Lấy kết nối duy nhất đến database (Nếu chưa có thì tạo mới, có rồi thì dùng lại)
   */
  public static getInstance(dbPath?: string): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(dbPath);
    }
    return DatabaseConnection.instance;
  }

  /**
   * Khởi tạo bảng dữ liệu từ schema.sql
   */
  private initDatabase(): void {
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        this.db.exec(schemaSql);
        Logger.info('Khởi tạo Database Schema thành công.', 'DatabaseConnection');
      }
    } catch (err: any) {
      Logger.error(`Lỗi khi khởi tạo schema: ${err.message}`, 'DatabaseConnection');
    }
  }

  /**
   * Nạp dữ liệu mẫu từ seed.sql
   */
  public seedDatabase(): void {
    try {
      const seedPath = path.join(__dirname, 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf-8');
        this.db.exec(seedSql);
        Logger.info('Nạp dữ liệu mẫu (Seed Data) thành công.', 'DatabaseConnection');
      }
    } catch (err: any) {
      Logger.error(`Lỗi khi nạp seed data: ${err.message}`, 'DatabaseConnection');
    }
  }

  /**
   * Thực thi câu lệnh DDL / DML không trả về dữ liệu (INSERT, UPDATE, DELETE)
   */
  public execute(sql: string, params: any[] = []): void {
    try {
      const stmt = this.db.prepare(sql);
      stmt.run(...params);
    } catch (err: any) {
      Logger.error(`Lỗi thực thi SQL: ${sql} | Lỗi: ${err.message}`, 'DatabaseConnection');
      throw err;
    }
  }

  /**
   * Lấy một bản ghi đầu tiên
   */
  public queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.get(...params) as T | undefined;
    } catch (err: any) {
      Logger.error(`Lỗi queryOne SQL: ${sql} | Lỗi: ${err.message}`, 'DatabaseConnection');
      throw err;
    }
  }

  /**
   * Lấy danh sách bản ghi
   */
  public queryAll<T = any>(sql: string, params: any[] = []): T[] {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params) as T[];
    } catch (err: any) {
      Logger.error(`Lỗi queryAll SQL: ${sql} | Lỗi: ${err.message}`, 'DatabaseConnection');
      throw err;
    }
  }

  /**
   * Đóng kết nối
   */
  public close(): void {
    this.db.close();
    DatabaseConnection.instance = null;
  }
}
