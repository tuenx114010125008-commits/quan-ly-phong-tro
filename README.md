# Đồ Án TypeScript: Hệ Thống Quản Lý Phòng Trọ

Ứng dụng dòng lệnh (Console Application) phục vụ quản lý phòng trọ, khách thuê, hợp đồng và hóa đơn dịch vụ hàng tháng.

## Công nghệ sử dụng
- **TypeScript 5.x** (Strict Mode)
- **Node.js** + **ts-node**
- **SQLite** (Node built-in SQLite engine)
- **Jest** (Unit Test)

---

## Phân chia công việc trong nhóm
- **Thành viên 1**: Thiết kế cơ sở dữ liệu (`schema.sql`, `seed.sql`), phân quyền người dùng, quản lý phòng trọ, khách thuê, thiết bị và bảng giá dịch vụ.
- **Thành viên 2**: Quản lý hợp đồng thuê phòng, lập hóa đơn, tính tiền điện theo bậc thang EVN + VAT 8%, thanh toán hóa đơn và xuất báo cáo JSON.

---

## Cấu trúc thư mục

```text
quan-ly-phong-tro/
├── src/
│   ├── database/       # Ket noi SQLite, schema DDL, seed data
│   ├── models/         # User, Room, Customer, Contract, Invoice, Service, Equipment
│   ├── repositories/   # BaseRepository generic va cac repository cu the
│   ├── services/       # AuthService, RoomService, ContractService, InvoiceService, ReportService...
│   ├── utils/          # Validator, Formatter, Logger, IdGenerator
│   ├── views/          # Menu console
│   ├── index.ts        # File chay chinh
│   └── demo.ts         # Script chay demo
├── tests/              # Jest unit tests
├── docs/               # Tai lieu tieng Anh theo mau
├── package.json
└── tsconfig.json
```

---

## Hướng dẫn chạy chương trình

1. Cài đặt thư viện:
```bash
npm install
```

2. Chạy chương trình console tương tác:
```bash
npm run dev
```

3. Chạy demo tự động:
```bash
npm run demo
```

4. Chạy Unit Test:
```bash
npm test
```

5. Build sang JavaScript:
```bash
npm run build
npm start
```

---

## Tài khoản đăng nhập
- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`
- **Staff**: `staff` / `staff123`
