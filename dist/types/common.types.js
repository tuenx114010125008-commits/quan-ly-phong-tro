"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceStatus = exports.CustomerStatus = exports.EquipmentCondition = exports.RoomStatus = void 0;
/**
 * Trạng thái phòng trọ
 */
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["AVAILABLE"] = "AVAILABLE";
    RoomStatus["RENTED"] = "RENTED";
    RoomStatus["MAINTENANCE"] = "MAINTENANCE"; // Đang bảo trì / sửa chữa
})(RoomStatus || (exports.RoomStatus = RoomStatus = {}));
/**
 * Tình trạng thiết bị trong phòng
 */
var EquipmentCondition;
(function (EquipmentCondition) {
    EquipmentCondition["GOOD"] = "GOOD";
    EquipmentCondition["NEW"] = "NEW";
    EquipmentCondition["DAMAGED"] = "DAMAGED";
    EquipmentCondition["MAINTENANCE"] = "MAINTENANCE"; // Đang sửa chữa
})(EquipmentCondition || (exports.EquipmentCondition = EquipmentCondition = {}));
/**
 * Trạng thái khách hàng
 */
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["ACTIVE"] = "ACTIVE";
    CustomerStatus["INACTIVE"] = "INACTIVE"; // Khách đã rời đi hoặc tạm khóa
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
/**
 * Trạng thái dịch vụ
 */
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["ACTIVE"] = "ACTIVE";
    ServiceStatus["DISABLED"] = "DISABLED"; // Ngừng cung cấp
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
//# sourceMappingURL=common.types.js.map