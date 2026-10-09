# Kiln & Leaf Ops — Task Management System

A robust, enterprise-grade Task Management System API and frontend dashboard built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL 16**, and **Prisma ORM**.

This repository was developed as an assessment submission for the **Node.js Developer Intern** position. Authenticated team members manage roastery workflow tasks, while administrators possess elevated privileges to update task lifecycle statuses and review operational metrics across all staff.

---

## Table of Contents
1. [Overview & Features](#overview--features)
2. [Technologies Used](#technologies-used)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Quick Start (Clean Setup)](#quick-start-clean-setup)
6. [Database Configuration](#database-configuration)
7. [Environment Variables](#environment-variables)
8. [Running the Application, Tests & Newman](#running-the-application-tests--newman)
9. [Frontend Client (Kiln & Leaf Ops)](#frontend-client-kiln--leaf-ops)
10. [Seed Test Credentials](#seed-test-credentials)
11. [API Endpoints Reference](#api-endpoints-reference)
12. [Authorization Matrix](#authorization-matrix)
13. [Assumptions and Decisions](#assumptions-and-decisions)
14. [AI Assistance Disclosure](#ai-assistance-disclosure)
15. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview & Features

- **Robust REST API**: Built on Express.js and TypeScript, running strictly under Node.js 20+ / 24+.
- **Authentication & Security**:
  - JWT HS256 authentication with explicit algorithm validation.
  - Constant-time dummy bcrypt comparisons on unknown emails to prevent username enumeration and timing side-channel leaks.
  - Password hashes never leaked in any response.
  - Helmet HTTP security headers and restricted CORS.
  - Configurable rate limiting on auth routes (`express-rate-limit`).
- **Role-Based Access Control (RBAC)**:
  - Database-backed role verification on every request (tokens never self-assert roles).
  - Strict resource isolation: users can only view and edit their own tasks.
  - Existence hiding: unauthorized attempts to view or edit another user's task return `404 Not Found` (never `403`), preventing ID enumeration.
  - Admins can view all tasks, search across owners, edit any task, and update task status via a dedicated `PATCH` endpoint.
- **Strict Data Validation & Error Handling**:
  - Zod schemas validating bodies, queries, and route parameters.
  - Strict bodies on mutations, forbidding rogue or unpermitted fields.
  - Unified JSON error envelope: `{ "error": { "code", "message", "details"? } }`.
- **Database & Migrations**:
  - PostgreSQL 16 with Prisma ORM.
  - Automated, tool-generated migrations (`prisma/migrations/*/migration.sql`) rather than manual raw dumps.
  - Fully idempotent database seeder (`prisma/seed.ts`).
- **Dual Verification**:
  - Vitest + Supertest integration tests running on a dedicated PostgreSQL schema (`?schema=test`).
  - Automated Newman test suite executing a complete Postman collection against the live API.

---

## Technologies Used

- **Runtime & Language**: Node.js v24.14.1, TypeScript 5.7
- **Web Framework**: Express 4.21
- **Database & ORM**: PostgreSQL 16 (Alpine), Prisma ORM 6.4
- **Security & Cryptography**: `bcryptjs` (pure JS, cross-platform stability), `jsonwebtoken`, `helmet`, `cors`
- **Validation**: Zod 3.24
- **Rate Limiting**: `express-rate-limit` 7.5
- **Testing**: Vitest 3.2, Supertest 7.0, Newman (Postman Collection Runner)
- **Containerization**: Docker Compose (PostgreSQL 16)
- **Frontend Client**: React 19, Vite 8, React Router 8, Tailwind CSS v4

---

## Project Structure

```text
Kanishka-Node/
├── client/                     # React 19 / Vite UI (Kiln & Leaf Ops)
│   ├── public/                 # Favicon and client assets
│   ├── src/                    # Client app, components, auth context, API client
│   ├── package.json            # Client-specific scripts and dependencies
│   ├── vite.config.ts          # Vite bundler configuration
│   └── .env.example            # Client environment variables
├── docker-compose.yml          # PostgreSQL 16 Alpine container with healthcheck
├── prisma/                     # Database schema, migrations, and seed
│   ├── schema.prisma           # Prisma schema definition
│   ├── seed.ts                 # Idempotent TypeScript seeder
│   └── migrations/             # Tool-generated migration files
│       └── 20261009085423_init/
│           └── migration.sql
├── postman/                    # API test artifacts
│   ├── Kanishka_Ops.postman_collection.json # Postman 2.1 collection
│   └── Local.postman_environment.json       # Environment variables for Postman
├── src/                        # Express API (TypeScript)
│   ├── app.ts                  # App factory (used by integration tests)
│   ├── server.ts               # Server startup & graceful shutdown
│   ├── config/
│   │   └── env.ts              # Zod-validated environment config
│   ├── lib/                    # Helpers: prisma, jwt, password, errors, status, asyncHandler
│   ├── middleware/             # authenticate, requireRole, validate, rateLimit, notFound, errorHandler
│   └── modules/
│       ├── auth/               # routes, controller, service, schemas
│       ├── tasks/              # routes, controller, service, schemas
│       └── admin/              # routes, controller, service
├── tests/                      # Integration test suites (Vitest + Supertest)
│   ├── setup.ts                # DB cleanup utilities
│   ├── status.test.ts          # Status mapping unit test
│   ├── auth.test.ts            # Auth & JWT tests
│   ├── tasks.test.ts           # Tasks & full authorization matrix tests
│   └── admin.test.ts           # Admin stats & users tests
├── .env.example                # Sample environment variables
├── .env.test                   # Isolated test environment variables
├── vitest.config.ts            # Test runner configuration
├── package.json                # Root package configuration
├── tsconfig.json               # Backend TypeScript configuration
└── README.md                   # Complete documentation
```

---

## Prerequisites

- **Node.js**: `v20.x` or `v24.x` (verified on `v24.14.1`)
- **npm**: `v10.x` or `v11.x`
- **Docker & Docker Compose**: Docker 26+ / Compose v2+ (for running PostgreSQL locally)
  *(Alternatively, an external PostgreSQL connection string can be supplied via `DATABASE_URL`)*.

---

## Quick Start (Clean Setup)

Follow these verbatim steps to start the database, apply migrations, seed sample accounts, and boot the API:

```bash
# 1. Start the PostgreSQL container
docker compose up -d

# 2. Configure environment variables
cp .env.example .env

# 3. Install backend dependencies
npm install

# 4. Apply migrations to the database
npm run db:migrate

# 5. Seed test users and roastery tasks
npm run db:seed

# 6. Start the API development server
npm run dev
```

The API will be running on `http://localhost:4000`. Healthcheck is reachable at `http://localhost:4000/api/health`.

---

## Database Configuration

The system uses PostgreSQL 16. Two methods of database setup are supported:

### 1. Local Docker Setup (Default)
The provided `docker-compose.yml` configures an isolated PostgreSQL 16 instance:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: kanishka-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: kanishka_ops
```
Connection URL in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kanishka_ops?schema=public"
```

### 2. External PostgreSQL (e.g. Neon, Supabase, RDS)
Simply set `DATABASE_URL` in `.env` to your external connection string:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require&schema=public"
```
Then run `npm run db:migrate` and `npm run db:seed`.

---

## Environment Variables

| Variable | Description | Example / Default | Required |
|---|---|---|---|
| `PORT` | Port for the Express HTTP server | `4000` | No (default 4000) |
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | `development` | No |
| `DATABASE_URL` | PostgreSQL connection URL with schema parameter | `postgresql://postgres:postgres@localhost:5432/kanishka_ops?schema=public` | **Yes** |
| `JWT_SECRET` | Secret key for signing HS256 tokens (min 32 characters) | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | **Yes** |
| `JWT_EXPIRES_IN` | Token validity duration | `8h` | No (default `8h`) |
| `BCRYPT_ROUNDS` | Cost factor for password hashing | `10` | No (default `10`) |
| `CLIENT_ORIGIN` | Allowed origin for CORS | `http://localhost:5173` | No |
| `RATE_LIMIT_ENABLED` | Toggle IP-based rate limiting on authentication routes | `true` | No (default `true`) |
| `AUTH_RATE_LIMIT_MAX`| Max requests per 15 minutes window | `30` | No (default `30`) |
| `ADMIN_OTP_ENABLED` | Enable optional 2FA OTP for admin dashboard | `false` | No (default `false`) |
| `OTP_DELIVERY` | OTP delivery mechanism (`console` or `smtp`) | `console` | No |
| `ALLOW_SEED` | Required to permit database seeding in `production` | `false` | No |

---

## Running the Application, Tests & Newman

### 1. Development Server
```bash
npm run dev
```

### 2. Production Build & Start
```bash
npm run build
npm start
```

### 3. Integration Tests (Vitest + Supertest)
Integration tests run against the isolated `test` PostgreSQL schema (`?schema=test`), leaving seeded development data untouched:
```bash
npm test
```

### 4. Postman Collection Verification (Newman)
Run the complete Postman test suite with 0 failures:
```bash
# Ensure the API is running in another terminal (npm run dev)
npm run postman
```

### 5. Linting & Formatting
```bash
npm run lint
npm run format
```

---

## Frontend Client (Kiln & Leaf Ops)

The frontend client is located in `client/` and was designed as an operations portal ("Kiln & Leaf Ops") built on **React 19**, **Vite 8**, **React Router 8**, and **Tailwind CSS v4**.

### Heritage & Design Principles
- **Design System Reuse**: The client reuses the artisanal editorial typography and color design tokens (Fraunces serif display, DM Sans interface font, warm paper `#f7f4ee`, ink `#161412`, terracotta accent `#8c3a14`) from the candidate's prior React assessment, purposefully adapted from consumer storefront to internal roastery operations.
- **Accessible Status Indicators**: Task statuses are communicated through both text labels and multi-sensory tone (never color alone):
  - `Pending`: Neutral stone with muted dot
  - `In Progress`: Warm terracotta accent with vibrant indicator
  - `Testing`: Amber tone
  - `Completed`: Forest emerald green
- **URL-Driven State**: All task filtering, pagination, and search query state lives in the URL (`?status=&q=&page=`), enabling full browser history navigation and shareable links.
- **Accessibility & Responsiveness**: Form fields maintain explicit `<label>` bindings, `aria-invalid` flags, `aria-describedby` helper texts, visible focus rings, and full responsiveness across Mobile (390px), Tablet (768px), and Desktop (1440px).

### Client Setup & Running
```bash
# Navigate to the client directory
cd client

# Configure environment variables
cp .env.example .env

# Install client dependencies
npm install

# Start Vite development server
npm run dev

# Build production bundle
npm run build
```
The client runs by default at `http://localhost:5173`. Quick-fill buttons are provided on the login screen to instantly authenticate as `admin@example.com`, `user@example.com`, or `user2@example.com`.

---

## Seed Test Credentials

The database seeder (`npm run db:seed`) creates three accounts demonstrating regular user operation and admin oversight:

| Role | Name | Email | Password | Purpose |
|---|---|---|---|---|
| **Admin** | Operations Admin | `admin@example.com` | `Admin@123` | Full administrative visibility, user directory, status updates |
| **User** | Divya Roaster | `user@example.com` | `User@123` | Primary regular user; manages own roasting/cleaning tasks |
| **User** | Kanishka Cupper | `user2@example.com` | `User@1234` | Second regular user; verifies task isolation between users |

---

## API Endpoints Reference

All endpoints are prefixed with `/api`. Errors conform to:
```json
{
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | RATE_LIMITED | INTERNAL_ERROR",
    "message": "Human readable explanation",
    "details": []
  }
}
```

### 1. System & Health
- **`GET /api/health`**
  - **Auth**: None
  - **Description**: Verifies API connectivity and executes `SELECT 1` on PostgreSQL.
  - **Response 200**:
    ```json
    { "status": "ok", "database": "connected", "timestamp": "2026-10-09T09:00:00.000Z" }
    ```

### 2. Authentication
- **`POST /api/auth/register`**
  - **Auth**: None (Rate limited)
  - **Body**: `{ "name": "string", "email": "string", "password": "string" }`
  - **Description**: Creates a user. Role is strictly forced to `user` (ignoring any client-supplied role).
  - **Response 201**:
    ```json
    {
      "user": {
        "id": 4,
        "name": "Alex",
        "email": "alex@example.com",
        "role": "user",
        "createdAt": "2026-10-09T09:00:00.000Z",
        "updatedAt": "2026-10-09T09:00:00.000Z"
      }
    }
    ```
- **`POST /api/auth/login`**
  - **Auth**: None (Rate limited)
  - **Body**: `{ "email": "string", "password": "string" }`
  - **Description**: Authenticates user. Returns JWT and user payload. Returns 401 on incorrect credentials without leaking if email exists.
  - **Response 200**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": { "id": 1, "name": "Operations Admin", "email": "admin@example.com", "role": "admin", ... }
    }
    ```
- **`GET /api/auth/me`**
  - **Auth**: Bearer Token
  - **Description**: Retrieves current user profile from DB.
  - **Response 200**:
    ```json
    {
      "user": { "id": 1, "name": "Operations Admin", "email": "admin@example.com", "role": "admin", ... }
    }
    ```

### 3. Tasks Management
- **`GET /api/tasks`**
  - **Auth**: Bearer Token
  - **Query**: `page` (default 1), `limit` (default 10, max 50), `status` ("Pending" \| "In Progress" \| "Testing" \| "Completed"), `q` (search), `userId` (Admin only).
  - **Description**: Users see only their own tasks; admins see all tasks with owner details.
  - **Response 200**:
    ```json
    {
      "data": [
        {
          "id": 1,
          "userId": 1,
          "title": "Roast batch ET-014",
          "description": "14 min profile",
          "status": "In Progress",
          "createdAt": "2026-10-09T09:00:00.000Z",
          "updatedAt": "2026-10-09T09:00:00.000Z",
          "user": { "id": 1, "name": "Operations Admin", "email": "admin@example.com" }
        }
      ],
      "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
    }
    ```
- **`POST /api/tasks`**
  - **Auth**: Bearer Token
  - **Body**: `{ "title": "string", "description"?: "string" }`
  - **Description**: Creates a task. `status` is forced to `"Pending"`. `userId` is pulled from JWT.
  - **Response 201**: `{ "task": { ... } }`
- **`GET /api/tasks/:id`**
  - **Auth**: Bearer Token
  - **Description**: Task detail. Accessible to task owner or admin. Returns 404 for non-owners (hiding existence).
  - **Response 200**: `{ "task": { ... } }`
- **`PUT /api/tasks/:id`**
  - **Auth**: Bearer Token
  - **Body**: `{ "title"?: "string", "description"?: "string" }` (at least one required).
  - **Description**: Updates title or description. Strict: ANY `status` field -> 400.
  - **Response 200**: `{ "task": { ... } }`
- **`PATCH /api/tasks/:id/status`**
  - **Auth**: Bearer Token (**Admin Only**)
  - **Body**: `{ "status": "Pending" | "In Progress" | "Testing" | "Completed" }`
  - **Description**: Updates task status. Regular users receive 403 Forbidden.
  - **Response 200**: `{ "task": { ... } }`

### 4. Admin Management
- **`GET /api/admin/stats`**
  - **Auth**: Bearer Token (**Admin Only**)
  - **Response 200**:
    ```json
    {
      "totals": { "users": 3, "tasks": 7 },
      "byStatus": {
        "Pending": 2,
        "In Progress": 2,
        "Testing": 1,
        "Completed": 2
      }
    }
    ```
- **`GET /api/admin/users`**
  - **Auth**: Bearer Token (**Admin Only**)
  - **Response 200**:
    ```json
    {
      "users": [
        {
          "id": 1,
          "name": "Operations Admin",
          "email": "admin@example.com",
          "role": "admin",
          "taskCount": 2,
          "createdAt": "2026-10-09T09:00:00.000Z",
        }
      ]
    }
    ```

### 5. Optional Admin Console 2FA OTP (Phase 14)
When `ADMIN_OTP_ENABLED=true`, admin management routes require a scoped `consoleToken` (`x-admin-console-token` header or Bearer) obtained via a 2-step OTP flow:
- **`GET /api/admin/config`**
  - **Auth**: Bearer Token (**Admin Only**)
  - **Response 200**: `{ "otpRequired": boolean }`
- **`POST /api/admin/otp/request`**
  - **Auth**: Bearer Token (**Admin Only**)
  - **Description**: Generates a 6-digit cryptographic OTP, hashes it in PostgreSQL, and sends via Nodemailer or prints to server console (`OTP_DELIVERY=console`).
  - **Response 200**: `{ "message": "Verification code dispatched.", "delivery": "console" | "smtp" }`
- **`POST /api/admin/otp/verify`**
  - **Auth**: Bearer Token (**Admin Only**)
  - **Body**: `{ "code": "123456" }`
  - **Description**: Verifies code with max 5 attempts within 5 minutes expiry. Issues a 30-minute JWT with `{ scope: "admin-console" }`.
  - **Response 200**: `{ "consoleToken": "eyJhbGciOiJIUzI1NiIsIn...", "expiresIn": 1800 }`

> **Note**: `ADMIN_OTP_ENABLED` is set to `false` by default so reviewers can run and verify the standard Postman collection without needing SMTP credentials or 2FA hurdles.

---


## Authorization Matrix

| Actor | Action / Route | Expected Outcome |
|---|---|---|
| **Anonymous** | Any `/api/tasks*` or `/api/admin*` | `401 Unauthorized` |
| **User A** | List `/api/tasks` | Returns **only User A's tasks** |
| **User A** | Create `/api/tasks` | `201 Created` (status forced to `Pending`) |
| **User A** | View own task `/api/tasks/:id` | `200 OK` |
| **User A** | Edit own task `/api/tasks/:id` | `200 OK` (title/description updated) |
| **User A** | Edit own task with `status` in PUT body | `400 Bad Request` ("status can only be changed via PATCH...") |
| **User A** | View or edit User B's task | `404 Not Found` (never leaks task existence) |
| **User A** | `PATCH /api/tasks/:id/status` (any task) | `403 Forbidden` |
| **User A** | Any `/api/admin/*` route | `403 Forbidden` |
| **User A** | Register with `role: "admin"` in body | Created strictly as `role: "user"` |
| **Admin** | List `/api/tasks` | Returns **all tasks** with owner info |
| **Admin** | View or edit any user's task | `200 OK` |
| **Admin** | `PATCH /api/tasks/:id/status` | `200 OK` (status updated) |
| **Admin** | `PATCH /api/tasks/:id/status` with invalid status | `400 Bad Request` |
| **Admin** | Access `/api/admin/stats` and `/api/admin/users` | `200 OK` |
| **Any** | Tampered token, expired token, deleted user token | `401 Unauthorized` |

---

## Assumptions and Decisions

1. **Role Source of Truth**: Roles are **never** trusted from JWT payload claims. The `authenticate` middleware loads the user directly from the database on every request. If a user is deleted or their role is modified, changes take effect immediately on their next request.
2. **Admin Tasks & Visibility**: Admins have complete operational oversight and see all tasks created by all users across the system. Tasks created by an admin belong to that admin account.
3. **Task Status Lifecycle**: On creation (`POST /api/tasks`), status is strictly initialized to `"Pending"`. Clients cannot specify initial status.
4. **Dedicated Status Modification Route**: Status transitions must occur through `PATCH /api/tasks/:id/status`, which is locked to administrators. Attempts to pass `status` to `PUT /api/tasks/:id` are rejected with `400 Bad Request`.
5. **Information Leakage Prevention**: When a regular user attempts to access or modify a task belonging to another user, the API responds with `404 Not Found` rather than `403 Forbidden`. This prevents attackers from probing which task IDs exist.
6. **No DELETE Endpoint**: The take-home specification did not define a task deletion endpoint, focusing instead on task lifecycle transitions. Consequently, deletion is omitted to preserve task audit history.
7. **Tokens & Sessions**: Short/medium-lived JWTs (default 8 hours) signed via HMAC SHA-256 (`HS256`). For this intern assessment demo, tokens are securely held in client `localStorage` with error interceptors that clear storage and redirect to login upon 401. In an enterprise banking deployment, `httpOnly`, `SameSite=Strict`, `Secure` cookies with refresh token rotation would be preferred.
8. **Tool-Generated Migrations**: `prisma/migrations/*/migration.sql` files are tool-generated by Prisma Migrate, guaranteeing schema consistency and reproducible migrations rather than unversioned raw SQL scripts.
9. **Password Validation**: Passwords must be between 8 and 72 characters (bcrypt ceiling) and include at least one letter and one number.
10. **Email Normalization**: Emails are trimmed, lowercased, and enforced unique.
11. **Client Design System Reuse**: The React client reuses the artisanal aesthetic (Fraunces typography, warm paper tones, accessible contrast ratios) from the candidate's prior React showcase, adapted into "Kiln & Leaf Ops".

---

## AI Assistance Disclosure

AI tooling was utilized during development to assist with boilerplate scaffolding, rapid test case generation, and documentation drafting. All architectural decisions, security boundaries, Prisma relational schema designs, and authorization matrix tests were authored, verified, and audited by the candidate.

---

## Troubleshooting Guide

- **Docker daemon is not running**: Ensure Docker Desktop is started (`Get-Process *docker*`).
- **Port 5432 already in use**: If a local Postgres service is already running on port 5432, you can either stop the local service (`net stop postgresql-x64-16`) or change the Docker host port mapping in `docker-compose.yml` to `5433:5432` and update `DATABASE_URL` accordingly.
- **Port 4000 already in use**: Change `PORT=4001` in your `.env` file.
- **Prisma migration errors on clean clone**: Run `npm run db:reset` in development to recreate the database from migrations.

---

## Untested Vercel Deployment Guide (Phase 15)

> **Important Disclaimer**: This section provides the architectural setup and files for deploying to Vercel, but is **UNTESTED** against live Vercel cloud infrastructure because external cloud deployments cannot be executed from this local sandbox.

The project is structured to allow split or monorepo deployment to Vercel:

### 1. Backend Serverless API (`api/index.ts` + root `vercel.json`)
- **Serverless Entry**: `api/index.ts` imports and exports the configured Express `createApp()` instance for Vercel's Node runtime.
- **Routing**: Root `vercel.json` rewrites `/api/(.*)` to `/api/index.ts`.
- **Prisma Engine Generation**: Root `package.json` defines `"postinstall": "prisma generate"` ensuring the Prisma Client engine binary is compiled during Vercel's build phase.
- **Database Connection Pooling**: When deploying with serverless functions and hosted PostgreSQL (such as [Neon](https://neon.tech) or [Supabase](https://supabase.com)):
  - Set `DATABASE_URL` to the pooled connection string (e.g. PgBouncer mode).
  - Use a direct connection string (`DIRECT_URL`) when running `prisma migrate deploy` in CI/CD build scripts.
- **Vercel Backend Environment Variables**:
  ```env
  DATABASE_URL="postgresql://user:pass@ep-pooler.region.neon.tech/neondb?sslmode=require&pgbouncer=true"
  JWT_SECRET="<generate-using-crypto.randomBytes(32).toString('hex')>"
  CLIENT_ORIGIN="https://kanishka-ops-client.vercel.app"
  NODE_ENV="production"
  RATE_LIMIT_ENABLED="true"
  AUTH_RATE_LIMIT_MAX="60"
  ADMIN_OTP_ENABLED="false"
  ```

### 2. Frontend React Client (`client/vercel.json`)
- **SPA Routing**: `client/vercel.json` rewrites all non-asset routes `/(.*)` to `/index.html` to preserve HTML5 client-side routing.
- **Build Settings**:
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
- **Client Environment Variables**:
  ```env
  VITE_API_URL="https://kanishka-ops-api.vercel.app/api"
  VITE_SHOW_DEMO_LOGINS="true"
  ```

