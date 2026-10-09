# Kiln & Leaf Ops — Task Management System

> **Node.js Developer Intern Assignment Submission**  
> A production-ready, full-stack Task Management System engineered with **Node.js**, **Express**, **TypeScript (Strict Mode)**, **PostgreSQL (Neon)**, **Prisma ORM**, and a **React 19 + Vite** operational frontend.

---

## 1. Live Demo & Deployment URLs

The application is deployed to **Vercel** with a serverless Express REST API and a hosted PostgreSQL database on **Neon**:

| Component | Production URL | Description |
|---|---|---|
| **Frontend UI** | [https://klin-and-leaf-ops-operation.vercel.app/](https://klin-and-leaf-ops-operation.vercel.app/) | Single Page Application (React 19 + Vite, deployed from `client/`) |
| **Backend API Base** | [https://klin-and-leaf-manage.vercel.app/api](https://klin-and-leaf-manage.vercel.app/api) | Express REST API serverless endpoints (deployed from repository root) |
| **API Healthcheck** | [https://klin-and-leaf-manage.vercel.app/api/health](https://klin-and-leaf-manage.vercel.app/api/health) | Live DB connectivity verification (`SELECT 1` on Neon PostgreSQL) |

---

## 2. Screenshots

The user interface follows the **Kiln & Leaf** editorial design aesthetic, featuring warm paper palettes, Fraunces serif headings, accessible status badges, and responsive controls.

### Sign In Page
![Sign In Page](docs/screenshots/login.png)
*Figure 1: Authentication screen featuring one-click demo credential filling, eye-toggle password visibility, required indicators, and session recovery.*

---

### Task Management Page
![Task Management Page](docs/screenshots/task-management.png)
*Figure 2: Operator task queue with debounced search, status pill filtering (`All`, `Pending`, `In Progress`, `Testing`, `Completed`), owner badges, and pagination.*

---

### Administrative Operations Dashboard
![Administrative Operations Dashboard](docs/screenshots/admin-console.png)
*Figure 3: Admin console showcasing real-time operational KPI counters, CSS proportion distribution bars, and an all-tasks lifecycle table with inline status modifications.*

---

## 3. Features

### Core Backend Capabilities
- **RESTful API**: Standardized JSON envelopes with uniform error structures `{ "error": { "code", "message", "details"? } }`.
- **JWT Authentication**: HS256 algorithm enforcement, payload isolation (`sub`), and 8-hour token lifetime.
- **Strict Role-Based Access Control (RBAC)**:
  - Database role lookup on **every** request — tokens never self-assert role claims.
  - Regular users manage only their own tasks (`userId` extracted directly from JWT).
  - Admin users possess elevated permissions to view all tasks, filter by operator, and transition task statuses.
- **Information Leakage Prevention**: Cross-user resource requests return `404 Not Found` rather than `403 Forbidden`, preventing resource ID enumeration.
- **Dedicated Lifecycle Transitions**: Task creation forces `Pending` status. Task updates via `PUT /api/tasks/:id` explicitly forbid `status` modification; status changes must flow through admin-only `PATCH /api/tasks/:id/status`.
- **Timing Leak Defense**: Constant-time dummy bcrypt comparisons for unregistered emails prevent timing-based user enumeration.
- **Security Hardening**: Helmet security headers, CORS restricted to trusted origins, and IP rate limiting on authentication routes.

### Frontend UI ("Kiln & Leaf Ops")
- **Authentication**: Login & Register flows with client-side validation, password visibility toggle, dynamic requirement checklist, and demo quick-fill buttons.
- **Task Management**: URL-synced filters (`?status=&q=&page=`), accessible status tags, task creation, detailed view, and owner inspection.
- **Admin Console**: Live metric counters (total tasks, active operators, status breakdown), operator filters, and inline task status dropdowns.
- **Route Protection**: `RequireAuth` and `RequireAdmin` wrappers with seamless redirect and 403 Forbidden states.

---

## 4. Technology Stack

- **Runtime & Language**: Node.js (`v20.x` / `v24.x`), TypeScript 5.7 (Strict Mode)
- **Backend Framework**: Express.js 4.21
- **Database**: PostgreSQL 16 (Hosted on [Neon](https://neon.tech) in production; Docker Compose locally)
- **ORM**: Prisma ORM 6.4 with Prisma Migrate
- **Authentication**: `jsonwebtoken` (HS256), `bcryptjs` (cross-platform pure JS)
- **Validation**: Zod 3.24 (strict schemas on requests and environment)
- **Security & Utilities**: `helmet`, `cors`, `express-rate-limit`, `dotenv`
- **Optional 2FA**: `nodemailer` (Admin Console OTP)
- **Frontend Framework**: React 19, Vite 8, React Router 7, Tailwind CSS v4
- **Testing & Verification**: Vitest 3.2, Supertest 7.0, Newman (Postman CLI Runner)
- **Hosting & Infrastructure**: Vercel (Serverless API + Vite SPA)

---

## 5. Architecture & Project Structure

The project uses a clean modular structure with the API at the repository root and the UI inside `client/`:

```text
Kanishka-Node/
├── api/                        # Vercel serverless entry point
│   └── index.ts                # Exports Express createApp() instance
├── client/                     # Frontend Single Page Application (React 19 + Vite)
│   ├── src/
│   │   ├── components/         # Common, layout, task, and feedback components
│   │   ├── context/            # AuthContext (state, token storage, login/logout)
│   │   ├── lib/                # api.ts (HTTP client, 401 interception, error mapping)
│   │   └── pages/              # Login, Register, TaskList, TaskDetail, AdminDashboard
│   ├── package.json            # Client dependencies and build scripts
│   ├── vercel.json             # Client SPA routing rewrite rules
│   └── .env.example            # Client environment template
├── docs/                       # Project documentation assets
│   └── screenshots/            # Verified application screenshots
│       ├── login.png
│       ├── task-management.png
│       └── admin-console.png
├── docker-compose.yml          # Local PostgreSQL 16 container definition
├── postman/                    # Postman Collection & Local Environment
│   ├── Kanishka_Ops.postman_collection.json
│   └── Local.postman_environment.json
├── prisma/                     # Database schema, migrations, and seeder
│   ├── schema.prisma           # Prisma data models & enums
│   ├── seed.ts                 # Idempotent TypeScript database seeder
│   └── migrations/             # Tool-generated migration files
│       ├── 20261009085423_init/
│       └── 20261009091910_add_admin_otp/
├── src/                        # Core Express TypeScript API
│   ├── app.ts                  # Express application factory
│   ├── server.ts               # Local HTTP listener with graceful shutdown
│   ├── config/env.ts           # Fail-fast Zod environment schema
│   ├── lib/                    # prisma, jwt, password, errors, status mappings
│   ├── middleware/             # authenticate, requireRole, validate, rateLimit, errorHandler
│   └── modules/
│       ├── auth/               # Register, login, me routes, controller, schemas
│       ├── tasks/              # Task CRUD, status PATCH routes, controller, schemas
│       └── admin/              # Admin stats, users list, OTP service
├── tests/                      # Integration test suites (Vitest + Supertest)
│   ├── auth.test.ts            # Authentication & security test cases
│   ├── tasks.test.ts           # RBAC authorization matrix tests
│   ├── admin.test.ts           # Admin metrics & directory tests
│   ├── otp.test.ts             # Admin OTP workflow tests
│   └── status.test.ts          # Status enum bidirectional mapping unit tests
├── vercel.json                 # Backend serverless rewrite configuration
├── package.json                # Root scripts and dependencies
├── tsconfig.json               # Backend TypeScript configuration
├── .env.example                # Root environment template
└── README.md                   # Complete documentation
```

---

## 6. Authentication & Authorization

### Security Architecture
1. **Database-Backed Identity**: The `authenticate` middleware extracts the JWT from the `Authorization: Bearer <token>` header, verifies the signature, and queries PostgreSQL for the current user record. If the user was deleted or their role modified, access is revoked immediately.
2. **Role Verification**: `requireRole(...roles)` validates `req.user.role`. Accessing an admin route as a standard user triggers `403 Forbidden`.
3. **Owner Isolation**: When a regular user queries `GET /api/tasks/:id` or `PUT /api/tasks/:id`, the query checks `userId === req.user.id`. If the task belongs to another user, the server returns `404 Not Found` (concealing the task's existence).
4. **Dedicated Status Route**: Task status transitions are strictly separated from title/description edits:
   - `PUT /api/tasks/:id`: Editable by task owners and admins. Rejects any body containing `status` with `400 Bad Request`.
   - `PATCH /api/tasks/:id/status`: Restricted strictly to `admin` role via `requireRole("admin")`.

### Authorization Matrix

| Actor | Endpoint / Action | Expected Result | Reason |
|---|---|---|---|
| **Anonymous** | Any `/api/tasks*` or `/api/admin*` | `401 Unauthorized` | Missing Bearer token |
| **Regular User** | `GET /api/tasks` | `200 OK` (Own tasks only) | Scoped by authenticated user ID |
| **Regular User** | `POST /api/tasks` | `201 Created` | Created with forced `Pending` status |
| **Regular User** | `GET /api/tasks/:id` (own task) | `200 OK` | User is task owner |
| **Regular User** | `GET /api/tasks/:id` (other user's task) | `404 Not Found` | Conceals task existence |
| **Regular User** | `PUT /api/tasks/:id` (own task) | `200 OK` | Updates title / description |
| **Regular User** | `PUT /api/tasks/:id` with `status` in body | `400 Bad Request` | Status immutable via PUT |
| **Regular User** | `PATCH /api/tasks/:id/status` | `403 Forbidden` | Admin-only operation |
| **Regular User** | Any `/api/admin/*` route | `403 Forbidden` | Role check fails |
| **Regular User** | `POST /api/auth/register` with `role: "admin"` | `201 Created` (`role: "user"`) | Role escalation attempt ignored |
| **Admin** | `GET /api/tasks` | `200 OK` (All tasks) | Includes owner details |
| **Admin** | `GET /api/tasks/:id` (any task) | `200 OK` | Full visibility |
| **Admin** | `PUT /api/tasks/:id` (any task) | `200 OK` | Admin oversight |
| **Admin** | `PATCH /api/tasks/:id/status` | `200 OK` | Authorized lifecycle update |
| **Admin** | `GET /api/admin/stats` & `GET /api/admin/users` | `200 OK` | Authorized management data |
| **Any** | Tampered / expired / deleted user token | `401 Unauthorized` | Invalid authentication signature |

---

## 7. API Endpoints Reference

All API routes are served under the `/api` prefix and return standard JSON.

### 1. System Health
- **`GET /api/health`**
  - **Auth**: None
  - **Description**: Verifies API availability and executes `SELECT 1` on PostgreSQL.
  - **Response `200`**:
    ```json
    { "status": "ok", "database": "connected", "timestamp": "2026-10-09T11:11:08.760Z" }
    ```

### 2. Authentication
- **`POST /api/auth/register`**
  - **Auth**: None (Rate limited)
  - **Body**: `{ "name": "string", "email": "string", "password": "string" }`
  - **Description**: Creates a new user account. Role is strictly forced to `user`.
  - **Response `201`**:
    ```json
    {
      "user": {
        "id": 4,
        "name": "Kanishka Sharma",
        "email": "kanishka@kilnandleaf.com",
        "role": "user",
        "createdAt": "2026-10-09T09:00:00.000Z",
        "updatedAt": "2026-10-09T09:00:00.000Z"
      }
    }
    ```
- **`POST /api/auth/login`**
  - **Auth**: None (Rate limited)
  - **Body**: `{ "email": "string", "password": "string" }`
  - **Description**: Verifies credentials and returns an HS256 JWT. Returns uniform 401 message for unknown email and incorrect password.
  - **Response `200`**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": 1,
        "name": "Operations Admin",
        "email": "admin@example.com",
        "role": "admin"
      }
    }
    ```
- **`GET /api/auth/me`**
  - **Auth**: Bearer Token
  - **Description**: Returns the current user profile from the database.
  - **Response `200`**: `{ "user": { ... } }`

### 3. Task Management
- **`GET /api/tasks`**
  - **Auth**: Bearer Token
  - **Query Params**:
    - `page` (integer, default `1`)
    - `limit` (integer, default `10`, max `50`)
    - `status` (`Pending` | `In Progress` | `Testing` | `Completed`)
    - `q` (case-insensitive search on title and description)
    - `userId` (admin only filter by owner ID)
  - **Description**: Regular users receive only their own tasks; admins receive all tasks with owner details.
  - **Response `200`**:
    ```json
    {
      "data": [
        {
          "id": 1,
          "userId": 2,
          "title": "Roast batch ET-014",
          "description": "14 min Ethiopian natural roast profile",
          "status": "In Progress",
          "createdAt": "2026-10-09T08:54:23.000Z",
          "updatedAt": "2026-10-09T08:54:23.000Z",
          "user": { "id": 2, "name": "Divyajeet Roaster", "email": "user@example.com" }
        }
      ],
      "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
    }
    ```
- **`POST /api/tasks`**
  - **Auth**: Bearer Token
  - **Body**: `{ "title": "string", "description"?: "string" }`
  - **Description**: Creates a new task. Status is initialized strictly to `"Pending"`.
  - **Response `201`**: `{ "task": { ... } }`
- **`GET /api/tasks/:id`**
  - **Auth**: Bearer Token
  - **Description**: Retrieves task details for the owner or an admin. Returns `404` for unauthorized users.
  - **Response `200`**: `{ "task": { ... } }`
- **`PUT /api/tasks/:id`**
  - **Auth**: Bearer Token
  - **Body**: `{ "title"?: "string", "description"?: "string" }` (at least one required)
  - **Description**: Updates title or description. Passing `status` yields `400 Bad Request`.
  - **Response `200`**: `{ "task": { ... } }`
- **`PATCH /api/tasks/:id/status`**
  - **Auth**: Bearer Token (**Admin Only**)
  - **Body**: `{ "status": "Pending" | "In Progress" | "Testing" | "Completed" }`
  - **Description**: Transitions task status. Non-admin users receive `403 Forbidden`.
  - **Response `200`**: `{ "task": { ... } }`

### 4. Admin Operations
- **`GET /api/admin/stats`**
  - **Auth**: Bearer Token (**Admin Only**)
  - **Description**: Summarizes system-wide task counts and status distributions.
  - **Response `200`**:
    ```json
    {
      "totals": { "users": 4, "tasks": 8 },
      "byStatus": {
        "Pending": 2,
        "In Progress": 3,
        "Testing": 1,
        "Completed": 2
      }
    }
    ```
- **`GET /api/admin/users`**
  - **Auth**: Bearer Token (**Admin Only**)
  - **Description**: Lists registered users along with their active task counts.
  - **Response `200`**:
    ```json
    {
      "users": [
        {
          "id": 1,
          "name": "Operations Admin",
          "email": "admin@example.com",
          "role": "admin",
          "taskCount": 2,
          "createdAt": "2026-10-09T08:54:23.000Z",
          "updatedAt": "2026-10-09T08:54:23.000Z"
        }
      ]
    }
    ```

---

## 8. Database Schema & Relationships

The database schema is defined in [prisma/schema.prisma](file:///c:/Users/Jeet/Projects/Kanishka-Node/prisma/schema.prisma) and mapped to snake_case tables in PostgreSQL:

```prisma
enum Role {
  user
  admin
}

enum TaskStatus {
  Pending
  InProgress @map("In Progress")
  Testing
  Completed
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(user)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  tasks     Task[]
  adminOtps AdminOtp[]

  @@map("users")
}

model Task {
  id          Int        @id @default(autoincrement())
  userId      Int        @map("user_id")
  title       String
  description String?
  status      TaskStatus @default(Pending)
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("tasks")
}

model AdminOtp {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  codeHash  String   @map("code_hash")
  attempts  Int      @default(0)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@map("admin_otps")
}
```

### Schema Characteristics
- **Table Naming**: Tables are explicitly mapped to plural lowercase snake_case (`users`, `tasks`, `admin_otps`).
- **Cascade Deletion**: Deleting a `User` cascades to delete their associated tasks and OTP challenge records.
- **Indexes**: Composite indexes on `tasks(user_id)` and `tasks(status)` optimize user filtering and administrative status aggregations.
- **Status Value Mapping**: The Prisma enum maps `InProgress` to `"In Progress"` in SQL, while the application layer guarantees clean JSON serialization.

---

## 9. Local Installation & Setup

### Prerequisites
- **Node.js**: `v20.x` or `v24.x` (verified on `v24.14.1`)
- **Docker Desktop**: For running PostgreSQL 16 locally
- **npm**: `v10.x` or `v11.x`

### Quick Start (Local Setup)

```bash
# 1. Start the PostgreSQL 16 container
docker compose up -d

# 2. Configure environment variables
cp .env.example .env

# 3. Install backend dependencies
npm install

# 4. Deploy database migrations
npm run db:migrate

# 5. Seed test accounts and sample tasks
npm run db:seed

# 6. Start the API development server
npm run dev
```

The API will boot at `http://localhost:4000/api`.

### Running the Frontend Client

In a separate terminal window:

```bash
# Navigate to the client directory
cd client

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## 10. Database Migrations & Seed Data

### Migrations
All database migrations are generated and managed via **Prisma Migrate**. The migration history is version-controlled in `prisma/migrations/`:
- `20261009085423_init`: Initial schema containing `users` and `tasks` tables, enums, indexes, and foreign keys.
- `20261009091910_add_admin_otp`: Adds the `admin_otps` table for optional console 2FA challenge tokens.

To apply migrations on any environment:
```bash
npm run db:migrate         # Runs: prisma migrate deploy
```

### Seed Data
The database seeder ([prisma/seed.ts](file:///c:/Users/Jeet/Projects/Kanishka-Node/prisma/seed.ts)) is completely **idempotent**:
- Uses `prisma.user.upsert` keyed by unique email addresses.
- Verifies existing tasks prior to insertion to prevent duplicate records upon re-execution.
- Refuses to run in `production` unless `ALLOW_SEED=true` is explicitly provided.

Execute seeding:
```bash
npm run db:seed            # Runs: tsx prisma/seed.ts
```

---

## 11. Environment Variables

### Local Development (`.env`)

| Variable | Description | Default / Example | Required |
|---|---|---|---|
| `PORT` | Local Express HTTP port | `4000` | No |
| `NODE_ENV` | Application environment | `development` | No |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/kanishka_ops?schema=public` | **Yes** |
| `JWT_SECRET` | Secret key for signing HS256 tokens (min 32 chars) | Random 32+ char hex string | **Yes** |
| `JWT_EXPIRES_IN` | Token validity duration | `8h` | No |
| `BCRYPT_ROUNDS` | Cost factor for password hashing | `10` | No |
| `CLIENT_ORIGIN` | Allowed CORS origin | `http://localhost:5173` | No |
| `RATE_LIMIT_ENABLED` | Toggle IP-based rate limiting | `true` | No |
| `AUTH_RATE_LIMIT_MAX`| Max requests per 15-minute window | `30` | No |
| `ADMIN_OTP_ENABLED` | Enable optional 2FA OTP for admin console | `false` | No |
| `OTP_DELIVERY` | OTP transport mechanism (`console` or `smtp`) | `console` | No |

### Frontend Client (`client/.env`)

| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_URL` | Backend API base endpoint | `http://localhost:4000/api` |
| `VITE_SHOW_DEMO_LOGINS` | Display one-click demo login buttons | `true` |

---

## 12. Production Deployment on Vercel & Neon

The application is deployed across two Vercel services pointing to a shared serverless PostgreSQL database on **Neon**:

### 1. Backend Service (Root Repository)
- **Deployment Source**: Repository root (`./`)
- **Serverless Adapter**: [`api/index.ts`](file:///c:/Users/Jeet/Projects/Kanishka-Node/api/index.ts) exports the Express application factory.
- **Routing**: Root [`vercel.json`](file:///c:/Users/Jeet/Projects/Kanishka-Node/vercel.json) rewrites all `/api/(.*)` requests to the serverless function handler.
- **Engine Compilation**: Root `package.json` includes `"postinstall": "prisma generate"`, ensuring the Prisma client binary is generated during the Vercel build step.
- **Vercel Production Environment Variables**:
  ```env
  DATABASE_URL="postgresql://neondb_owner:***@ep-***.region.neon.tech/neondb?sslmode=require"
  JWT_SECRET="<secure-random-32-char-secret>"
  CLIENT_ORIGIN="https://klin-and-leaf-ops-operation.vercel.app"
  NODE_ENV="production"
  ADMIN_OTP_ENABLED="false"
  RATE_LIMIT_ENABLED="true"
  AUTH_RATE_LIMIT_MAX="60"
  ```

### 2. Frontend Service (`client/` Directory)
- **Deployment Source**: `client/` subdirectory
- **Framework Preset**: Vite
- **Routing**: [`client/vercel.json`](file:///c:/Users/Jeet/Projects/Kanishka-Node/client/vercel.json) routes all requests to `/index.html` for HTML5 SPA routing.
- **Vercel Production Environment Variables**:
  ```env
  VITE_API_URL="https://klin-and-leaf-manage.vercel.app/api"
  VITE_SHOW_DEMO_LOGINS="true"
  ```

### Database Migration on Neon
Because Vercel executes serverless functions in ephemeral containers, migrations against Neon are executed locally using the Neon connection string:
```bash
# Point to your Neon PostgreSQL instance
DATABASE_URL="postgresql://user:pass@ep-***.neon.tech/neondb?sslmode=require" npm run db:migrate
DATABASE_URL="postgresql://user:pass@ep-***.neon.tech/neondb?sslmode=require" npm run db:seed
```

---

## 13. Admin OTP: Implementation & Current Limitations

### Feature Status: Optional & Disabled in Production
The codebase includes an optional **Two-Factor Authentication (OTP)** security layer designed to protect administrative console routes. 

> **Important Disclosure**: Production OTP email delivery via external SMTP servers has **not** been validated in live production. Consequently, **Admin OTP is disabled by default (`ADMIN_OTP_ENABLED=false`)** in the Vercel production deployment. The standard password-based JWT authentication (`POST /api/auth/login`) is the fully supported, production-tested authentication path.

### Implementation Details
- **Architecture**:
  - `GET /api/admin/config`: Returns `{ otpRequired: boolean }` based on `ADMIN_OTP_ENABLED`.
  - `POST /api/admin/otp/request`: Generates a cryptographically random 6-digit code, hashes it with bcrypt, saves it to PostgreSQL with a 5-minute expiry, and dispatches it via Nodemailer (or prints to server logs when `OTP_DELIVERY=console`).
  - `POST /api/admin/otp/verify`: Validates the code (max 5 attempts) and issues a short-lived (30-minute) JWT console token (`scope: "admin-console"`).
  - Middleware: `requireConsoleToken` validates the scoped token before granting access to administrative management routes when OTP is enabled.
- **Automated Test Coverage**:
  - The OTP workflow is verified by integration tests in `tests/otp.test.ts` (4/4 tests passing), testing code generation, invalid attempt tracking, and scoped token issuance.
- **How to Test Locally**:
  To test the OTP flow in local development:
  1. Set `ADMIN_OTP_ENABLED=true` and `OTP_DELIVERY=console` in `.env`.
  2. Sign in as Admin; navigating to `/admin` will prompt for a 6-digit verification code.
  3. Inspect the terminal server output to find the logged OTP code:
     ```text
     🔑 [ADMIN CONSOLE OTP] Verification code for admin@example.com: 123456
     ```
  4. Submit the code to obtain console access.

---

## 14. API Testing with Postman & Newman

The API is covered by an automated **Postman Collection v2.1** test suite located in `postman/Kanishka_Ops.postman_collection.json` and executed using **Newman**.

### Test Suite Execution
To run the automated Postman test suite against the live API:

```bash
# Ensure API server is running (npm run dev)
npm run postman
```

### Newman Results (Verified 0 Failures)
```text
┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │               30 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│            test-scripts │               30 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│      prerequest-scripts │                2 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │               60 │                0 │
├─────────────────────────┴──────────────────┴──────────────────┤
│ total run duration: 3.1s                                      │
├───────────────────────────────────────────────────────────────┤
│ total data received: 9.7kB (approx)                           │
├───────────────────────────────────────────────────────────────┤
│ average response time: 19ms [min: 2ms, max: 97ms, s.d.: 25ms] │
└───────────────────────────────────────────────────────────────┘
```

### Covered Test Folders
1. **00 Health**: Database-checked healthcheck.
2. **01 Auth**: User registration with unique timestamped email, login for user, login for admin, login for user 2, and current user profile inspection.
3. **02 Regular User**: Task creation (forcing `Pending`), viewing own tasks, editing own task, and verifying that regular users receive `403 Forbidden` when attempting to update status.
4. **03 Admin**: Viewing all tasks across the system, viewing owner information, updating any task, transitioning status to `In Progress` and `Completed`, and fetching operational statistics.
5. **04 Authorization Negatives**: Anonymous requests rejected (`401`), cross-user task access rejected with `404 Not Found` (concealing existence), status in PUT rejected (`400`), registration role escalation prevented, user access to admin routes rejected (`403`), and tampered JWT rejection.
6. **05 Validation Negatives**: Invalid email formats, weak passwords, empty task titles, invalid status enum values, and non-numeric route parameters rejected (`400 VALIDATION_ERROR`).

---

## 15. Seed Test Credentials

The database seeder initializes the following accounts:

| Role | Name | Email | Password | Access Capabilities |
|---|---|---|---|---|
| **Admin** | Operations Admin | `admin@example.com` | `Admin@123` | Full visibility, view all tasks, transition task statuses, access admin dashboard |
| **Regular User** | Divyajeet Roaster | `user@example.com` | `User@123` | Manage own tasks, create tasks, edit own titles/descriptions |
| **User 2** | Kanishka Cupper | `user2@example.com` | `User@1234` | Second regular user used to verify cross-user isolation and `404` existence hiding |

---

## 16. Assumptions & Implementation Decisions

1. **Role Authority**: User roles are **never** trusted from JWT payload claims. The `authenticate` middleware loads the user record from PostgreSQL on every request. If an account is demoted or deleted, access changes take effect immediately.
2. **Admin Visibility & Oversight**: Administrators possess full operational visibility across all tasks created by all staff members. Tasks created by an administrator belong to that administrator's account.
3. **Task Status Lifecycle**: On creation (`POST /api/tasks`), status is strictly initialized to `"Pending"`. Clients cannot specify initial status during creation.
4. **Dedicated Status Modification Route**: Status transitions must occur through `PATCH /api/tasks/:id/status`, which is locked to administrators. Attempts to pass `status` to `PUT /api/tasks/:id` are rejected with `400 Bad Request`.
5. **Information Leakage Prevention**: When a regular user attempts to access or modify a task belonging to another user, the API responds with `404 Not Found` rather than `403 Forbidden`. This prevents attackers from probing which task IDs exist.
6. **No DELETE Endpoint**: The take-home specification did not define a task deletion endpoint, focusing instead on task lifecycle transitions. Consequently, deletion is omitted to preserve task audit history.
7. **Token Storage**: Short/medium-lived JWTs (default 8 hours) signed via HMAC SHA-256 (`HS256`). For this intern assessment demo, tokens are held in client `localStorage` with error interceptors that clear storage and redirect to login upon 401. In an enterprise banking deployment, `httpOnly`, `SameSite=Strict`, `Secure` cookies with refresh token rotation would be preferred.
8. **Tool-Generated Migrations**: `prisma/migrations/*/migration.sql` files are tool-generated by Prisma Migrate, guaranteeing schema consistency and reproducible migrations rather than unversioned raw SQL scripts.
9. **Password Validation**: Passwords must be between 8 and 72 characters (bcrypt ceiling) and include uppercase, lowercase, number, and special character requirements.
10. **Email Normalization**: Emails are trimmed, lowercased, and enforced unique.
11. **Design System Reuse**: The React client reuses the artisanal aesthetic (Fraunces typography, warm paper tones, accessible contrast ratios) from the candidate's prior React showcase, adapted into "Kiln & Leaf Ops".

---

## 17. AI Assistance Disclosure

AI tooling was utilized during development to assist with boilerplate scaffolding, rapid test case generation, and documentation drafting. All architectural decisions, security boundaries, Prisma relational schema designs, and authorization matrix tests were authored, verified, and audited by the candidate.

---

## 18. Troubleshooting Guide

- **Docker daemon is not running**: Ensure Docker Desktop is started (`Get-Process *docker*`).
- **Port 5432 already in use**: If a local Postgres service is already running on port 5432, you can either stop the local service or change the Docker host port mapping in `docker-compose.yml` to `5433:5432` and update `DATABASE_URL` accordingly.
- **Port 4000 already in use**: Change `PORT=4001` in your `.env` file.
- **Prisma migration errors on clean clone**: Run `npm run db:reset` in development to recreate the database from migrations.
