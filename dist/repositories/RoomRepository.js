"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const Room_1 = require("../models/Room");
const EquipmentRepository_1 = require("./EquipmentRepository");
const IdGenerator_1 = require("../utils/IdGenerator");
class RoomRepository extends BaseRepository_1.BaseRepository {
    tableName = 'rooms';
    equipmentRepo;
    constructor(equipmentRepo) {
        super();
        this.equipmentRepo = equipmentRepo || new EquipmentRepository_1.EquipmentRepository();
        this.syncIdGenerator();
    }
    syncIdGenerator() {
        const rooms = this.getAll();
        IdGenerator_1.IdGenerator.syncFromExistingIds('P', rooms.map(r => r.id));
    }
    mapRowToEntity(row) {
        return new Room_1.RoomEntity({
            id: row.id,
            roomNumber: row.room_number,
            status: row.status,
            area: row.area,
            monthlyRent: row.monthly_rent,
            description: row.description || undefined,
            equipment: this.equipmentRepo.getByRoomId(row.id),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        });
    }
    mapEntityToRow(entity) {
        return {
            id: entity.id,
            room_number: entity.roomNumber,
            status: entity.status,
            area: entity.area,
            monthly_rent: entity.monthlyRent,
            description: entity.description || null,
            created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
            updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
        };
    }
    findByRoomNumber(roomNumber) {
        const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE room_number = ?`, [roomNumber]);
        return row ? this.mapRowToEntity(row) : undefined;
    }
    getRoomsByStatus(status) {
        const rows = this.db.queryAll(`SELECT * FROM ${this.tableName} WHERE status = ?`, [status]);
        return rows.map(r => this.mapRowToEntity(r));
    }
}
exports.RoomRepository = RoomRepository;
//# sourceMappingURL=RoomRepository.js.map