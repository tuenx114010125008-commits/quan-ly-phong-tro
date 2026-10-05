"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentService = void 0;
const EquipmentRepository_1 = require("../repositories/EquipmentRepository");
const Equipment_1 = require("../models/Equipment");
const result_types_1 = require("../types/result.types");
const common_types_1 = require("../types/common.types");
const IdGenerator_1 = require("../utils/IdGenerator");
const Validator_1 = require("../utils/Validator");
const Logger_1 = require("../utils/Logger");
class EquipmentService {
    equipmentRepo;
    constructor(equipmentRepo) {
        this.equipmentRepo = equipmentRepo || new EquipmentRepository_1.EquipmentRepository();
    }
    getAll() {
        return this.equipmentRepo.getAll();
    }
    getById(id) {
        return this.equipmentRepo.getById(id);
    }
    getByRoomId(roomId) {
        return this.equipmentRepo.getByRoomId(roomId);
    }
    addEquipment(data) {
        const rules = [
            { condition: Validator_1.Validator.isNotEmpty(data.name), message: 'Tên thiết bị không được để trống.' },
            { condition: Validator_1.Validator.isNonNegativeNumber(data.value), message: 'Giá trị thiết bị phải >= 0 VNĐ.' },
            { condition: Validator_1.Validator.isNotEmpty(data.roomId), message: 'Mã phòng không được để trống.' }
        ];
        const validation = Validator_1.Validator.validate(rules);
        if (!validation.isValid) {
            return (0, result_types_1.errorResponse)('Thông tin thiết bị không hợp lệ.', validation.errors);
        }
        const newEquipment = new Equipment_1.EquipmentEntity({
            id: IdGenerator_1.IdGenerator.generate('TB'),
            roomId: data.roomId,
            name: data.name.trim(),
            condition: data.condition || common_types_1.EquipmentCondition.GOOD,
            value: data.value,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        this.equipmentRepo.create(newEquipment);
        Logger_1.Logger.info(`Thêm thiết bị "${newEquipment.name}" cho phòng ${newEquipment.roomId}.`, 'EquipmentService');
        return (0, result_types_1.successResponse)(newEquipment, 'Thêm thiết bị vào phòng thành công.');
    }
    updateEquipment(id, data) {
        const existing = this.equipmentRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy thiết bị với mã: ${id}`);
        }
        if (data.value !== undefined && !Validator_1.Validator.isNonNegativeNumber(data.value)) {
            return (0, result_types_1.errorResponse)('Giá trị thiết bị phải >= 0.');
        }
        const updated = this.equipmentRepo.update(id, data);
        Logger_1.Logger.info(`Cập nhật thông tin thiết bị: ${id}.`, 'EquipmentService');
        return (0, result_types_1.successResponse)(updated, 'Cập nhật thiết bị thành công.');
    }
    deleteEquipment(id) {
        if (!this.equipmentRepo.exists(id)) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy thiết bị với mã: ${id}`);
        }
        this.equipmentRepo.delete(id);
        Logger_1.Logger.info(`Đã xóa thiết bị mã: ${id}.`, 'EquipmentService');
        return (0, result_types_1.successResponse)(true, 'Đã xóa thiết bị thành công.');
    }
    updateCondition(id, condition) {
        return this.updateEquipment(id, { condition });
    }
}
exports.EquipmentService = EquipmentService;
//# sourceMappingURL=EquipmentService.js.map