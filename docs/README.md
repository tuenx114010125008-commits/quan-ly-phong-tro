# Room Management System (Console Application in TypeScript)

## 📌 Project Overview
A comprehensive Room & Boarding House Management Console Application developed in **TypeScript 5.x** under Strict Mode, running on **Node.js** with an embedded **SQLite SQL Database Engine**.

---

## 👥 Team Members & Task Allocation
- **Member 1 (Database & Management Core)**:
  - Database schema DDL, ERD constraints, seed data, connection manager.
  - User authentication, password verification, 3-level role authorization (`ADMIN`, `MANAGER`, `STAFF`).
  - Room management (CRUD, searching, filtering, status updating, room comparison).
  - Customer management (validations for 12-digit national ID/CCCD, 10-digit phone, hometown, vehicle).
  - Service management (Electricity, Water, High-speed Internet, Sanitation, Parking).
  - Core utilities: `Validator`, `Formatter`, `IdGenerator`, `Logger`.

- **Member 2 (Rental, Financial & Reporting)**:
  - Contract management (Creation, renewal, termination, synchronized room state transitions: `AVAILABLE` $\leftrightarrow$ `RENTED`).
  - Invoice generation (Monthly billing calculation, 6-tier progressive electricity tariff + 8% VAT, water consumption, discounts, surcharges).
  - Payment processing & receipt issuance.
  - Financial reports (Occupancy rate, monthly revenue timeline, Top 5 rooms & customers, debt reports).
  - JSON report export to `reports/`.

---

## 🏗️ Architecture Design Pattern
- **Layered Architecture**:
  $$\text{Console CLI Views} \longrightarrow \text{Business Services} \longrightarrow \text{Generic Repositories} \longrightarrow \text{SQLite Database}$$
- **Design Patterns Used**:
  - *Repository Pattern* (`IRepository<T>`, `BaseRepository<T>`)
  - *Singleton Pattern* (`DatabaseConnection`)
  - *Factory / Generator Pattern* (`IdGenerator`)
  - *Strategy / Calculator Pattern* (`BillingCalculator`)

---

## 🚀 Getting Started & Execution

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Interactive Console App**:
   ```bash
   npm run dev
   ```
3. **Run Automated Live Demo**:
   ```bash
   npm run demo
   ```
4. **Execute Unit Tests**:
   ```bash
   npm test
   ```
5. **Build Production JavaScript**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔐 Default Credentials
- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`
- **Staff**: `staff` / `staff123`
