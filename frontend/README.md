# LTI frontend (Create React App)

React 18 + TypeScript client for the lab ATS. User-facing copy for this feature is in **Spanish**; code and developer docs stay in **English**.

## Prerequisites

- Node.js and npm (aligned with the root project README)
- Backend API running and reachable (default `http://localhost:3010`) with CORS allowing the CRA origin

## Environment variables

Create React App only reads variables prefixed with `REACT_APP_`.

1. Copy `frontend/.env.example` to `frontend/.env.local` (do **not** commit `.env.local`).
2. Set `REACT_APP_API_URL` to your API base URL **without** a trailing slash, e.g. `http://localhost:3010`.

If `REACT_APP_API_URL` is unset, the app falls back to `http://localhost:3010`.

## Scripts

| Command | Description |
|--------|-------------|
| `npm start` | Dev server at [http://localhost:3000](http://localhost:3000) |
| `npm test` | Jest + React Testing Library (non-interactive: `npm test -- --watchAll=false`) |
| `npm run build` | Production build into `build/` |

## App routes

| Path | Screen |
|------|--------|
| `/` | Recruiter dashboard with **Añadir candidato** CTA |
| `/candidates/new` | Add candidate form (`POST /api/candidates`, multipart) |
| `*` | Redirects to `/` |

## Feature layout

- `src/pages/` — route-level screens
- `src/components/candidates/` — candidate form UI
- `src/services/candidateService.ts` — multipart API client (Axios)
- `src/types/candidate.ts` — DTOs aligned with OpenAPI (`CreateCandidateApiResponse`, `LabStructuredError`)
- `src/utils/candidateFormValidation.ts` — client-side validation (Spanish messages)
- `src/constants/uploads.ts` — `MAX_CV_BYTES` (10 MiB, same default as backend `MAX_CV_BYTES`)

## Testing

- Component tests live next to components or under `src/tests/`; Jest is configured with `preset: 'ts-jest'` and `testEnvironment: 'jsdom'`.
- **Cypress** is not wired in this lab repo yet; end-to-end tests are deferred in favour of RTL coverage for this ticket. When Cypress is added team-wide, scaffold `cypress.config.ts` and e2e specs as described in `ai-specs/specs/frontend-standards.mdc`.

## Axios version note

The project uses **Axios 0.27.x** so Jest 27 can load the client without ESM transform workarounds. The runtime API used here (`post`, `isAxiosError`) matches 1.x usage; upgrading to Axios 1+ is possible later if Jest is configured to transform `node_modules/axios` or the stack moves to a native ESM test runner.

## Further reading

- Root [README.md](../README.md) for full-stack setup and Docker
- API contract: `ai-specs/specs/api-spec.yml` → `POST /api/candidates`
