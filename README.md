# Hệ Thống Quản Lý Phòng Trọ (Console Application)

> Dự án xây dựng ứng dụng Quản lý phòng trọ Console bằng **TypeScript 5.x** (Strict Mode) trên nền tảng **Node.js** và cơ sở dữ liệu **SQLite / SQL Engine**.

---

## 🌟 Tính Năng Chính

### Phân Hệ 1: Database, Cơ Sở Vật Chất & Quản Lý
- **Cơ sở dữ liệu SQLite**: Khởi tạo Schema DDL tự động, Primary/Foreign Keys, Constraints, Indexes.
- **Xác thực & Phân quyền (Auth & Permissions)**: Hỗ trợ 3 role (`ADMIN`, `MANAGER`, `STAFF`).
- **Quản lý phòng trọ (Room)**: CRUD, tìm kiếm, lọc đa điều kiện, đổi trạng thái (`AVAILABLE`, `RENTED`, `MAINTENANCE`), so sánh thông số giữa 2 phòng.
- **Quản lý trang thiết bị (Equipment)**: Gán / gỡ và kiểm tra tình trạng thiết bị theo phòng.
- **Quản lý khách thuê (Customer)**: Kiểm tra hợp lệ định dạng CCCD 12 số, SĐT 10 số, quê quán.
- **Quản lý dịch vụ (Service)**: Quản lý bảng giá Điện, Nước, Internet, Vệ sinh, Gửi xe.

### Phân Hệ 2: Hợp Đồng, Tài Chính & Báo Cáo
- **Quản lý hợp đồng (Contract)**: Lập hợp đồng thuê, gia hạn, kết thúc hợp đồng; tự động đồng bộ trạng thái phòng `AVAILABLE` $\leftrightarrow$ `RENTED`.
- **Hóa đơn & Biểu giá điện bậc thang (Invoice & Billing)**: Tính tiền điện theo 6 bậc thang EVN chuẩn + VAT 8%, tiền nước, tiền dịch vụ, phụ phí và chiết khấu.
- **Thanh toán (Payment)**: Luồng thanh toán hóa đơn (`UNPAID` $\rightarrow$ `PAID`), xuất biên lai thu tiền.
- **Báo cáo & Thống kê (Reports)**: Báo cáo tổng quan, tỷ lệ lấp đầy, doanh thu theo tháng/năm, Top 5 phòng/khách hàng, công nợ.
- **Xuất báo cáo (Export JSON)**: Tự động kết xuất 4 loại báo cáo ra file `.json` trong thư mục `reports/`.

---

## 🏗️ Cấu Trúc Thư Mục

```text
quan-ly-phong-tro/
├── src/
│   ├── types/          # Enums, Interfaces & Types
│   ├── models/         # BaseEntity, User, Room, Customer, Contract, Invoice, Service, Equipment
│   ├── database/       # SQLite Connection, Schema SQL, Seed SQL
│   ├── repositories/   # Generic BaseRepository & Specific Repositories
│   ├── services/       # Business Services (Auth, Room, Contract, Invoice, Billing, Report...)
│   ├── utils/          # Validator, Formatter (ANSI Table), IdGenerator, Logger
│   ├── views/          # CLI Interactive Menus
│   ├── index.ts        # Điểm khởi chạy chính của ứng dụng
│   └── demo.ts         # Kịch bản Demo tự động toàn bộ 2 phân hệ
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy Demo tự động
```bash
npm run demo
```

### 3. Chạy Menu tương tác Console
```bash
npm run dev
```

### 4. Build Production
```bash
npm run build
npm start
```

---

## 🔑 Tài Khoản Đăng Nhập Mặc Định

| Tên đăng nhập | Mật khẩu | Vai trò |
| :--- | :--- | :--- |
| **`admin`** | `admin123` | **ADMIN** (Toàn quyền hệ thống) |
| **`manager`** | `manager123` | **MANAGER** (Quản lý) |
| **`staff`** | `staff123` | **STAFF** (Nhân viên) |
