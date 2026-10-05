# PROJECT REPORT: BOARDING HOUSE MANAGEMENT SYSTEM
**Subject**: Programming Fundamentals with TypeScript  
**Class**: VTC Academy Plus  
**Group**: Group 1 (2 Members)  
**Authors**: Nguyen Xuan Tuan (Member 1) & Tran Van B (Member 2)  
**Academic Year**: 2025 - 2026  

---

## TABLE OF CONTENTS
1. [I. Project Introduction](#i-project-introduction)
2. [II. Analyze System Requirements](#ii-analyze-system-requirements)
3. [III. Design Details](#iii-design-details)
4. [IV. Testing](#iv-testing)
5. [V. Task Assignment & Contribution](#v-task-assignment--contribution)
6. [VI. Installation & User Guide](#vi-installation--user-guide)
7. [Appendix: Terms and Abbreviations](#appendix-terms-and-abbreviations)

---

## I. PROJECT INTRODUCTION

### 1.1 Problem Statement & Background
In residential areas and metropolitan centers, managing boarding houses and rental rooms has traditionally relied on manual paper logs or basic spreadsheets. These legacy methods present severe drawbacks: frequent calculation errors in tiered electricity and water tariffs, missed contract renewals, untracked tenant identity records, and lack of real-time financial reporting.

The primary objective of this project is to migrate and modernize an existing legacy C++ application into a robust, object-oriented, console-based management system written entirely in TypeScript (Strict Mode), running on Node.js and backed by an embedded SQLite database.

### 1.2 Proposed System & Objectives
The proposed Boarding House Management System provides a structured, automated solution that covers the complete tenant and property lifecycle:
- **Automated Room Lifecycle**: Synchronizes room status dynamically between `AVAILABLE`, `RENTED`, and `MAINTENANCE`.
- **Tenant Information Management**: Stores and validates 12-digit national identity numbers (CCCD), 10-digit phone numbers, hometowns, and registered vehicles.
- **Progressive Tiered Utility Billing**: Accurately computes monthly electricity consumption based on the national 6-tier EVN tariff plus 8% VAT, alongside water and communal maintenance fees.
- **Role-Based Access Control (RBAC)**: Differentiates access permissions across Administrator (`ADMIN`), Property Manager (`MANAGER`), and Operations Staff (`STAFF`).
- **Financial Reporting & Data Export**: Generates comprehensive revenue statements, occupancy rates, debt warnings, and exports reports into JSON format.

### 1.3 Scope of the Project
The project is scoped as a standalone terminal-based application (Console App) suitable for property landlords and building operators. It emphasizes high code quality, OOP principles (Encapsulation, Inheritance, Polymorphism, Abstraction), Generic Repository patterns, and comprehensive unit testing without dependencies on graphical web frontends.

### 1.4 Deployment Environment & Development Tools
| Component | Specification / Tool |
| :--- | :--- |
| **Programming Language** | TypeScript 5.7.2 (Strict Mode enabled) |
| **Runtime Environment** | Node.js v24.x / ts-node v10.9 |
| **Database Engine** | SQLite (In-process relational SQL engine) |
| **Testing Framework** | Jest v29.x with ts-jest |
| **Source Control & Editor** | Git / GitHub, Visual Studio Code |

### 1.5 Customer Requirements (System Features)
- **FR-01**: User Authentication & Session Management (Login, Logout, Role enforcement).
- **FR-02**: Room Management (CRUD, Area/Price filters, Room comparison, Equipment assignment).
- **FR-03**: Tenant Management (CRUD, CCCD & Phone validation, Activation/Deactivation).
- **FR-04**: Service & Tariff Management (Dynamic pricing for electricity, water, internet, sanitation).
- **FR-05**: Contract Management (Lease creation, automatic room status updating, contract renewal, cancellation).
- **FR-06**: Monthly Invoice Generation (Utility reading entry, 6-tier EVN electricity formula + 8% VAT, surcharges, discounts).
- **FR-07**: Payment Processing (Receipt creation with payment methods: Cash, Bank Transfer, QR Code).
- **FR-08**: Analytical Reports & JSON Export (Occupancy, Monthly revenue, Top 5 rooms/tenants, Debt tracker).

---

## II. ANALYZE SYSTEM REQUIREMENTS

### 2.1 Actor Identification & Role-Based Access Control
- **Administrator (ADMIN)**: Possesses full administrative authority, including user creation, role assignment, system configuration, and data export.
- **Property Manager (MANAGER)**: Manages rooms, tenants, contracts, service pricing, invoice creation, and financial reports.
- **Operations Staff (STAFF)**: Handles day-to-day operations: viewing room/tenant status, creating monthly invoices, and processing payments.

### 2.2 Detailed Use Case Specifications

#### UC01: User Login & Authentication
- **Primary Actor**: All Users (`ADMIN`, `MANAGER`, `STAFF`)
- **Description**: Authenticates user credentials against the database and establishes active session.
- **Preconditions**: User possesses valid registered account in SQLite database.
- **Postconditions**: User is authenticated with designated Role permissions; last login timestamp updated.
- **Main Success Scenario**:
  1. User enters username and password.
  2. System validates non-empty inputs.
  3. System checks password match and active account status.
  4. System grants access to role-specific Main Menu.

#### UC02: Room Management & Comparison
- **Primary Actor**: `ADMIN`, `MANAGER`
- **Description**: Performs CRUD operations on rooms, searches by number, filters by status/price/area, and compares two rooms.
- **Preconditions**: Manager is logged in.
- **Postconditions**: Room data updated in database; room state reflects `AVAILABLE`, `RENTED`, or `MAINTENANCE`.
- **Main Success Scenario**:
  1. User selects room operation from menu.
  2. User provides room number, area ($>0$), and monthly rent ($>0$).
  3. System verifies room number uniqueness and persists record.
  4. For comparison, system calculates price & area differentials.

#### UC03: Tenant Profile Management
- **Primary Actor**: `ADMIN`, `MANAGER`
- **Description**: Registers tenant records, verifies 12-digit CCCD and 10-digit phone, tracks hometown and vehicles.
- **Preconditions**: User is logged in as Manager or Admin.
- **Postconditions**: Tenant record created with `ACTIVE` status; duplicate CCCD rejected.

#### UC04: Contract Creation & Lifecycle
- **Primary Actor**: `ADMIN`, `MANAGER`
- **Description**: Creates lease contract between tenant(s) and an available room, automatically updating room state.
- **Preconditions**: Target room is `AVAILABLE`; selected tenants are `ACTIVE`.
- **Postconditions**: Contract created with `ACTIVE` status; room state switches from `AVAILABLE` to `RENTED`.

#### UC05: Monthly Invoice & Progressive Billing
- **Primary Actor**: `ADMIN`, `MANAGER`, `STAFF`
- **Description**: Generates monthly invoice incorporating 6-tier EVN electricity formula + 8% VAT and utility readings.
- **Preconditions**: Active contract exists for the target room and month.
- **Postconditions**: Invoice created with `UNPAID` status with comprehensive cost breakdown.

#### UC06: Invoice Payment & Receipt
- **Primary Actor**: `ADMIN`, `MANAGER`, `STAFF`
- **Description**: Processes payment for pending invoice and generates structured electronic receipt.
- **Preconditions**: Target invoice is in `UNPAID` status.
- **Postconditions**: Invoice status becomes `PAID` with payment date; receipt generated.

#### UC07: Financial Reporting & Export
- **Primary Actor**: `ADMIN`, `MANAGER`
- **Description**: Generates occupancy reports, monthly revenue breakdown, top rankings, and exports JSON files.
- **Preconditions**: User is authenticated as Admin or Manager.
- **Postconditions**: Reports displayed on console table and exported to `reports/` directory.

---

## III. DESIGN DETAILS

### 3.1 System Architecture
The application follows a clean 4-tier Layered Architecture enforcing Separation of Concerns (SoC):
1. **Presentation Layer (Views)**: Interactive console menus (`ManagementView`, `RentalFinanceView`, `InputPrompt`).
2. **Business Logic Layer (Services)**: Domain business services (`RoomService`, `ContractService`, `InvoiceService`, `BillingCalculator`, `ReportService`, `AuthService`).
3. **Data Access Layer (Repositories)**: Generic repository abstractions (`IRepository<T>`, `BaseRepository<T>`).
4. **Persistence Layer (Database)**: SQLite database engine initialized via `schema.sql` and `seed.sql`.

### 3.2 Progressive Tiered Electricity Tariff Algorithm
Electricity billing adheres to the official Vietnamese residential progressive tariff model with an 8% Value Added Tax (VAT):

| Tier Name | Consumption Range | Unit Price (VND/kWh) |
| :--- | :--- | :--- |
| **Tier 1 (Bậc 1)** | $0 - 50\text{ kWh}$ | $1.806\text{ VND}$ |
| **Tier 2 (Bậc 2)** | $51 - 100\text{ kWh}$ | $1.866\text{ VND}$ |
| **Tier 3 (Bậc 3)** | $101 - 200\text{ kWh}$ | $2.167\text{ VND}$ |
| **Tier 4 (Bậc 4)** | $201 - 300\text{ kWh}$ | $2.729\text{ VND}$ |
| **Tier 5 (Bậc 5)** | $301 - 400\text{ kWh}$ | $3.050\text{ VND}$ |
| **Tier 6 (Bậc 6)** | $> 400\text{ kWh}$ | $3.151\text{ VND}$ |

$$\text{Total Electricity Bill} = \text{Subtotal} + (\text{Subtotal} \times 0.08)$$

### 3.3 Database Design & Entity Relationship (ERD)
The schema consists of 9 interrelated tables:
- `users`: User authentication, roles (`ADMIN`, `MANAGER`, `STAFF`), and status.
- `rooms`: Room inventory, area, rent, status (`AVAILABLE`, `RENTED`, `MAINTENANCE`).
- `equipment`: Room equipment items, condition (`GOOD`, `NEW`, `DAMAGED`, `MAINTENANCE`), value.
- `customers`: Tenant profiles, 12-digit unique CCCD, phone, hometown, vehicle.
- `services`: Dynamic utility pricing (Electricity, Water, Internet, Sanitation, Parking).
- `contracts`: Lease agreements with room ID, date range, deposit, rent, status.
- `contract_customers`: Many-to-many linking table between contracts and tenants.
- `invoices`: Monthly bills with meter readings, sub-charges, discounts, status (`UNPAID`, `PAID`, `CANCELLED`).
- `system_logs`: Application activity audit trail.

---

## IV. TESTING

### 4.1 Test Cases Matrix
| Test ID | Test Case Description | Test Input / Condition | Expected Outcome | Result |
| :--- | :--- | :--- | :--- | :---: |
| **TC01** | Room Creation (Happy Path) | Room 501, area 25, rent 3.5M | Room created with `AVAILABLE` status | **PASS** |
| **TC02** | Room Creation (Duplicate) | Existing room number | Rejected with duplicate message | **PASS** |
| **TC03** | Room Creation (Negative Area) | Area = -5 m2 | Rejected by validation rule | **PASS** |
| **TC04** | Tenant Validation (Valid CCCD) | 12-digit numeric CCCD | Accepted and saved | **PASS** |
| **TC05** | Tenant Validation (Invalid Phone)| Phone with 9 digits or starting with 1 | Rejected by regex validation | **PASS** |
| **TC06** | Contract Creation (Available) | Room is `AVAILABLE`, tenant is `ACTIVE` | Contract `ACTIVE`, room becomes `RENTED` | **PASS** |
| **TC07** | Contract Creation (Rented Room) | Room already `RENTED` | Rejected: room not available | **PASS** |
| **TC08** | Contract Expiration Warning | Contract ending in 15 days | Detected by `isExpiringSoon(30)` | **PASS** |
| **TC09** | Tiered Electricity (Tier 1) | Consumption = 40 kWh | Bill = $40 \times 1806 + 8\%$ VAT | **PASS** |
| **TC10** | Tiered Electricity (Multi-tier) | Consumption = 250 kWh | Progressive sum across 4 tiers + 8% VAT | **PASS** |
| **TC11** | Invoice Creation (Valid Readings)| New electric = 220, Old = 100 | Invoice total correctly computed | **PASS** |
| **TC12** | Invoice Meter Error | New meter < Old meter | Rejected: meter reading invalid | **PASS** |
| **TC13** | Invoice Payment (First time) | Invoice `UNPAID`, method Transfer | Status $\rightarrow$ `PAID`, receipt issued | **PASS** |
| **TC14** | Invoice Payment (Repayment) | Invoice already `PAID` | Rejected: cannot pay twice | **PASS** |
| **TC15** | JSON Report Export | Export Overview report | `overview_report.json` generated | **PASS** |
| **TC16** | User Permission (Staff -> Admin) | Staff attempts to manage users | Permission denied warning | **PASS** |

### 4.2 Automated Jest Test Execution Results
- `tests/utils/validator.test.ts`: 6/6 tests passed
- `tests/utils/formatter.test.ts`: 3/3 tests passed
- `tests/services/billing.test.ts`: 4/4 tests passed
- `tests/services/room.service.test.ts`: 4/4 tests passed
- `tests/models/models.test.ts`: 5/5 tests passed
- **Summary**: 5 Test Suites Passed, **22/22 Total Tests Passed (100% Success Rate)**.

---

## V. TASK ASSIGNMENT & CONTRIBUTION

| Member | Assigned Tasks | Deliverables | Self-Score |
| :--- | :--- | :--- | :---: |
| **Member 1** (Nguyen Xuan Tuan) | Database DDL, Connection Singleton, Room, Customer, Service, Equipment, User, Validator, Formatter | Core Database, Repositories, Management Services, Console Menu | **10/10** |
| **Member 2** (Tran Van B) | ContractService, InvoiceService, BillingCalculator (Tiered EVN + VAT 8%), PaymentService, ReportService, Jest Tests | Rental & Finance Engine, JSON Exporter, Automated Jest Unit Tests | **10/10** |

---

## VI. INSTALLATION & USER GUIDE

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run interactive console application**:
   ```bash
   npm run dev
   ```
3. **Run automated walkthrough demo**:
   ```bash
   npm run demo
   ```
4. **Execute unit tests**:
   ```bash
   npm test
   ```
5. **Build and run production bundle**:
   ```bash
   npm run build
   npm start
   ```

### Default Accounts:
- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`
- **Staff**: `staff` / `staff123`

---

## APPENDIX: TERMS AND ABBREVIATIONS
- **CCCD**: Căn cước công dân (Vietnamese National Identity Card - 12 numeric digits).
- **CRUD**: Create, Read, Update, Delete.
- **ERD**: Entity Relationship Diagram.
- **EVN**: Electricity Vietnam (Tập đoàn Điện lực Việt Nam).
- **RBAC**: Role-Based Access Control.
- **VAT**: Value Added Tax (Thuế giá trị gia tăng - 8%).
