# ZSmart — Platform Walkthrough

This document outlines the implementation, features, and verification of the ZSmart Lead and Expense Management Platform.

---

## 🛠️ Key Accomplishments

### 1. Robust NestJS Middleware (Backend)
- Fully scaffolded NestJS app running on `http://localhost:3001/api`.
- Applied global **ValidationPipe** for class-validator DTOs, global **TransformInterceptor** for standard envelope formatting, and **HttpExceptionFilter** for clean REST errors.
- Enforced stateless **JWT Passport Strategy** for route authentication.
- Built a custom **RbacGuard** paired with `@RequirePermission(moduleId, action)` route decoration to ensure APIs block unauthorized requests, even if frontend elements are hidden.
- Created `InMemoryStore` containing seeded static configurations and sample runtime data arrays.
- Stubbed out `ZohoService` containing `createZohoRecord`, `updateZohoRecord`, `fetchZohoRecords`, and `deleteZohoRecord` with TODO comments for future Zoho synchronization.

### 3. Premium Notification Module & Modern UI Redesign
- Created a complete **In-App & Email Notification system** from scratch, with triggers across all domains (Leads, Expenses, Approvals, Finance).
- Redesigned the **Sidebar navigation** with a premium dark gradient theme (`#0B1120 → #111827`), rounded pill navigation items, and glowing active border indicators.
- Added a **Frosted Glass Navbar** with an animated, type-based Notification bell dropdown (featuring icons 📅, 💸, ✅, 🚨, etc.), unread counters, and instant detail page navigation.
- **Apache ECharts Migration**: Fully replaced `recharts` with high-performance Apache ECharts across the Dashboard, Lead Reports, and Expense Reports. Features premium color palettes, interactive tooltip formatting, and clean gradient bar effects.

---

## 💎 Features Implemented

### 👤 Role-based Dashboards (5 Variants)
- **Admin:** Displays user stats, pipeline stage distribution charts, and category expense allocations.
- **Manager:** Focuses on pipeline funnel, pending approvals, and category expense charts.
- **Team Lead:** Tracks team pipelines, scheduled visits, and pending TL approvals.
- **Field Executive:** Tailored mobile-friendly overview showing today's followups, scheduled field visits, and reimbursed payouts.
- **Finance User:** Reviews approved claims totals, paid reimbursements, and category breakdowns.

### 🔔 Enterprise Notification Ecosystem
- **Multi-channel Dispatch:** Supports both in-app database-backed alerts and mock console email dispatches.
- **Background Scheduler:** Scans lead follow-ups every 5 minutes, triggering reminders 1 day before, 1 hour before, and when overdue.
- **Domain Integrations:** Instantly notifies supervisors on new expense claims, warns executives about status changes, alerts submitters upon approval/rejection/payment, and allows manual Targeted announcements by admins and managers.
- **Full Notifications Hub:** Displays a history list with priority sorting (Urgent, High, Medium, Low), module filters, mark-as-read, and quick delete controls.

### 📊 Apache ECharts Reporting Engine
- Migrated all chart elements to **Apache ECharts** for lightweight and clean rendering.
- Custom gradient fills on bar elements and rounded borders.
- Formatted hover tooltips with currency formatting (₹) and bold typography.
- Horizontal category charts and interactive legends.

### 📋 Lead Management Lifecycle
- **Create Lead:** Features client-side validation, duplicate mobile/email prevention.
- **List / Detail:** Allows filtering by status & source, assigning field executives, updating status, and adding remarks timeline logs. Supports generic project budget and project scale fields.

### 📍 Field Visits & Technical Surveys
- Schedules visits directly linked to active leads.
- Interactive visit view allows Field Executives to trigger HTML5 Geolocation to capture GPS latitude/longitude, mock photo attachment uploads (site attachment, document attachment, reference document), configure site area, and mark feasibility rating.

### 💵 Category-specific Expense Claims
- Field executives can submit reimbursement drafts or live claims.
- **Petrol Category:** Captures vehicle number, opening KM, closing KM, and pump name. Automatically calculates the total KM travelled and approximates recommended reimbursement amounts.
- **Bus Category:** Inputs locations, travel dates, and travel purposes.
- Attachment file picker allows snapping receipt photos.

### 🗳️ Multi-stage Expense Approvals & Role-based Limits
- Team Lead reviews and approves team member claims.
- Manager performs secondary approval/rejection.
- Reject buttons trigger an overlay modal prompting the supervisor to provide a rejection reason.
- **Role Limits Enforcement:** Automatically blocks submitting any expense if it pushes the user's weekly or monthly spent totals above their configured role-based reimbursement limit (e.g. weekly 5k, monthly 20k for Field Executive).

### 💰 Finance queue & Payment Disbursements
- Finance user views the verified queue.
- Includes actions to mark claims as Verified, reject claims, or update status to Paid.

### 📊 Excel/CSV/PDF Report Generation
- Comprehensive date-range, status, source, and executive-specific filters.
- Native Javascript CSV exporter downloads filtered lead pipelines or expense sheets.
- PDF printer document opens a formatted printing view, triggers browser printing options, and self-closes the tab automatically.

### 💬 WhatsApp Bot & Notifications
- Showcase layout added to the **Settings** module, listing instant sync for visits, expense filing via chats, and manager approval alerts on WhatsApp with a visible `Coming Soon` badge.

### 🛡️ Admin User & RBAC Management
- Admin can configure the global **Permissions Matrix** checking module boxes (Leads, Settings, Reports, etc.) vs actions (view, edit, delete, verify, approve, change_status).
- **Limits Configuration:** Admin can adjust the weekly and monthly reimbursement limits for each role within the Permissions Matrix edit panel.
- Create, edit, and toggle active status of user accounts.
- Map reporting hierarchies (Manager → Team Lead → Executive).
