"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const User_1 = require("../models/User");
const IdGenerator_1 = require("../utils/IdGenerator");
class UserRepository extends BaseRepository_1.BaseRepository {
    tableName = 'users';
    constructor() {
        super();
        this.syncIdGenerator();
    }
    syncIdGenerator() {
        const users = this.getAll();
        IdGenerator_1.IdGenerator.syncFromExistingIds('USR', users.map(u => u.id));
    }
    mapRowToEntity(row) {
        return new User_1.UserEntity({
            id: row.id,
            username: row.username,
            password: row.password,
            fullName: row.full_name,
            role: row.role,
            status: row.status,
            lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        });
    }
    mapEntityToRow(entity) {
        return {
            id: entity.id,
            username: entity.username,
            password: entity.password,
            full_name: entity.fullName,
            role: entity.role,
            status: entity.status,
            last_login_at: entity.lastLoginAt ? entity.lastLoginAt.toISOString() : null,
            created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
            updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
        };
    }
    findByUsername(username) {
        const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE username = ?`, [username]);
        return row ? this.mapRowToEntity(row) : undefined;
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map