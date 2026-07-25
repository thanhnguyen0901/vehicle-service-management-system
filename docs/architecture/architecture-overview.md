# VSMS Architecture Overview

Tai lieu nay mo ta kien truc tong quan cua project Vehicle Service Management System theo 3 lop chinh:

- Frontend: React/Vite.
- Backend: NestJS REST API.
- Database: PostgreSQL + Prisma ORM.

## 1. System Context Architecture Diagram

```mermaid
C4Context
    title VSMS - System Context Architecture

    Person(customer, "Customer", "Vehicle owner who books or receives garage service")
    Person(staff, "Garage Staff", "Admin, service advisor, technician, inventory clerk, cashier, manager")

    System_Boundary(vsmsBoundary, "Vehicle Service Management System") {
        System(vsms, "VSMS Web Application", "Manages customers, vehicles, appointments, work orders, inventory, invoices, payments, reports, and audit logs")
    }

    System_Ext(browser, "Web Browser", "Runs the frontend SPA")
    System_Ext(postgres, "PostgreSQL Database", "Stores operational and audit data")

    Rel(customer, staff, "Requests maintenance or repair service")
    Rel(staff, browser, "Uses")
    Rel(browser, vsms, "Uses VSMS features")
    Rel(vsms, postgres, "Reads and writes data")
```

## 2. Container Architecture Diagram

```mermaid
C4Container
    title VSMS - Container Architecture

    Person(staff, "Garage Staff", "Uses the system by role")

    System_Boundary(vsms, "Vehicle Service Management System") {
        Container(frontend, "Frontend SPA", "React 18, Vite, TypeScript, PrimeReact, Tailwind CSS", "Provides dashboard, forms, lists, role-based navigation, and business screens")
        Container(api, "Backend API", "NestJS, TypeScript", "Exposes REST API under /api/v1 and implements business rules")
        ContainerDb(database, "Database", "PostgreSQL", "Stores users, customers, vehicles, work orders, parts, invoices, payments, reports data, and audit logs")
        Container(adminer, "Adminer", "Docker container", "Optional local database administration UI")
    }

    Rel(staff, frontend, "Uses", "HTTPS/HTTP")
    Rel(frontend, api, "Calls REST API", "JSON over HTTP, cookies")
    Rel(api, database, "Reads/writes", "Prisma Client")
    Rel(adminer, database, "Inspects", "PostgreSQL connection")
```

## 3. Frontend Component Architecture Diagram

```mermaid
C4Component
    title VSMS - Frontend Component Architecture

    Container_Boundary(frontend, "Frontend SPA - apps/frontend") {
        Component(app, "App.tsx", "React Router", "Defines routes and redirects")
        Component(layout, "DashboardLayout", "React component", "Renders sidebar, role-filtered menu, logout, and page outlet")
        Component(protectedRoute, "ProtectedRoute", "React component", "Blocks unauthenticated access")
        Component(authState, "Auth State", "Redux Toolkit + Redux Saga", "Stores current user, authentication status, and auth side effects")
        Component(apiClient, "API Client", "Axios", "Central HTTP client with credentials and refresh-token retry")
        Component(featurePages, "Feature Pages", "React pages", "Customers, vehicles, appointments, work orders, services, parts, inventory, invoices, reports, audit logs")
        Component(uiKit, "UI Layer", "PrimeReact + Tailwind CSS", "Tables, forms, dialogs, buttons, and layout styling")
    }

    Container(api, "Backend API", "NestJS REST API", "Serves /api/v1 endpoints")

    Rel(app, protectedRoute, "Wraps dashboard routes")
    Rel(app, layout, "Renders authenticated shell")
    Rel(layout, featurePages, "Displays selected page")
    Rel(featurePages, uiKit, "Uses")
    Rel(featurePages, apiClient, "Calls feature APIs")
    Rel(authState, apiClient, "Performs login, refresh, logout, me")
    Rel(apiClient, api, "Sends REST requests", "JSON + cookies")
```

