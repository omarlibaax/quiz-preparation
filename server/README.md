# Server API

## Setup

1. Copy env template:
   - `copy .env.example .env` (Windows)
2. Use your local MySQL from Apache/phpMyAdmin:
   - phpMyAdmin URL: `http://localhost/phpmyadmin/`
   - Create database: `exam_platform`
   - Update `DATABASE_URL` in `.env` if your MySQL user/password differs
3. Install deps:
   - `npm install`
4. Generate Prisma client:
   - `npm run prisma:generate`
5. Push schema to MySQL:
   - `npm run prisma:push`
6. Run API:
   - `npm run dev`

API base: `http://localhost:4000`

## Initial Routes

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/subjects`
- `POST /api/subjects` (ADMIN)
- `POST /api/subjects/topics` (ADMIN)
- `GET /api/questions`
- `POST /api/questions` (ADMIN)
- `GET /api/exams`
- `GET /api/exams/:id`
- `POST /api/exams` (ADMIN)
- `PATCH /api/exams/:id/publish` (ADMIN)
- `POST /api/attempts/start` (AUTH)
- `POST /api/attempts/:attemptId/submit` (AUTH)
- `GET /api/attempts/:attemptId` (AUTH)
- `GET /api/students/me/dashboard` (AUTH)
- `POST /api/admin/import-question-bank` (ADMIN)
- `POST /api/admin/bootstrap-admin` (public, one-time, requires bootstrap secret)

## Optional Docker

If you do not want to use your Apache/MySQL installation, you can run:

- `docker compose up -d`

## First-time admin setup

Use this endpoint once (before any admin exists):

- `POST /api/admin/bootstrap-admin`

Body:

```json
{
  "fullName": "System Admin",
  "email": "admin@example.com",
  "password": "StrongPass123",
  "bootstrapSecret": "replace-with-bootstrap-secret"
}
```

## Import question bank via script

After creating an admin user:

- `npm run seed:import-bank` (default file and no clear)
- `npm run seed:import-bank -- --clear` (clear previous question/exam data first)
- `npm run seed:import-bank -- --file=../src/data/questions.json`

