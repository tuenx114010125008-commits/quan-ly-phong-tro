-- =========================================================================
-- HỆ THỐNG QUẢN LÝ PHÒNG TRỌ - DATABASE SCHEMA DDL
-- Hỗ trợ chuẩn SQL (SQLite / MySQL)
-- =========================================================================

-- 1. BẢNG NGƯỜI DÙNG & TÀI KHOẢN (users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED')),
    last_login_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG PHÒNG TRỌ (rooms)
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RENTED', 'MAINTENANCE')),
    area DOUBLE NOT NULL CHECK (area > 0),
    monthly_rent DOUBLE NOT NULL CHECK (monthly_rent > 0),
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG THIẾT BỊ PHÒNG (equipment)
CREATE TABLE IF NOT EXISTS equipment (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    condition VARCHAR(20) NOT NULL DEFAULT 'GOOD' CHECK (condition IN ('GOOD', 'NEW', 'DAMAGED', 'MAINTENANCE')),
    value DOUBLE NOT NULL DEFAULT 0 CHECK (value >= 0),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 4. BẢNG KHÁCH THUÊ TRỌ (customers)
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    cccd VARCHAR(12) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    hometown VARCHAR(100) NOT NULL,
    vehicle VARCHAR(50) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG DỊCH VỤ (services)
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(30) NOT NULL,
    unit_price DOUBLE NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG HỢP ĐỒNG (contracts)
CREATE TABLE IF NOT EXISTS contracts (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    deposit DOUBLE NOT NULL DEFAULT 0 CHECK (deposit >= 0),
    monthly_rent DOUBLE NOT NULL DEFAULT 0 CHECK (monthly_rent >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'TERMINATED')),
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- 7. BẢNG KHÁCH THUÊ THEO HỢP ĐỒNG (contract_customers)
CREATE TABLE IF NOT EXISTS contract_customers (
    contract_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (contract_id, customer_id),
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 8. BẢNG HÓA ĐƠN HÀNG THÁNG (invoices)
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    contract_id VARCHAR(50) NOT NULL,
    room_id VARCHAR(50) NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2000),
    room_rent_amount DOUBLE NOT NULL DEFAULT 0,
    old_electricity DOUBLE NOT NULL DEFAULT 0,
    new_electricity DOUBLE NOT NULL DEFAULT 0,
    electricity_amount DOUBLE NOT NULL DEFAULT 0,
    old_water DOUBLE NOT NULL DEFAULT 0,
    new_water DOUBLE NOT NULL DEFAULT 0,
    water_amount DOUBLE NOT NULL DEFAULT 0,
    internet_amount DOUBLE NOT NULL DEFAULT 0,
    cleaning_amount DOUBLE NOT NULL DEFAULT 0,
    surcharge DOUBLE NOT NULL DEFAULT 0,
    discount DOUBLE NOT NULL DEFAULT 0,
    total_amount DOUBLE NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'CANCELLED')),
    payment_date DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- 9. BẢNG LOGS HỆ THỐNG (system_logs)
CREATE TABLE IF NOT EXISTS system_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NULL,
    level VARCHAR(10) NOT NULL,
    action VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES NÂNG CAO TỐI ƯU HIỆU SUẤT TÌM KIẾM
CREATE INDEX IF NOT EXISTS idx_room_number ON rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_customer_cccd ON customers(cccd);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_invoice_contract ON invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_room ON contracts(room_id);
