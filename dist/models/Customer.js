"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerEntity = void 0;
const common_types_1 = require("../types/common.types");
/**
 * Lớp CustomerEntity triển khai các phương thức thông tin khách thuê
 */
class CustomerEntity {
    id;
    fullName;
    dateOfBirth;
    cccd;
    phone;
    hometown;
    vehicle;
    status;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id || '';
        this.fullName = data.fullName;
        this.dateOfBirth = data.dateOfBirth;
        this.cccd = data.cccd;
        this.phone = data.phone;
        this.hometown = data.hometown;
        this.vehicle = data.vehicle;
        this.status = data.status || common_types_1.CustomerStatus.ACTIVE;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }
    isActive() {
        return this.status === common_types_1.CustomerStatus.ACTIVE;
    }
    getAge() {
        const birthYear = new Date(this.dateOfBirth).getFullYear();
        const currentYear = new Date().getFullYear();
        return currentYear - birthYear;
    }
}
exports.CustomerEntity = CustomerEntity;
//# sourceMappingURL=Customer.js.map