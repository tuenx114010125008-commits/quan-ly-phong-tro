"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomEntity = void 0;
const common_types_1 = require("../types/common.types");
/**
 * Lớp RoomEntity quản lý các hành vi và nghiệp vụ của một phòng
 */
class RoomEntity {
    id;
    roomNumber;
    status;
    area;
    monthlyRent;
    description;
    equipment;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id || '';
        this.roomNumber = data.roomNumber;
        this.status = data.status || common_types_1.RoomStatus.AVAILABLE;
        this.area = data.area;
        this.monthlyRent = data.monthlyRent;
        this.description = data.description;
        this.equipment = data.equipment || [];
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }
    isAvailable() {
        return this.status === common_types_1.RoomStatus.AVAILABLE;
    }
    isRented() {
        return this.status === common_types_1.RoomStatus.RENTED;
    }
    isMaintenance() {
        return this.status === common_types_1.RoomStatus.MAINTENANCE;
    }
    markAsRented() {
        this.status = common_types_1.RoomStatus.RENTED;
        this.updatedAt = new Date();
    }
    markAsAvailable() {
        this.status = common_types_1.RoomStatus.AVAILABLE;
        this.updatedAt = new Date();
    }
    markAsMaintenance() {
        this.status = common_types_1.RoomStatus.MAINTENANCE;
        this.updatedAt = new Date();
    }
    getTotalEquipmentValue() {
        return this.equipment.reduce((sum, item) => sum + item.value, 0);
    }
}
exports.RoomEntity = RoomEntity;
//# sourceMappingURL=Room.js.map