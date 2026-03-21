# Exam Preparation Platform - Implementation Blueprint

## Vision

Build a production-grade exam preparation platform with:

- Student panel (practice, exams, analytics, bookmarks, review)
- Admin panel (question bank, exams, users, reports)
- MySQL-backed data model with clean API architecture

This document is the execution baseline for step-by-step implementation.

## Tech Stack

- Frontend: React + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript
- ORM/Migrations: Prisma
- Database: MySQL 8
- Auth: JWT (access + refresh), bcrypt
- Validation: Zod
- Dev infra: Docker Compose (MySQL + Adminer)

## Monorepo Layout

```
quiz-preparation/
  src/                      # existing frontend
  server/                   # backend API
  docs/
  docker-compose.yml        # mysql + adminer
```

## Delivery Phases

### Phase 1 - Foundations

1. Backend scaffold (Express + TS + Prisma + lint)
2. MySQL setup + Prisma schema
3. Auth module (register/login/refresh/me)
4. Role system (admin/student)

### Phase 2 - Core Product

1. Subject/Topic/Question CRUD (admin)
2. Exam generation and attempt flow (student)
3. Results + review APIs
4. Bookmark and weak-topic tracking

### Phase 3 - Professionalization

1. Admin dashboard analytics
2. Student analytics and insights
3. Security hardening and audit logs
4. Deployment readiness (envs, backups, health checks)

## Data Model (Target)

- users
- refresh_tokens
- subjects
- topics
- questions
- question_options
- exams
- exam_questions
- attempts
- attempt_answers
- bookmarks

## Engineering Standards

- Layered backend architecture: routes -> controller -> service -> repo
- Strict DTO validation via Zod
- Centralized error handling
- No raw SQL outside Prisma except justified optimization
- Environment-driven configuration
- Migration-only schema changes

## Immediate Next Steps (Current Sprint)

1. Create backend scaffold under `server/`
2. Add Prisma schema and MySQL connection
3. Add auth and subject/topic base modules
4. Commit and push each completed step

