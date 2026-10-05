"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Service_1 = require("../models/Service");
const IdGenerator_1 = require("../utils/IdGenerator");
class ServiceRepository extends BaseRepository_1.BaseRepository {
    tableName = 'services';
    constructor() {
        super();
        this.syncIdGenerator();
    }
    syncIdGenerator() {
        const services = this.getAll();
        IdGenerator_1.IdGenerator.syncFromExistingIds('DV', services.map(s => s.id));
    }
    mapRowToEntity(row) {
        return new Service_1.ServiceEntity({
            id: row.id,
            name: row.name,
            unit: row.unit,
            unitPrice: row.unit_price,
            status: row.status,
            description: row.description || undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        });
    }
    mapEntityToRow(entity) {
        return {
            id: entity.id,
            name: entity.name,
            unit: entity.unit,
            unit_price: entity.unitPrice,
            status: entity.status,
            description: entity.description || null,
            created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
            updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
        };
    }
    findByName(name) {
        const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE name = ?`, [name]);
        return row ? this.mapRowToEntity(row) : undefined;
    }
}
exports.ServiceRepository = ServiceRepository;
//# sourceMappingURL=ServiceRepository.js.map