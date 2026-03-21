# LTI backend (lab)

Express API with Prisma (PostgreSQL). Default port: **3010**.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. `npm install`
3. `npx prisma migrate dev`
4. `npx prisma generate`
5. `npm run dev`

## Environment variables

See `.env.example` for `DATABASE_URL`, `PORT`, `FRONTEND_URL` / `CORS_ORIGIN`, `MAX_CV_BYTES`, and `CV_UPLOAD_DIR`.

Uploaded CVs are written under `CV_UPLOAD_DIR` (default `uploads/cvs` under the process working directory). This folder is not exposed as static HTTP by default.

## Scripts

- `npm run dev` — `ts-node-dev` with hot reload
- `npm run build` — TypeScript compile to `dist/`
- `npm start` — run compiled `dist/index.js`
- `npm test` — Jest (integration tests use the same `DATABASE_URL` as `.env`; runs in-band)

## API (MVP)

- `GET /` — health-style greeting
- `POST /api/candidates` — create candidate (`multipart/form-data`: required `firstName`, `lastName`, `email`; optional text fields and file field `cv`)

Authentication for recruiter-only routes is planned for a follow-up; see `src/middleware/requireRecruiter.ts`.
