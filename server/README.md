# LaunchPad CICF Backend

Role-based backend API for Admin, Faculty, and Incubatee workflows.

## Highlights

- Consistent workflow transitions across submissions, reviews, and claims
- Email-first notification model via Resend (with mock fallback when keys are missing)
- In-memory data store for rapid development and frontend wiring

## Run Locally

1. Install dependencies:
   - `npm install`
2. Copy env template:
   - `cp .env.example .env` (or create `.env` manually on Windows)
3. Start dev server:
   - `npm run dev`

Server starts on `http://localhost:4000` by default.

## Core Routes

- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

- `GET /api/notifications?role=admin|faculty|incubatee`
- `PATCH /api/notifications/:id/read`
- `POST /api/notifications/mark-all-read`

- `GET /api/settings?role=admin|faculty|incubatee`
- `PATCH /api/settings?role=admin|faculty|incubatee`

- `GET /api/incubatee/bundle`
- `GET /api/faculty/bundle`
- `GET /api/admin/bundle`

- `GET /api/health`
- `GET /api/health/workflow`

## Notification Channel

This backend is intentionally configured for **email-only updates via Resend**.
In-app cards in the frontend are visual mirrors of delivery state.