## 4. Backend Component Architecture Diagram

```mermaid
C4Component
    title VSMS - Backend Component Architecture

    Container_Boundary(api, "Backend API - apps/backend") {
        Component(main, "main.ts", "NestJS bootstrap", "Configures global prefix, CORS, security headers, filters, and validation")
        Component(appModule, "AppModule", "NestJS module", "Composes domain modules and global providers")
        Component(authLayer, "Auth and Authorization Layer", "JWT guard, roles guard, decorators", "Authenticates users and enforces role-based access control")
        Component(validation, "Validation and Error Handling", "ZodValidationPipe, GlobalExceptionFilter", "Validates DTOs and normalizes API errors")
        Component(audit, "AuditInterceptor", "NestJS interceptor", "Records important user operations")
        Component(controllers, "Controllers", "NestJS controllers", "Expose REST endpoints for each domain")
        Component(services, "Services", "NestJS providers", "Implement business rules and transactions")
        Component(prismaService, "PrismaService", "Prisma Client wrapper", "Provides type-safe database access")
    }

    ContainerDb(database, "PostgreSQL Database", "PostgreSQL", "Persistent relational storage")

    Rel(main, appModule, "Bootstraps")
    Rel(appModule, controllers, "Registers")
    Rel(controllers, authLayer, "Protected by")
    Rel(controllers, validation, "Validates requests")
    Rel(controllers, services, "Delegates business operations")
    Rel(services, audit, "Produces auditable operations")
    Rel(services, prismaService, "Queries and updates data")
    Rel(audit, prismaService, "Writes audit logs")
    Rel(prismaService, database, "Executes SQL via Prisma")
```

## 5. Backend Domain Module Architecture Diagram

```mermaid
C4Component
    title VSMS - Backend Domain Modules

    Container_Boundary(api, "NestJS Backend Modules") {
        Component(auth, "AuthModule", "Authentication", "Login, refresh token, logout, current user")
        Component(user, "UserModule", "User management", "Internal accounts and roles")
        Component(customer, "CustomerModule", "Customer management", "Customer profile CRUD")
        Component(vehicle, "VehicleModule", "Vehicle management", "Vehicles owned by customers")
        Component(appointment, "AppointmentModule", "Scheduling", "Service appointments")
        Component(workOrder, "WorkOrderModule", "Repair workflow", "Work orders, services, part usage, status updates")
        Component(serviceCatalog, "ServiceCatalogModule", "Service catalog", "Service list and prices")
        Component(inventory, "InventoryModule", "Parts and stock", "Parts, import, export, adjustment")
        Component(invoice, "InvoiceModule", "Billing", "Invoice creation and payments")
        Component(history, "MaintenanceHistoryModule", "History", "Completed service history")
        Component(reminder, "ReminderModule", "Maintenance reminders", "Due reminders and sent status")
        Component(report, "ReportModule", "Reporting", "Revenue, work orders, top services, top parts, low stock")
        Component(auditLog, "AuditLogModule", "Audit logs", "Search and view system activity")
        Component(prisma, "PrismaModule", "Data access", "Shared Prisma service")
    }

    Rel(customer, vehicle, "Customer owns vehicles")
    Rel(vehicle, appointment, "Vehicle can be scheduled")
    Rel(vehicle, workOrder, "Vehicle can have work orders")
    Rel(appointment, workOrder, "Appointment can become work order")
    Rel(serviceCatalog, workOrder, "Services are selected in work orders")
    Rel(inventory, workOrder, "Parts are consumed by work orders")
    Rel(workOrder, invoice, "Completed work order is billed")
    Rel(invoice, history, "Paid/delivered work contributes to history")
    Rel(customer, reminder, "Customer receives reminders")
    Rel(report, workOrder, "Aggregates operational data")
    Rel(report, invoice, "Aggregates revenue data")
    Rel(auditLog, prisma, "Reads audit data")
    Rel(auth, user, "Authenticates user accounts")
```

