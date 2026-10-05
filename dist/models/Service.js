"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceEntity = void 0;
const common_types_1 = require("../types/common.types");
/**
 * Lớp ServiceEntity quản lý thông tin dịch vụ
 */
class ServiceEntity {
    id;
    name;
    unit;
    unitPrice;
    status;
    description;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id || '';
        this.name = data.name;
        this.unit = data.unit;
        this.unitPrice = data.unitPrice;
        this.status = data.status || common_types_1.ServiceStatus.ACTIVE;
        this.description = data.description;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }
    isActive() {
        return this.status === common_types_1.ServiceStatus.ACTIVE;
    }
    updatePrice(newPrice) {
        if (newPrice < 0) {
            throw new Error('Đơn giá dịch vụ không được âm.');
        }
        this.unitPrice = newPrice;
        this.updatedAt = new Date();
    }
}
exports.ServiceEntity = ServiceEntity;
//# sourceMappingURL=Service.js.map