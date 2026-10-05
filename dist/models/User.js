"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const role_types_1 = require("../types/role.types");
/**
 * Lớp UserEntity triển khai các phương thức kiểm tra phân quyền và thông tin
 */
class UserEntity {
    id;
    username;
    password;
    fullName;
    role;
    status;
    lastLoginAt;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id || '';
        this.username = data.username;
        this.password = data.password || '123456';
        this.fullName = data.fullName || data.username;
        this.role = data.role;
        this.status = data.status || role_types_1.UserStatus.ACTIVE;
        this.lastLoginAt = data.lastLoginAt ? new Date(data.lastLoginAt) : undefined;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }
    isAdmin() {
        return this.role === role_types_1.UserRole.ADMIN;
    }
    isManager() {
        return this.role === role_types_1.UserRole.MANAGER || this.isAdmin();
    }
    isStaff() {
        return this.role === role_types_1.UserRole.STAFF || this.isManager();
    }
    hasPermission(requiredRole) {
        if (this.role === role_types_1.UserRole.ADMIN)
            return true;
        if (this.role === role_types_1.UserRole.MANAGER && requiredRole !== role_types_1.UserRole.ADMIN)
            return true;
        return this.role === requiredRole;
    }
    isActive() {
        return this.status === role_types_1.UserStatus.ACTIVE;
    }
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            fullName: this.fullName,
            role: this.role,
            status: this.status,
            lastLoginAt: this.lastLoginAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
exports.UserEntity = UserEntity;
//# sourceMappingURL=User.js.map