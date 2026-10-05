# PRESENTATION SLIDES OUTLINE: BOARDING HOUSE MANAGEMENT SYSTEM

---

## Slide 1: Cover Page
- **Project Title**: BOARDING HOUSE MANAGEMENT SYSTEM
- **Course**: VTC Academy Plus — Programming Fundamentals with TypeScript
- **Technology**: TypeScript 5.x (Strict Mode) | Node.js | SQLite In-Process SQL Engine
- **Team Members**: Nguyen Xuan Tuan (Member 1) & Tran Van B (Member 2)
- **Academic Year**: 2025 - 2026

---

## Slide 2: Objectives & Problem Statement
- **Problem Statement**:
  - Legacy manual bookkeeping and spreadsheets are error-prone.
  - Complex 6-tier electricity billing is difficult to compute by hand.
  - Missed lease expirations and untracked tenant records.
- **Objectives**:
  - Modernize legacy C++ into structured, object-oriented TypeScript.
  - Implement Layered Architecture (Views -> Services -> Repositories -> Database).
  - Automate 6-tier EVN electricity formula + 8% VAT.
  - Provide 3-tier Role-Based Access Control and automated JSON reports.

---

## Slide 3: Customer Requirements & Scope
- **Member 1 Modules**:
  - Room Management: CRUD, filters, status transitions, room comparison.
  - Tenant Management: 12-digit CCCD validation, 10-digit phone number.
  - Service Pricing: Dynamic price updates for electricity, water, internet, sanitation.
  - User Management: Account administration and role authorization.
- **Member 2 Modules**:
  - Contract Management: Lease agreement creation, renewal, termination.
  - Invoice & Billing: Progressive 6-tier EVN utility formula + 8% VAT.
  - Payment Processing: Electronic receipt generation.
  - Reporting & Export: Occupancy rate, monthly revenue, JSON exports.

---

## Slide 4: System Architecture
- **Presentation Layer**: Interactive CLI console menus with ANSI formatting.
- **Business Service Layer**: Encapsulated domain logic (`RoomService`, `ContractService`, `InvoiceService`, `BillingCalculator`, `ReportService`).
- **Data Access Layer**: Generic Repository Pattern (`IRepository<T>`, `BaseRepository<T>`).
- **Persistence Layer**: Embedded SQLite relational engine (`schema.sql`, `seed.sql`).

---

## Slide 5: Key Business Workflows
- **Room & Contract State Machine**:
  - `AVAILABLE` $\rightarrow$ Contract created $\rightarrow$ `RENTED`.
  - Lease termination $\rightarrow$ Room restored to `AVAILABLE`.
- **Billing & Payment Workflow**:
  - Monthly utility readings entered $\rightarrow$ Progressive EVN bill + 8% VAT calculated.
  - Invoice created in `UNPAID` status.
  - Payment recorded via Cash/Transfer/QR $\rightarrow$ Status `PAID` + Receipt `REC-...`.

---

## Slide 6: Progressive Tiered Electricity Tariff
- **Official EVN 6-Tier Tariff**:
  - Tier 1 ($0 - 50\text{ kWh}$): $1.806\text{ VND/kWh}$
  - Tier 2 ($51 - 100\text{ kWh}$): $1.866\text{ VND/kWh}$
  - Tier 3 ($101 - 200\text{ kWh}$): $2.167\text{ VND/kWh}$
  - Tier 4 ($201 - 300\text{ kWh}$): $2.729\text{ VND/kWh}$
  - Tier 5 ($301 - 400\text{ kWh}$): $3.050\text{ VND/kWh}$
  - Tier 6 ($> 400\text{ kWh}$): $3.151\text{ VND/kWh}$
  - $\text{VAT} = \text{Subtotal} \times 8\%$
- **Example ($250\text{ kWh}$)**: Subtotal = $536.750\text{ VND}$, VAT = $42.940\text{ VND}$, Total = $579.690\text{ VND}$.

---

## Slide 7: Database Design (ERD)
- **Core Entities**: `users`, `rooms`, `equipment`, `customers`.
- **Transactional Entities**: `services`, `contracts`, `contract_customers` (M:N), `invoices`, `system_logs`.
- **Integrity**: Primary Keys, Foreign Keys with Cascade delete, Unique constraints (CCCD, room number, username), Indexing.

---

## Slide 8: Automated Testing & Quality Assurance
- **Jest Test Suites (`tests/`)**:
  - `validator.test.ts`: CCCD, phone, date validation.
  - `formatter.test.ts`: Currency, date formatting.
  - `billing.test.ts`: EVN 6-tier electricity & water formula.
  - `room.service.test.ts`: Room CRUD, duplicate prevention.
  - `models.test.ts`: Domain entity logic.
- **Results**: **22/22 Tests Passed (100% Success Rate)**, Zero TypeScript compilation errors.

---

## Slide 9: Task Allocation & Team Collaboration
- **Member 1 (Nguyen Xuan Tuan)**: Lead Architecture, Database DDL, Repositories, Room, Customer, Service, User modules, Core Utils.
- **Member 2 (Tran Van B)**: Contract lifecycle, Tiered billing engine, Invoicing, Payment receipts, Reporting, JSON Export, Jest test suites.
- **Score**: 10/10 contribution.

---

## Slide 10: Demo & Instructions
- `npm run dev`: Interactive Console Menu.
- `npm run demo`: Automated Walkthrough Demo.
- `npm test`: Automated Jest Unit Tests.
- `npm run build`: Production compilation.
- **Default Accounts**: `admin` / `admin123`, `manager` / `manager123`, `staff` / `staff123`.

---

## Slide 11: Conclusion & Q&A
- **Achievements**: Modernized architecture, 100% strict TypeScript, verified mathematical formulas, complete reporting.
- **Thank you for your attention!** Questions & Answers.