## 6. Business Process Diagram

```mermaid
flowchart LR
    Customer["Customer"]
    Advisor["Service Advisor"]
    Technician["Technician"]
    Inventory["Inventory Clerk"]
    Cashier["Cashier"]
    Manager["Manager"]

    Customer -->|"Brings vehicle / books service"| Advisor
    Advisor --> C1["Create Customer"]
    C1 --> V1["Create Vehicle"]
    V1 --> A1{"Booked before?"}
    A1 -->|"Yes"| AP["Create Appointment"]
    A1 -->|"No"| WO["Create Work Order"]
    AP --> WO
    WO --> SVC["Add Services"]
    SVC --> TECH["Diagnose / Repair"]
    Technician --> TECH
    TECH --> PART{"Need parts?"}
    PART -->|"Yes"| USE["Add Part Usage"]
    Inventory --> USE
    USE --> STOCK["Decrease Stock<br/>Create Inventory Transaction"]
    PART -->|"No"| STATUS["Update Work Order Status"]
    STOCK --> STATUS
    STATUS --> READY["Ready for Delivery"]
    READY --> INV["Create Invoice"]
    Cashier --> INV
    INV --> PAY["Record Payment"]
    PAY --> HIST["Maintenance History"]
    HIST --> RPT["Reports + Audit Logs"]
    Manager --> RPT
```

## 7. Database ERD Diagram

```mermaid
erDiagram
    USER_ACCOUNTS ||--o{ AUDIT_LOGS : writes

    CUSTOMERS ||--o{ VEHICLES : owns
    CUSTOMERS ||--o{ MAINTENANCE_REMINDERS : receives

    VEHICLES ||--o{ APPOINTMENTS : has
    VEHICLES ||--o{ WORK_ORDERS : has
    VEHICLES ||--o{ MAINTENANCE_REMINDERS : has

    APPOINTMENTS ||--o| WORK_ORDERS : creates

    WORK_ORDERS ||--o{ WORK_ORDER_ITEMS : contains
    WORK_ORDERS ||--o| INVOICES : billed_by

    SERVICES ||--o{ WORK_ORDER_ITEMS : selected_in

    WORK_ORDER_ITEMS ||--o{ PART_USAGES : uses
    PARTS ||--o{ PART_USAGES : consumed_by
    PARTS ||--o{ INVENTORY_TRANSACTIONS : tracked_by

    INVOICES ||--o{ INVOICE_LINES : contains
    INVOICES ||--o{ PAYMENTS : paid_by

    USER_ACCOUNTS {
        uuid id PK
        string username
        string password_hash
        string full_name
        enum role
        boolean is_active
    }

    CUSTOMERS {
        uuid id PK
        string full_name
        string phone
        string email
        enum type
    }

    VEHICLES {
        uuid id PK
        uuid customer_id FK
        string license_plate
        string make
        string model
        int year
        int mileage
    }

    APPOINTMENTS {
        uuid id PK
        uuid vehicle_id FK
        datetime scheduled_at
        enum status
    }

    WORK_ORDERS {
        uuid id PK
        uuid vehicle_id FK
        uuid appointment_id FK
        enum status
        string diagnosis
    }

    SERVICES {
        uuid id PK
        string name
        decimal unit_price
        boolean is_active
    }

    PARTS {
        uuid id PK
        string part_number
        string name
        decimal unit_cost
        decimal unit_price
        int stock_quantity
        int reorder_level
    }

    WORK_ORDER_ITEMS {
        uuid id PK
        uuid work_order_id FK
        uuid service_id FK
        string description
        int quantity
        decimal amount
    }

    PART_USAGES {
        uuid id PK
        uuid work_order_item_id FK
        uuid part_id FK
        int quantity
        decimal unit_price
    }

    INVENTORY_TRANSACTIONS {
        uuid id PK
        uuid part_id FK
        enum type
        int quantity_delta
        uuid reference_id
    }

    INVOICES {
        uuid id PK
        uuid work_order_id FK
        enum status
        decimal total_amount
        datetime issued_at
        datetime paid_at
    }

    INVOICE_LINES {
        uuid id PK
        uuid invoice_id FK
        string description
        int quantity
        decimal amount
    }

    PAYMENTS {
        uuid id PK
        uuid invoice_id FK
        decimal amount
        enum method
        datetime paid_at
    }

    MAINTENANCE_REMINDERS {
        uuid id PK
        uuid customer_id FK
        uuid vehicle_id FK
        string message
        date due_date
        boolean is_sent
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string entity
        uuid entity_id
        json before
        json after
    }
```

