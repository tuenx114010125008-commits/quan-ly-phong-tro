# DANH MỤC SƠ ĐỒ THIẾT KẾ HỆ THỐNG - QUẢN LÝ PHÒNG TRỌ

Thư mục này chứa toàn bộ sơ đồ kỹ thuật (ảnh PNG độ nét cao, vector SVG và mã nguồn Mermaid .mmd) phục vụ Báo cáo đồ án (>50 trang) và Slide thuyết trình VTC Academy.

| STT | Tên Sơ Đồ | File Ảnh PNG | File Vector SVG | File Mã Nguồn MMD |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Sơ đồ Use Case Tổng quan Hệ thống** | [`1_use_case_diagram.png`](./1_use_case_diagram.png) | [`1_use_case_diagram.svg`](./1_use_case_diagram.svg) | [`1_use_case_diagram.mmd`](./1_use_case_diagram.mmd) |
| 2 | **Sơ đồ Quan hệ Thực thể CSDL (ERD)** | [`2_erd_database_diagram.png`](./2_erd_database_diagram.png) | [`2_erd_database_diagram.svg`](./2_erd_database_diagram.svg) | [`2_erd_database_diagram.mmd`](./2_erd_database_diagram.mmd) |
| 3 | **Sơ đồ Lớp Chi tiết (UML Class Diagram)** | [`3_uml_class_diagram.png`](./3_uml_class_diagram.png) | [`3_uml_class_diagram.svg`](./3_uml_class_diagram.svg) | [`3_uml_class_diagram.mmd`](./3_uml_class_diagram.mmd) |
| 4 | **Sơ đồ Quy trình Phân làn: Lập hóa đơn & Tính điện EVN (BPMN Swimlane)** | [`4_bpmn_swimlane_billing.png`](./4_bpmn_swimlane_billing.png) | [`4_bpmn_swimlane_billing.svg`](./4_bpmn_swimlane_billing.svg) | [`4_bpmn_swimlane_billing.mmd`](./4_bpmn_swimlane_billing.mmd) |
| 5 | **Sơ đồ Quy trình Phân làn: Ký hợp đồng & Bàn giao phòng** | [`5_bpmn_swimlane_contract.png`](./5_bpmn_swimlane_contract.png) | [`5_bpmn_swimlane_contract.svg`](./5_bpmn_swimlane_contract.svg) | [`5_bpmn_swimlane_contract.mmd`](./5_bpmn_swimlane_contract.mmd) |
| 6 | **Sơ đồ Kiến trúc Phân tầng 3-Tier (Layered Architecture)** | [`6_layered_architecture.png`](./6_layered_architecture.png) | [`6_layered_architecture.svg`](./6_layered_architecture.svg) | [`6_layered_architecture.mmd`](./6_layered_architecture.mmd) |

---

## CHI TIẾT CÁC SƠ ĐỒ

### 1. Sơ đồ Use Case Tổng quan Hệ thống
**Mô tả**: Mô tả ranh giới hệ thống, 2 tác nhân (Admin & Staff) và các ca sử dụng theo phân quyền RBAC.

![Sơ đồ Use Case Tổng quan Hệ thống](./1_use_case_diagram.png)

```mermaid
flowchart LR
    Admin[Quan tri vien - Admin]
    Staff[Nhan vien - Staff]
    Staff --> Admin

    subgraph System [He thong Quan ly Nha tro]
        UC_Login([Dang nhap he thong])
        UC_Room([Quan ly danh muc phong])
        UC_Equip([Quan ly trang thiet bi])
        UC_Customer([Quan ly khach thue va CCCD])
        UC_Contract([Lap hop dong thue tro])
        UC_Invoice([Lap hoa don va Tinh dien EVN])
        UC_Report([Bao cao tai chinh va Doanh thu])
        UC_Audit([Ghi log kiem toan])

        UC_Contract -.->|include| UC_Customer
        UC_Contract -.->|include| UC_Room
        UC_Invoice -.->|extend| UC_Report
        UC_Audit -.->|extend| UC_Login
    end

    Staff --- UC_Login
    Staff --- UC_Customer
    Staff --- UC_Contract
    Staff --- UC_Invoice

    Admin --- UC_Room
    Admin --- UC_Equip
    Admin --- UC_Report
    Admin --- UC_Audit

```

---

### 2. Sơ đồ Quan hệ Thực thể CSDL (ERD)
**Mô tả**: Mô tả 8 bảng dữ liệu SQLite, khóa chính (PK), khóa ngoại (FK) và mối quan hệ thực thể.

![Sơ đồ Quan hệ Thực thể CSDL (ERD)](./2_erd_database_diagram.png)

