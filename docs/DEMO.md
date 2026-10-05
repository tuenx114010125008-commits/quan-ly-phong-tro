# Project Defense Demo Script (15 - 20 Minutes)

## 🎯 Presentation Outline

1. **Introduction (2 mins)**:
   - Introduce project goals, room management scope, and transition from C++ to full-featured TypeScript.
   - Introduce team members and task allocations.

2. **System Architecture & Database (3 mins)**:
   - Present SQLite DDL schema, relationships (PK/FK/Constraints), indexes, and Generic Repository pattern.
   - Explain User authentication & 3-tier Role-Based Access Control (`ADMIN`, `MANAGER`, `STAFF`).

3. **Core Management Features Demo (4 mins)**:
   - Execute `npm run dev` and log in as `admin`.
   - Show Room CRUD, multi-criteria search, filtering, and room comparison.
   - Show Customer validation rules (12-digit CCCD, 10-digit phone, age check).

4. **Rental & Financial Operations Demo (4 mins)**:
   - Create a new Contract and observe automatic room status change from `AVAILABLE` to `RENTED`.
   - Generate monthly invoice with 6-tier progressive electricity tariff + 8% VAT.
   - Process invoice payment and show printed receipt (`REC-...`).

5. **Reports, Statistics & Export (2 mins)**:
   - Display system occupancy rate, monthly revenue timeline, Top 5 rooms & customers, and unpaid debts.
   - Export all reports into JSON format (`reports/*.json`).

6. **Testing & Code Quality (2 mins)**:
   - Run `npm test` to showcase 23/23 passing unit tests across services, utilities, and domain models.
   - Conclusion and Q&A session.
