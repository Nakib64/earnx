# EarnX MLM Platform - Next Steps & Deployment Guide

This document outlines the current project status, immediate setup commands, end-to-end testing instructions, and production deployment recommendations for the **EarnX Multi-Level Marketing System**.

---

## 📌 1. Project Status Summary

- **Backend Architecture (`/backend`)**:
  - NestJS modular API + Prisma ORM + PostgreSQL schema.
  - Isolated Dual Authentication (`UserJwtGuard` vs `AdminJwtGuard`).
  - Recursive Multi-Level Commission Engine with Designation Depth Key validation (`parent.designation.max_level >= current_level`).
  - Immutable `WalletTransaction` ledger powered by ACID database transactions (`prisma.$transaction()`).
- **Frontend Architecture (`/frontend`)**:
  - Next.js 15 (App Router) + React 19 + Tailwind CSS + TanStack Query + React Hook Form + Zod.
  - Public Landing Homepage at `/`.
  - Nested Member Dashboard Portal at `/dashboard/*` (`/dashboard`, `/dashboard/referral`, `/dashboard/wallet`, `/dashboard/offers`, `/dashboard/approvals`).
  - Full Admin Portal at `/admin/*` (`/admin/dashboard`, `/admin/users`, `/admin/designations`, `/admin/approvals`, `/admin/commissions`, `/admin/wallet`, `/admin/offers`).
  - Modular UI components & custom React hook (`useDesignations`).

---

## 🚀 2. Local Setup & Execution Guide

### Prerequisite: Database Connection
Ensure PostgreSQL is running locally or via Docker:
```bash
# Start local PostgreSQL via Docker Compose
docker-compose up -d
```

### Step 1: Initialize Backend & Seed Database
```bash
# Navigate to backend directory
cd backend

# Run Prisma schema migration
npm run prisma:migrate

# Seed default Admin ('admin@earnx.com' / 'Admin123!'), Designations, and Commission Rules
npm run prisma:seed

# Start backend server in development mode (Runs on http://localhost:5000/api)
npm run start:dev
```

### Step 2: Start Frontend Web Application
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Start Next.js development server (Runs on http://localhost:3000)
npm run dev
```

---

## 🧪 3. End-to-End Testing & Verification Workflow

Follow this step-by-step scenario to verify the multi-level tree and commission engine:

1. **Admin Setup**:
   - Access Admin Portal at `http://localhost:3000/admin/login` (Credentials: `admin@earnx.com` / `Admin123!`).
   - Go to **Designations & Badges** (`/admin/designations`) and verify Star badges ("1 Star Leader", "2 Star Director", etc.).
   - Go to **Commission Rules** (`/admin/commissions`) and set payout amounts per level depth (e.g. Level 1 -> $100, Level 2 -> $50, Level 3 -> $25).

2. **User Registration & Referral Tree Setup**:
   - Go to `http://localhost:3000/register` and create **User A** (Sponsor). Copy User A's unique referral code (e.g. `EX8K92L1`).
   - Register **User B** using User A's referral code.
   - Register **User C** using User B's referral code.

3. **Activation & Commission Distribution Test**:
   - Log in as **User C** (`/login`) and click **Request Activation**.
   - Log in as **User B** (`/login`) -> Go to **Downline Approvals** (`/dashboard/approvals`) -> Click **Approve**.
   - **Verification**:
     - User C status changes from `DISABLED` to `ACTIVE`.
     - User B receives Level 1 commission payout in their wallet (`/dashboard/wallet`).
     - User A receives Level 2 commission payout in their wallet if User A has a 1 Star badge or higher!

4. **Direct Withdrawal Approval Test**:
   - Log in as **User B** -> Go to **Wallet** (`/dashboard/wallet`) -> Submit **Withdrawal Request** for $50.
   - Log in as **Admin** -> Go to **Approvals Queue** (`/admin/approvals`) -> Click **Approve & Deduct**.
   - **Verification**: User B's wallet balance is deducted by $50 via an atomic transaction entry in the `WalletTransaction` audit trail.

---

## ☁️ 4. Recommended Production Deployment

### Database (PostgreSQL)
- Host PostgreSQL on cloud providers such as **Supabase**, **Neon**, or **Render PostgreSQL**.
- Set `DATABASE_URL` in `backend/.env`.

### Backend API (NestJS)
- Deploy to **Render**, **Railway**, **Fly.io**, or **DigitalOcean App Platform**.
- Set environment variables:
  ```env
  PORT=5000
  DATABASE_URL="your-production-db-url"
  JWT_USER_SECRET="your-strong-production-user-jwt-secret"
  JWT_ADMIN_SECRET="your-strong-production-admin-jwt-secret"
  ```

### Frontend Application (Next.js 15)
- Deploy to **Vercel** or **Netlify**.
- Set environment variable: `NEXT_PUBLIC_API_URL="https://your-backend-api-domain.com/api"`

---

## 📄 5. Project Directory Map

```
earnx/
├── docker-compose.yml              # PostgreSQL Docker Compose configuration
├── NEXT_STEPS.md                   # Next steps & deployment guide (This file)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Complete database schema
│   │   └── seed.ts                 # Database seed script
│   └── src/
│       ├── admin-auth/             # Admin login & strategy
│       ├── user-auth/              # User registration & strategy
│       ├── users/                  # Referral tree & designation management
│       ├── wallets/                # ACID transaction ledger & balance calculation
│       ├── commissions/            # Recursive Multi-Level Commission Engine
│       ├── approvals/              # Activation, Premium, Withdrawal requests
│       ├── offers/                 # Promotions & tasks
│       └── main.ts                 # NestJS entry point
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx            # Public Landing Homepage
        │   ├── login/              # User Sign In
        │   ├── register/           # Member Registration
        │   ├── dashboard/          # User Dashboard & nested sub-routes
        │   └── admin/              # Admin Portal routes
        ├── components/             # Reusable UI & Designation components
        ├── context/                # AuthContext & TanStack Query Providers
        ├── hooks/                  # Custom useDesignations hook
        └── lib/                    # API client wrapper & utility functions
```
