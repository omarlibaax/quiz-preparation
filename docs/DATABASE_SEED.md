# MySQL `exam_platform` — schema, seed, phpMyAdmin

Use this when your database is **`exam_platform`** on **localhost** (e.g. XAMPP + **phpMyAdmin** at `http://localhost/phpmyadmin`).

## 1. Create the database (once)

In **phpMyAdmin** → **New** → database name **`exam_platform`** → collation `utf8mb4_unicode_ci` → Create.

(Or: it may already exist if you created it before.)

## 2. Configure the API (`server/.env`)

Point Prisma at that MySQL database. Example for XAMPP (root, no password):

```env
DATABASE_URL="mysql://root:@localhost:3306/exam_platform"
```

If your MySQL user/password differ, adjust:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/exam_platform"
```

Copy from `server/.env.example` and fill **JWT** secrets and optional **seed** variables.

## 3. Create tables (Prisma schema)

From the **`server`** folder:

```bash
cd server
npx prisma generate
npx prisma db push
```

After this, refresh **phpMyAdmin** → `exam_platform` — you should see tables: `User`, `Subject`, `Topic`, `Question`, etc.

## 4. Seed users + full question bank

This creates **two admin-panel accounts** (same UI and access: roles `SUPER_ADMIN` and `ADMIN`), a **Student** user, and imports **`src/data/questions.json`** into **subjects, topics, questions** (same logic as Admin → **Import data**).

```bash
cd server
npx prisma db seed
```

Or one-liner after env is set:

```bash
npm run db:seed
```

**Default login (if you did not set `SEED_*` in `.env`):**

| Role | Email | Password |
|------|-------|----------|
| **Admin panel** (use either account — same dashboard) | `superadmin@exam.local` | `SuperAdmin123!` |
| | `admin@exam.local` | `Admin123!` |
| Student | `student@exam.local` | `Student123!` |

Override in `server/.env`:

```env
SEED_SUPER_ADMIN_EMAIL=you@example.com
SEED_SUPER_ADMIN_PASSWORD=YourSecurePass123!
SEED_ADMIN_EMAIL=...
SEED_ADMIN_PASSWORD=...
SEED_STUDENT_EMAIL=...
SEED_STUDENT_PASSWORD=...
```

### Replace all catalog data (optional)

If you already imported once and want a **clean re-import** of the JSON (wipes subjects/topics/questions and related exam links — **not** user accounts):

```bash
set SEED_CLEAR=true
npx prisma db seed
```

PowerShell:

```powershell
$env:SEED_CLEAR="true"; npx prisma db seed
```

### Skip question import (users only)

```env
SEED_IMPORT_BANK=false
```

## 5. Admin panel (browser — not phpMyAdmin)

The **admin UI** is the React app, not phpMyAdmin.

1. Start API: `cd server && npm run dev` (default **http://localhost:4000**)
2. Start frontend: `npm run dev` in project root (e.g. **http://localhost:5173**)
3. Open **http://localhost:5173/admin/dashboard** and sign in with either **admin-panel** account above (same experience).

phpMyAdmin is only for **viewing/editing raw MySQL data**; the app is where you manage content day-to-day.

## 6. Convenience script

From `server/`:

```bash
npm run seed:full
```

Runs `prisma db push` then `prisma db seed` (ensure `.env` is correct first).