## 8. Request Sequence Diagram

```mermaid
sequenceDiagram
    actor Staff as Staff/User
    participant FE as React Frontend
    participant API as Axios Client
    participant BE as NestJS Backend
    participant Guard as JWT + Roles Guard
    participant Service as Domain Service
    participant Prisma as Prisma Client
    participant DB as PostgreSQL

    Staff->>FE: Click action / submit form
    FE->>API: Call feature API
    API->>BE: HTTP request to /api/v1/*
    BE->>Guard: Validate JWT and role
    Guard-->>BE: Allow request
    BE->>Service: Execute business logic
    Service->>Prisma: Query or transaction
    Prisma->>DB: SQL
    DB-->>Prisma: Result
    Prisma-->>Service: Data
    Service-->>BE: DTO/response
    BE-->>API: JSON response
    API-->>FE: Data or error
    FE-->>Staff: Update UI
```

## 9. Technology Stack Summary

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React 18, Vite, TypeScript | Single Page Application |
| UI | PrimeReact, PrimeIcons, Tailwind CSS | UI components and styling |
| Routing | React Router | Page navigation and protected routes |
| State | Redux Toolkit, Redux Saga | Authentication state and auth side effects |
| HTTP | Axios | Calls backend REST API |
| Backend | NestJS, TypeScript | REST API and business logic |
| Validation | Zod validation pipe | Validate request DTOs |
| Auth | JWT, refresh token, bcrypt | Login, refresh, logout, protected API |
| Authorization | RolesGuard | Role-based access control |
| ORM | Prisma Client | Type-safe database access |
| Database | PostgreSQL | Persistent relational data |
| Local infra | Docker Compose | PostgreSQL and Adminer for development |

## 10. Main API Areas

All backend routes use global prefix:

```text
/api/v1
```

Main API groups:

| API group | Backend module | Frontend feature |
| --- | --- | --- |
| `/auth` | AuthModule | `features/auth` |
| `/users` | UserModule | `features/users` |
| `/customers` | CustomerModule | `features/customers` |
| `/vehicles` | VehicleModule | `features/vehicles` |
| `/appointments` | AppointmentModule | `features/appointments` |
| `/work-orders` | WorkOrderModule | `features/work-orders` |
| `/services` | ServiceCatalogModule | `features/services` |
| `/parts` | InventoryModule | `features/parts` |
| `/inventory` | InventoryModule | `features/inventory` |
| `/invoices` | InvoiceModule | `features/invoices` |
| `/maintenance-history` | MaintenanceHistoryModule | `features/maintenance-history` |
| `/reminders` | ReminderModule | `features/reminders` |
| `/reports` | ReportModule | `features/reports` |
| `/audit-logs` | AuditLogModule | `features/audit-logs` |

## 11. Deployment Architecture Diagram

```mermaid
flowchart LR
    Dev["Developer Machine"]

    subgraph Runtime["Local Runtime"]
        FEDev["Vite Dev Server<br/>localhost:5173"]
        BEDev["NestJS Dev Server<br/>localhost:3000"]
        PG["PostgreSQL Container<br/>localhost:5434"]
        Adminer["Adminer Container<br/>localhost:8080"]
    end

    Dev --> FEDev
    Dev --> BEDev
    BEDev --> PG
    Dev --> Adminer
    Adminer --> PG
```
