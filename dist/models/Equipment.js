"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentEntity = void 0;
const common_types_1 = require("../types/common.types");
/**
 * Lớp EquipmentEntity biểu diễn thực thể thiết bị
 */
class EquipmentEntity {
    id;
    roomId;
    name;
    condition;
    value;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id || '';
        this.roomId = data.roomId;
        this.name = data.name;
        this.condition = data.condition || common_types_1.EquipmentCondition.GOOD;
        this.value = data.value;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }
    isUsable() {
        return this.condition === common_types_1.EquipmentCondition.GOOD || this.condition === common_types_1.EquipmentCondition.NEW;
    }
}
exports.EquipmentEntity = EquipmentEntity;
//# sourceMappingURL=Equipment.js.map