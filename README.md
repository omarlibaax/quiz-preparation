# Quiz Preparation — Exam Platform

Full-stack exam preparation app: **React (Vite) + Tailwind** frontend, **Node/Express + Prisma + MySQL** backend.

- **Students**: register/login, take quizzes (local JSON fallback or backend exams), results, dashboard, **attempt history** (`/attempts`).
- **Admins**: `/admin` — subjects, topics, questions, exams, publish, import JSON question bank.

## Prerequisites

- Node.js 18+
- MySQL 8 (e.g. via XAMPP / phpMyAdmin)
- Database: create `exam_platform` (see `server/README.md`)

## Quick start

### 1. Backend API

```bash
cd server
copy .env.example .env
# Edit .env: DATABASE_URL, JWT secrets, ADMIN_BOOTSTRAP_SECRET
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

API: `http://localhost:4000`

### 2. First admin user (one-time)

**Option A — in the app:** open **Login** → **First-time setup: create admin account**, and enter the same `ADMIN_BOOTSTRAP_SECRET` as in `server/.env`.

**Option B — API:** `POST http://localhost:4000/api/admin/bootstrap-admin`

```json
{
  "fullName": "Admin",
  "email": "admin@example.com",
  "password": "YourStrongPass123",
  "bootstrapSecret": "same-as-ADMIN_BOOTSTRAP_SECRET-in-server-.env"
}
```

Then log in from the app with that email and password.

### 3. Frontend

From the repo root:

```bash
npm install
```

Optional: create `.env` in the project root:

```env
VITE_API_BASE_URL=http://localhost:4000
```

```bash
npm run dev
```

App: `http://localhost:5173`

### 4. Import question bank (optional)

- **CLI** (see `server/README.md`): `cd server && npm run seed:import-bank`
- **Admin UI**: log in as admin → **Admin** → **Import question bank**

## Project layout

| Path | Role |
|------|------|
| `src/` | React app (pages, API clients, auth) |
| `server/` | Express API, Prisma schema |
| `src/data/questions.json` | Local/offline question bank |
| `docs/PLATFORM_IMPLEMENTATION_PLAN.md` | Architecture notes |

## Scripts (frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## License

MIT
