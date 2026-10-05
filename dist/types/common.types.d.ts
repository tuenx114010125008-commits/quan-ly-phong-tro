export type ID = string;
/**
 * Trạng thái phòng trọ
 */
export declare enum RoomStatus {
    AVAILABLE = "AVAILABLE",// Phòng trống
    RENTED = "RENTED",// Đang có người thuê
    MAINTENANCE = "MAINTENANCE"
}
/**
 * Tình trạng thiết bị trong phòng
 */
export declare enum EquipmentCondition {
    GOOD = "GOOD",// Hoạt động tốt
    NEW = "NEW",// Mới 100%
    DAMAGED = "DAMAGED",// Hư hỏng
    MAINTENANCE = "MAINTENANCE"
}
/**
 * Trạng thái khách hàng
 */
export declare enum CustomerStatus {
    ACTIVE = "ACTIVE",// Khách đang ở hoặc có thể tạo hợp đồng
    INACTIVE = "INACTIVE"
}
/**
 * Trạng thái dịch vụ
 */
export declare enum ServiceStatus {
    ACTIVE = "ACTIVE",// Đang cung cấp
    DISABLED = "DISABLED"
}
/**
 * Đơn vị tính dịch vụ
 */
export type ServiceUnit = 'kWh' | 'm3' | 'người/tháng' | 'phòng/tháng' | 'lần';
/**
 * Kiểu sắp xếp dữ liệu
 */
export type SortOrder = 'ASC' | 'DESC';
