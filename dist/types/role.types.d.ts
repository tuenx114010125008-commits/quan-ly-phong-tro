/**
 * Các vai trò người dùng trong hệ thống quản lý phòng trọ
 */
export declare enum UserRole {
    ADMIN = "ADMIN",// Toàn quyền hệ thống
    MANAGER = "MANAGER",// Quản lý phòng, khách, hợp đồng, dịch vụ, hóa đơn
    STAFF = "STAFF"
}
/**
 * Trạng thái tài khoản người dùng
 */
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    LOCKED = "LOCKED"
}
