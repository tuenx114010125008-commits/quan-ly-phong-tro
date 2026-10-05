export type ID = string;

/**
 * Trạng thái phòng trọ
 */
export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',     // Phòng trống
  RENTED = 'RENTED',           // Đang có người thuê
  MAINTENANCE = 'MAINTENANCE'  // Đang bảo trì / sửa chữa
}

/**
 * Tình trạng thiết bị trong phòng
 */
export enum EquipmentCondition {
  GOOD = 'GOOD',             // Hoạt động tốt
  NEW = 'NEW',               // Mới 100%
  DAMAGED = 'DAMAGED',       // Hư hỏng
  MAINTENANCE = 'MAINTENANCE'// Đang sửa chữa
}

/**
 * Trạng thái khách hàng
 */
export enum CustomerStatus {
  ACTIVE = 'ACTIVE',     // Khách đang ở hoặc có thể tạo hợp đồng
  INACTIVE = 'INACTIVE'  // Khách đã rời đi hoặc tạm khóa
}

/**
 * Trạng thái dịch vụ
 */
export enum ServiceStatus {
  ACTIVE = 'ACTIVE',     // Đang cung cấp
  DISABLED = 'DISABLED'  // Ngừng cung cấp
}

/**
 * Đơn vị tính dịch vụ
 */
export type ServiceUnit = 'kWh' | 'm3' | 'người/tháng' | 'phòng/tháng' | 'lần';

/**
 * Kiểu sắp xếp dữ liệu
 */
export type SortOrder = 'ASC' | 'DESC';
