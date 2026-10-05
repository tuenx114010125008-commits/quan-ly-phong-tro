"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const node_sqlite_1 = require("node:sqlite");
const Logger_1 = require("../utils/Logger");
/**
 * Lớp quản lý kết nối và thực thi SQL Database (SQLite / SQL engine)
 */
class DatabaseConnection {
    static instance = null;
    db;
    dbFilePath;
    constructor(dbPath) {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        this.dbFilePath = dbPath || path.join(dataDir, 'quan_ly_phong_tro.db');
        this.db = new node_sqlite_1.DatabaseSync(this.dbFilePath);
        this.initDatabase();
    }
    static getInstance(dbPath) {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection(dbPath);
        }
        return DatabaseConnection.instance;
    }
    /**
     * Khởi tạo bảng dữ liệu từ schema.sql
     */
    initDatabase() {
        try {
            const schemaPath = path.join(__dirname, 'schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
                this.db.exec(schemaSql);
                Logger_1.Logger.info('Khởi tạo Database Schema thành công.', 'DatabaseConnection');
            }
        }
        catch (err) {
            Logger_1.Logger.error(`Lỗi khi khởi tạo schema: ${err.message}`, 'DatabaseConnection');
        }
    }
    /**
     * Nạp dữ liệu mẫu từ seed.sql
     */
    seedDatabase() {
        try {
            const seedPath = path.join(__dirname, 'seed.sql');
            if (fs.existsSync(seedPath)) {
                const seedSql = fs.readFileSync(seedPath, 'utf-8');
                this.db.exec(seedSql);
                Logger_1.Logger.info('Nạp dữ liệu mẫu (Seed Data) thành công.', 'DatabaseConnection');
            }
        }
        catch (err) {
            Logger_1.Logger.error(`Lỗi khi nạp seed data: ${err.message}`, 'DatabaseConnection');
        }
    }
    /**
     * Thực thi câu lệnh DDL / DML không trả về dữ liệu (INSERT, UPDATE, DELETE)
     */
    execute(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            stmt.run(...params);
        }
        catch (err) {
            Logger_1.Logger.error(`Lỗi thực thi SQL: ${sql} | Lỗi: ${err.message}`, 'DatabaseConnection');
            throw err;
        }
    }
    /**
     * Lấy một bản ghi đầu tiên
     */
    queryOne(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.get(...params);
        }
        catch (err) {
            Logger_1.Logger.error(`Lỗi queryOne SQL: ${sql} | Lỗi: ${err.message}`, 'DatabaseConnection');
            throw err;
        }
    }
    /**
     * Lấy danh sách bản ghi
     */
    queryAll(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.all(...params);
        }
        catch (err) {
            Logger_1.Logger.error(`Lỗi queryAll SQL: ${sql} | Lỗi: ${err.message}`, 'DatabaseConnection');
            throw err;
        }
    }
    /**
     * Đóng kết nối
     */
    close() {
        this.db.close();
        DatabaseConnection.instance = null;
    }
}
exports.DatabaseConnection = DatabaseConnection;
//# sourceMappingURL=connection.js.map