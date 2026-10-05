"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Customer_1 = require("../models/Customer");
const IdGenerator_1 = require("../utils/IdGenerator");
class CustomerRepository extends BaseRepository_1.BaseRepository {
    tableName = 'customers';
    constructor() {
        super();
        this.syncIdGenerator();
    }
    syncIdGenerator() {
        const customers = this.getAll();
        IdGenerator_1.IdGenerator.syncFromExistingIds('KH', customers.map(c => c.id));
    }
    mapRowToEntity(row) {
        return new Customer_1.CustomerEntity({
            id: row.id,
            fullName: row.full_name,
            dateOfBirth: row.date_of_birth,
            cccd: row.cccd,
            phone: row.phone,
            hometown: row.hometown,
            vehicle: row.vehicle || undefined,
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        });
    }
    mapEntityToRow(entity) {
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
    findByCCCD(cccd) {
        const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE cccd = ?`, [cccd]);
        return row ? this.mapRowToEntity(row) : undefined;
    }
    findByPhone(phone) {
        const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE phone = ?`, [phone]);
        return row ? this.mapRowToEntity(row) : undefined;
    }
}
exports.CustomerRepository = CustomerRepository;
//# sourceMappingURL=CustomerRepository.js.map