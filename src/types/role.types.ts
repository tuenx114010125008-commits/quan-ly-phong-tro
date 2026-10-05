/**
 * Các vai trò người dùng trong hệ thống quản lý phòng trọ
 */
export enum UserRole {
  ADMIN = 'ADMIN',       // Toàn quyền hệ thống
  MANAGER = 'MANAGER',   // Quản lý phòng, khách, hợp đồng, dịch vụ, hóa đơn
  STAFF = 'STAFF'        // Nhân viên vận hành, xem thông tin và lập/thu hóa đơn
}

/**
 * Trạng thái tài khoản người dùng
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}
