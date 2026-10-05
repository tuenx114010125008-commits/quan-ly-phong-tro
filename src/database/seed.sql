-- =========================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- =========================================================================

-- 1. USERS (Mật khẩu mặc định: 123456)
INSERT OR IGNORE INTO users (id, username, password, full_name, role, status, created_at, updated_at) VALUES
('USR001', 'admin', 'admin123', 'Quản Trị Viên Hệ Thống', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR002', 'manager', 'manager123', 'Nguyễn Văn Quản Lý', 'MANAGER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR003', 'staff', 'staff123', 'Trần Thị Thu Ngân', 'STAFF', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. ROOMS
INSERT OR IGNORE INTO rooms (id, room_number, status, area, monthly_rent, description, created_at, updated_at) VALUES
('P001', '101', 'RENTED', 25.0, 3500000, 'Phòng tầng 1, ban công thoáng mát', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('P002', '102', 'AVAILABLE', 20.0, 3000000, 'Phòng tầng 1, cửa sổ lớn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('P003', '201', 'RENTED', 30.0, 4200000, 'Phòng tầng 2, có gác lửng', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('P004', '202', 'MAINTENANCE', 22.0, 3200000, 'Phòng tầng 2, đang sơn sửa lại tường', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('P005', '301', 'AVAILABLE', 35.0, 4800000, 'Phòng tầng 3, full nội thất', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. EQUIPMENT
INSERT OR IGNORE INTO equipment (id, room_id, name, condition, value, created_at, updated_at) VALUES
('TB001', 'P001', 'Máy lạnh Daikin 1.5HP', 'GOOD', 8500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TB002', 'P001', 'Tủ lạnh mini Aqua 90L', 'GOOD', 2800000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TB003', 'P001', 'Máy nước nóng Panasonic', 'GOOD', 2200000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TB004', 'P002', 'Quạt trần Panasonic', 'NEW', 1200000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TB005', 'P003', 'Máy lạnh Casper 1HP', 'GOOD', 6500000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TB006', 'P004', 'Vòi sen tắm đứng', 'DAMAGED', 450000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TB007', 'P005', 'Máy giặt Toshiba 8kg', 'NEW', 5200000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. CUSTOMERS
INSERT OR IGNORE INTO customers (id, full_name, date_of_birth, cccd, phone, hometown, vehicle, status, created_at, updated_at) VALUES
('KH001', 'Nguyễn Văn An', '2000-05-15', '001200001234', '0912345678', 'Hà Nội', 'Honda Wave 29B1-12345', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('KH002', 'Trần Thị Mai', '1998-11-20', '001198005678', '0987654321', 'Nam Định', 'Yamaha Grande 18C1-67890', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('KH003', 'Lê Hoàng Nam', '2002-02-10', '038202009876', '0905123456', 'Thanh Hóa', 'Honda Vision 36B7-55555', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('KH004', 'Phạm Quỳnh Nga', '1995-08-25', '001195003344', '0934567890', 'Hải Phòng', 'Xe đạp điện', 'INACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. SERVICES
INSERT OR IGNORE INTO services (id, name, unit, unit_price, status, description, created_at, updated_at) VALUES
('DV001', 'Điện sinh hoạt', 'kWh', 3500, 'ACTIVE', 'Tính theo chỉ số công tơ điện riêng từng phòng', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DV002', 'Nước sinh hoạt', 'm3', 25000, 'ACTIVE', 'Tính theo chỉ số đồng hồ nước', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DV003', 'Internet / Wifi tốc độ cao', 'phòng/tháng', 100000, 'ACTIVE', 'Gói cước cáp quang 150Mbps', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DV004', 'Vệ sinh & Rác', 'người/tháng', 30000, 'ACTIVE', 'Thu gom rác và dọn vệ sinh hành lang', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DV005', 'Giữ xe máy', 'người/tháng', 80000, 'ACTIVE', 'Phí gửi xe trong hầm nhà xe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. CONTRACTS
INSERT OR IGNORE INTO contracts (id, room_id, start_date, end_date, deposit, monthly_rent, status, notes, created_at, updated_at) VALUES
('HD001', 'P001', '2026-01-01', '2026-11-01', 3500000, 3500000, 'ACTIVE', 'Hợp đồng thuê 1 năm, cọc 1 tháng', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HD002', 'P003', '2026-03-01', '2027-03-01', 4200000, 4200000, 'ACTIVE', 'Hợp đồng 2 khách ở ghép', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 7. CONTRACT_CUSTOMERS
INSERT OR IGNORE INTO contract_customers (contract_id, customer_id) VALUES
('HD001', 'KH001'),
('HD002', 'KH002'),
('HD002', 'KH003');

-- 8. INVOICES
INSERT OR IGNORE INTO invoices (id, contract_id, room_id, month, year, room_rent_amount, old_electricity, new_electricity, electricity_amount, old_water, new_water, water_amount, internet_amount, cleaning_amount, surcharge, discount, total_amount, status, payment_date, created_at, updated_at) VALUES
('INV001', 'HD001', 'P001', 8, 2026, 3500000, 100, 180, 280000, 20, 24, 100000, 100000, 30000, 0, 0, 4010000, 'PAID', '2026-08-05 10:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('INV002', 'HD001', 'P001', 9, 2026, 3500000, 180, 275, 332500, 24, 29, 125000, 100000, 30000, 0, 0, 4087500, 'PAID', '2026-09-05 14:30:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('INV003', 'HD001', 'P001', 10, 2026, 3500000, 275, 370, 332500, 29, 34, 125000, 100000, 30000, 50000, 0, 4137500, 'UNPAID', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('INV004', 'HD002', 'P003', 10, 2026, 4200000, 50, 160, 385000, 10, 18, 200000, 100000, 60000, 0, 50000, 4895000, 'UNPAID', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

