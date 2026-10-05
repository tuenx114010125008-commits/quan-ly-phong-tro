"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserRole = void 0;
/**
 * Các vai trò người dùng trong hệ thống quản lý phòng trọ
 */
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["STAFF"] = "STAFF"; // Nhân viên vận hành, xem thông tin và lập/thu hóa đơn
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * Trạng thái tài khoản người dùng
 */
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["LOCKED"] = "LOCKED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
//# sourceMappingURL=role.types.js.map