```mermaid
erDiagram
    USERS {
        string id PK
        string username UK
        string passwordHash
        string fullName
        string role
        boolean isActive
    }
    ROOMS {
        string id PK
        string roomNumber UK
        number price
        number area
        string status
        number maxOccupants
    }
    EQUIPMENT {
        string id PK
        string roomId FK
        string name
        string code
        string condition
    }
    CUSTOMERS {
        string id PK
        string fullName
        string identityCard UK
        string phone
        string email
        boolean isStaying
    }
    SERVICES {
        string id PK
        string name
        number unitPrice
        string unit
    }
    ROOM_SERVICES {
        string id PK
        string roomId FK
        string serviceId FK
    }
    CONTRACTS {
        string id PK
        string contractNumber UK
        string roomId FK
        string customerId FK
        string startDate
        string endDate
        number depositAmount
        number monthlyRent
        string status
    }
    INVOICES {
        string id PK
        string invoiceNumber UK
        string contractId FK
        string billingMonth
        number electricityUsage
        number electricityAmount
        number totalAmount
        string status
    }

    ROOMS ||--o{ EQUIPMENT : trang_bi
    ROOMS ||--o{ ROOM_SERVICES : dang_ky
    SERVICES ||--o{ ROOM_SERVICES : cung_cap
    ROOMS ||--o{ CONTRACTS : duoc_thue
    CUSTOMERS ||--o{ CONTRACTS : dung_ten
    CONTRACTS ||--o{ INVOICES : phat_sinh

```

---

### 3. Sơ đồ Lớp Chi tiết (UML Class Diagram)
**Mô tả**: Mô tả tính đóng gói, kế thừa BaseEntity, generic repository và các nghiệp vụ tính toán.

![Sơ đồ Lớp Chi tiết (UML Class Diagram)](./3_uml_class_diagram.png)

```mermaid
classDiagram
    class BaseEntity {
        <<Abstract>>
        +string id
        +Date createdAt
        +Date updatedAt
    }

    class Room {
        +string roomNumber
        +number price
        +number area
        +RoomStatus status
        +number maxOccupants
        +isAvailable() boolean
    }

    class Customer {
        +string fullName
        +string identityCard
        +string phone
        +string email
        +boolean isStaying
        +validateCCCD() boolean
    }

    class Contract {
        +string contractNumber
        +string roomId
        +string customerId
        +Date startDate
        +Date endDate
        +number depositAmount
        +ContractStatus status
        +isExpired() boolean
    }

    class Invoice {
        +string invoiceNumber
        +string contractId
        +string billingMonth
        +number electricityUsage
        +number electricityAmount
        +number totalAmount
        +PaymentStatus status
        +markAsPaid() void
    }

    class BillingCalculator {
        <<Utility>>
        +calculateElectricityEVN(usageKwh: number) TierBreakdown
        +calculateVAT(amount: number, vatRate: number) number
        +computeFinalInvoiceTotal(breakdown: BillingBreakdown) number
    }

    class ContractService {
        -ContractRepository contractRepo
        -RoomRepository roomRepo
        +createContract(data: CreateContractDTO) Contract
        +terminateContract(contractId: string) boolean
    }

    class InvoiceService {
        -InvoiceRepository invoiceRepo
        -BillingCalculator calculator
        +generateMonthlyBill(contractId: string, kwh: number) Invoice
        +collectPayment(invoiceId: string) boolean
    }

    BaseEntity <|-- Room
    BaseEntity <|-- Customer
    BaseEntity <|-- Contract
    BaseEntity <|-- Invoice

    Customer "1" <-- "1..*" Contract : ky_ten
    Room "1" <-- "1..*" Contract : duoc_thue
    Contract "1" <-- "0..*" Invoice : phat_sinh
    InvoiceService ..> BillingCalculator : su_dung
    InvoiceService ..> Invoice : quan_ly
    ContractService ..> Contract : quan_ly

```

---

### 4. Sơ đồ Quy trình Phân làn: Lập hóa đơn & Tính điện EVN (BPMN Swimlane)
**Mô tả**: Phân làn 3 đối tượng (Khách thuê, Nhân viên, Hệ thống) xử lý lũy tiến 6 bậc điện và thuế VAT 8%.

![Sơ đồ Quy trình Phân làn: Lập hóa đơn & Tính điện EVN (BPMN Swimlane)](./4_bpmn_swimlane_billing.png)

