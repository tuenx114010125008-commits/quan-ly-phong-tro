"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Equipment_1 = require("../models/Equipment");
const IdGenerator_1 = require("../utils/IdGenerator");
class EquipmentRepository extends BaseRepository_1.BaseRepository {
    tableName = 'equipment';
    constructor() {
        super();
        this.syncIdGenerator();
    }
    syncIdGenerator() {
        const items = this.getAll();
        IdGenerator_1.IdGenerator.syncFromExistingIds('TB', items.map(e => e.id));
    }
    mapRowToEntity(row) {
        return new Equipment_1.EquipmentEntity({
            id: row.id,
            roomId: row.room_id,
            name: row.name,
            condition: row.condition,
            value: row.value,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        });
    }
    mapEntityToRow(entity) {
        return {
            id: entity.id,
            room_id: entity.roomId,
            name: entity.name,
            condition: entity.condition,
            value: entity.value,
            created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
            updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
        };
    }
    getByRoomId(roomId) {
        const rows = this.db.queryAll(`SELECT * FROM ${this.tableName} WHERE room_id = ?`, [roomId]);
        return rows.map(r => this.mapRowToEntity(r));
    }
}
exports.EquipmentRepository = EquipmentRepository;
//# sourceMappingURL=EquipmentRepository.js.map