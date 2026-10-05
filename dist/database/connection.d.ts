/**
 * Lớp quản lý kết nối và thực thi SQL Database (SQLite / SQL engine)
 */
export declare class DatabaseConnection {
    private static instance;
    private db;
    private dbFilePath;
    private constructor();
    static getInstance(dbPath?: string): DatabaseConnection;
    /**
     * Khởi tạo bảng dữ liệu từ schema.sql
     */
    private initDatabase;
    /**
     * Nạp dữ liệu mẫu từ seed.sql
     */
    seedDatabase(): void;
    /**
     * Thực thi câu lệnh DDL / DML không trả về dữ liệu (INSERT, UPDATE, DELETE)
     */
    execute(sql: string, params?: any[]): void;
    /**
     * Lấy một bản ghi đầu tiên
     */
    queryOne<T = any>(sql: string, params?: any[]): T | undefined;
    /**
     * Lấy danh sách bản ghi
     */
    queryAll<T = any>(sql: string, params?: any[]): T[];
    /**
     * Đóng kết nối
     */
    close(): void;
}
