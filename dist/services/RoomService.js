"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const RoomRepository_1 = require("../repositories/RoomRepository");
const EquipmentRepository_1 = require("../repositories/EquipmentRepository");
const Room_1 = require("../models/Room");
const result_types_1 = require("../types/result.types");
const common_types_1 = require("../types/common.types");
const IdGenerator_1 = require("../utils/IdGenerator");
const Validator_1 = require("../utils/Validator");
const Logger_1 = require("../utils/Logger");
class RoomService {
    roomRepo;
    equipmentRepo;
    constructor(roomRepo, equipmentRepo) {
        this.equipmentRepo = equipmentRepo || new EquipmentRepository_1.EquipmentRepository();
        this.roomRepo = roomRepo || new RoomRepository_1.RoomRepository(this.equipmentRepo);
    }
    getAllRooms() {
        return this.roomRepo.getAll();
    }
    getRoomById(id) {
        return this.roomRepo.getById(id);
    }
    getRoomByNumber(roomNumber) {
        return this.roomRepo.findByRoomNumber(roomNumber.trim());
    }
    addRoom(data) {
        const rules = [
            { condition: Validator_1.Validator.isNotEmpty(data.roomNumber), message: 'Số phòng không được để trống.' },
            { condition: Validator_1.Validator.isPositiveNumber(data.area), message: 'Diện tích phòng phải > 0 m².' },
            { condition: Validator_1.Validator.isPositiveNumber(data.monthlyRent), message: 'Giá thuê phòng phải > 0 VNĐ.' }
        ];
        const validation = Validator_1.Validator.validate(rules);
        if (!validation.isValid) {
            return (0, result_types_1.errorResponse)('Thông tin phòng không hợp lệ.', validation.errors);
        }
        const existing = this.roomRepo.findByRoomNumber(data.roomNumber.trim());
        if (existing) {
            return (0, result_types_1.errorResponse)(`Số phòng "${data.roomNumber}" đã tồn tại trên hệ thống.`);
        }
        const newRoom = new Room_1.RoomEntity({
            id: IdGenerator_1.IdGenerator.generate('P'),
            roomNumber: data.roomNumber.trim(),
            status: common_types_1.RoomStatus.AVAILABLE,
            area: data.area,
            monthlyRent: data.monthlyRent,
            description: data.description?.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        this.roomRepo.create(newRoom);
        Logger_1.Logger.info(`Thêm mới phòng trọ: ${newRoom.roomNumber} (ID: ${newRoom.id}).`, 'RoomService');
        return (0, result_types_1.successResponse)(newRoom, `Thêm phòng "${newRoom.roomNumber}" thành công.`);
    }
    updateRoom(id, data) {
        const existing = this.roomRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy phòng với mã ID: ${id}`);
        }
        if (data.roomNumber && data.roomNumber !== existing.roomNumber) {
            const duplicate = this.roomRepo.findByRoomNumber(data.roomNumber.trim());
            if (duplicate && duplicate.id !== id) {
                return (0, result_types_1.errorResponse)(`Số phòng "${data.roomNumber}" đã trùng với phòng khác.`);
            }
        }
        if (data.area !== undefined && !Validator_1.Validator.isPositiveNumber(data.area)) {
            return (0, result_types_1.errorResponse)('Diện tích phòng phải là số thực > 0.');
        }
        if (data.monthlyRent !== undefined && !Validator_1.Validator.isPositiveNumber(data.monthlyRent)) {
            return (0, result_types_1.errorResponse)('Giá thuê phòng phải là số thực > 0.');
        }
        const updated = this.roomRepo.update(id, data);
        Logger_1.Logger.info(`Cập nhật thông tin phòng ID: ${id}.`, 'RoomService');
        return (0, result_types_1.successResponse)(updated, `Cập nhật phòng thành công.`);
    }
    deleteRoom(id) {
        const existing = this.roomRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy phòng với mã ID: ${id}`);
        }
        if (existing.status === common_types_1.RoomStatus.RENTED) {
            return (0, result_types_1.errorResponse)(`Không thể xóa phòng "${existing.roomNumber}" vì phòng đang có người thuê.`);
        }
        this.roomRepo.delete(id);
        Logger_1.Logger.info(`Đã xóa phòng ${existing.roomNumber} (ID: ${id}).`, 'RoomService');
        return (0, result_types_1.successResponse)(true, `Đã xóa phòng "${existing.roomNumber}" thành công.`);
    }
    updateStatus(id, status) {
        const existing = this.roomRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy phòng với mã ID: ${id}`);
        }
        const updated = this.roomRepo.update(id, { status });
        Logger_1.Logger.info(`Chuyển trạng thái phòng ${existing.roomNumber} sang ${status}.`, 'RoomService');
        return (0, result_types_1.successResponse)(updated, `Đã cập nhật trạng thái phòng thành ${status}.`);
    }
    searchRooms(keyword) {
        const term = keyword.trim().toLowerCase();
        if (!term)
            return this.getAllRooms();
        return this.roomRepo.find(room => room.roomNumber.toLowerCase().includes(term) ||
            room.id.toLowerCase().includes(term) ||
            Boolean(room.description?.toLowerCase().includes(term)));
    }
    filterRooms(options) {
        return this.roomRepo.find(room => {
            if (options.status && room.status !== options.status)
                return false;
            if (options.minPrice !== undefined && room.monthlyRent < options.minPrice)
                return false;
            if (options.maxPrice !== undefined && room.monthlyRent > options.maxPrice)
                return false;
            if (options.minArea !== undefined && room.area < options.minArea)
                return false;
            if (options.maxArea !== undefined && room.area > options.maxArea)
                return false;
            return true;
        });
    }
    compareRooms(roomId1, roomId2) {
        const room1 = this.roomRepo.getById(roomId1);
        const room2 = this.roomRepo.getById(roomId2);
        if (!room1 || !room2) {
            return (0, result_types_1.errorResponse)('Một trong hai phòng đem so sánh không tồn tại trên hệ thống.');
        }
        const priceDiff = room1.monthlyRent - room2.monthlyRent;
        const areaDiff = room1.area - room2.area;
        return (0, result_types_1.successResponse)({
            room1,
            room2,
            priceDiff,
            areaDiff
        }, 'So sánh thông tin 2 phòng thành công.');
    }
}
exports.RoomService = RoomService;
//# sourceMappingURL=RoomService.js.map