```mermaid
flowchart TD
    subgraph Lane1 [Lan 1: KHACH THUE - Customer]
        StartNode((Bat dau))
        Cust_Pay[Thanh toan tien phong va dich vu]
        Cust_Receive[Nhan bien lai xac nhan]
        EndNode((Hoan tat))
    end

    subgraph Lane2 [Lan 2: NHAN VIEN QUAN LY - Staff]
        Staff_Input[Nhap chi so cong to dien Cu va Moi]
        Staff_Check{Kiem tra so lieu kWh}
        Staff_Confirm[Xac nhan lap hoa don thang]
        Staff_Collect[Thu tien va gach no he thong]
    end

    subgraph Lane3 [Lan 3: HE THONG PHAN MEM - Core System]
        Sys_CalcUsage[Tinh: kWh tieu thu = Moi - Cu]
        Sys_EVN[Ap dung bieu gia EVN 6 bac luy tien]
        Sys_Service[Cong tien phong va Dich vu co dinh]
        Sys_VAT[Ap thue GTGT VAT 8 percent]
        Sys_SaveInv[Luu hoa don CSDL - UNPAID]
        Sys_UpdatePaid[Cap nhat hoa don sang PAID]
    end

    StartNode --> Staff_Input
    Staff_Input --> Staff_Check
    Staff_Check -- Hop le --> Staff_Confirm
    Staff_Check -- Sai chi so --> Staff_Input
    Staff_Confirm --> Sys_CalcUsage
    Sys_CalcUsage --> Sys_EVN
    Sys_EVN --> Sys_Service
    Sys_Service --> Sys_VAT
    Sys_VAT --> Sys_SaveInv
    Sys_SaveInv -.-> Cust_Pay
    Cust_Pay --> Staff_Collect
    Staff_Collect --> Sys_UpdatePaid
    Sys_UpdatePaid --> Cust_Receive
    Cust_Receive --> EndNode

```

---

### 5. Sơ đồ Quy trình Phân làn: Ký hợp đồng & Bàn giao phòng
**Mô tả**: Phân làn nghiệp vụ khi tiếp nhận khách mới, xác thực CCCD 12 số và chuyển trạng thái phòng.

![Sơ đồ Quy trình Phân làn: Ký hợp đồng & Bàn giao phòng](./5_bpmn_swimlane_contract.png)

```mermaid
flowchart TD
    subgraph Lane_Cust [KHACH THUE - Customer]
        StartContract((Bat dau))
        Cust_Choose[Chon phong va Nop CCCD]
        Cust_Deposit[Dong tien dat coc]
        Cust_CheckIn[Nhan phong va Ban giao thiet bi]
        EndContract((Ket thuc))
    end

    subgraph Lane_Staff [NHAN VIEN - Staff]
        Staff_FindRoom[Kiem tra danh muc phong trong AVAILABLE]
        Staff_CheckCCCD{Xac thuc CCCD 12 so}
        Staff_CreateDraft[Lap hop dong va Dieu khoan]
        Staff_Handover[Lap bien ban ban giao thiet bi]
    end

    subgraph Lane_Sys [HE THONG - Core System]
        Sys_ValCCCD[Validate dinh dang so CCCD]
        Sys_SaveContract[Luu thong tin Contract vao CSDL]
        Sys_ChangeStatus[Chuyen trang thai phong: AVAILABLE -> RENTED]
    end

    StartContract --> Cust_Choose
    Cust_Choose --> Staff_FindRoom
    Staff_FindRoom --> Staff_CheckCCCD
    Staff_CheckCCCD -- Hop le --> Sys_ValCCCD
    Staff_CheckCCCD -- Khong hop le --> Cust_Choose
    Sys_ValCCCD --> Staff_CreateDraft
    Staff_CreateDraft --> Cust_Deposit
    Cust_Deposit --> Sys_SaveContract
    Sys_SaveContract --> Sys_ChangeStatus
    Sys_ChangeStatus --> Staff_Handover
    Staff_Handover --> Cust_CheckIn
    Cust_CheckIn --> EndContract

```

---

### 6. Sơ đồ Kiến trúc Phân tầng 3-Tier (Layered Architecture)
**Mô tả**: Kiến trúc tách biệt Presentation, Business Logic và Data Access Layer.

![Sơ đồ Kiến trúc Phân tầng 3-Tier (Layered Architecture)](./6_layered_architecture.png)

```mermaid
flowchart TD
    subgraph Presentation [1. PRESENTATION LAYER - Giao dien CLI / Console]
        UI_Nav[Main Menu Navigation & Readline Handler]
        UI_Room[Room Management View]
        UI_Billing[Billing & EVN Calculation View]
        UI_Report[Financial & Occupancy Report View]
    end

    subgraph BusinessLogic [2. BUSINESS LOGIC LAYER - Dich vu & Tinh toan]
        S_Auth[AuthService - RBAC Security]
        S_Room[RoomService & Lifecycle Controller]
        S_Contract[ContractService - Auto Status Sync]
        S_Invoice[InvoiceService & Payment Handler]
        S_Calc[BillingCalculator - EVN 6-Tier + 8% VAT]
        S_Val[Validator - CCCD, Phone, Email, Price]
    end

    subgraph DataAccess [3. DATA ACCESS LAYER - Luu tru & Du lieu]
        Repo_Base[BaseRepository generic CRUD]
        Repo_Room[RoomRepository]
        Repo_Contract[ContractRepository]
        Repo_Invoice[InvoiceRepository]
        DB_Engine[SQLite Engine - Connection Pool]
        DB_File[(quan_ly_phong_tro.db)]
    end

    Presentation --> BusinessLogic
    BusinessLogic --> DataAccess
    DataAccess --> DB_File

```

---

