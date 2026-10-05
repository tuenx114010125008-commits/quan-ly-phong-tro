"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const connection_1 = require("../database/connection");
/**
 * Lớp trừu tượng BaseRepository triển khai IRepository kết hợp SQLite Database
 */
class BaseRepository {
    db;
    constructor(db) {
        this.db = db || connection_1.DatabaseConnection.getInstance();
    }
    getAll() {
        const rows = this.db.queryAll(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
        return rows.map(r => this.mapRowToEntity(r));
    }
    getById(id) {
        const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
        return row ? this.mapRowToEntity(row) : undefined;
    }
    create(item) {
        const row = this.mapEntityToRow(item);
        const columns = Object.keys(row);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(row);
        const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        this.db.execute(sql, values);
        return item;
    }
    update(id, item) {
        const existing = this.getById(id);
        if (!existing)
            return undefined;
        const updatedEntity = { ...existing, ...item, updatedAt: new Date() };
        const row = this.mapEntityToRow(updatedEntity);
        delete row.id; // Không update khóa chính
        const setClauses = Object.keys(row).map(col => `${col} = ?`).join(', ');
        const values = [...Object.values(row), id];
        const sql = `UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`;
        this.db.execute(sql, values);
        return updatedEntity;
    }
    delete(id) {
        if (!this.exists(id))
            return false;
        this.db.execute(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
        return true;
    }
    exists(id) {
        const row = this.db.queryOne(`SELECT 1 FROM ${this.tableName} WHERE id = ?`, [id]);
        return !!row;
    }
    count() {
        const row = this.db.queryOne(`SELECT COUNT(*) as total FROM ${this.tableName}`);
        return row ? row.total : 0;
    }
    find(predicate) {
        const all = this.getAll();
        return all.filter(predicate);
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map