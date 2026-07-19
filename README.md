# Habit Tracker

A full-stack habit tracking app with a monthly calendar, recurring habits,
streaks, notes, one-off tasks, stats/heatmap, and dark mode.

## Tech Stack
- **Frontend:** Next.js, TypeScript, Tailwind CSS, TanStack Query, Zustand
- **Backend:** Spring Boot, Spring Data JPA, MySQL
- **API Docs:** Swagger (springdoc-openapi)

## Features
- Monthly calendar with per-day habit completion + progress rings
- Per-habit scheduling (daily / weekdays / specific days / X times per week)
- Streak tracking, categories, one-off tasks, per-day & per-task notes
- Insights page with completion stats and a contribution heatmap
- Dark mode + configurable week start

## Getting Started

### Backend
1. Create a MySQL database: `CREATE DATABASE habit_tracker;`
2. Set env var `DB_PASSWORD` (and optionally `DB_URL`, `DB_USERNAME`)
3. `cd backend && ./mvnw spring-boot:run`
4. API runs on http://localhost:8080 — Swagger at /swagger-ui.html

### Frontend
1. `cd frontend && npm install`
2. Create `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api`
3. `npm run dev`
4. App runs on http://localhost:3000