# Quickstart: TODO List Application

## Prerequisites
- Node.js 20.x + npm 10.x
- PostgreSQL database (e.g., Supabase/Neon connection URL)
- Vercel CLI (for preview deployments and Edge runtime testing)
- Playwright browsers installed (`npx playwright install`)
- PostgreSQL extension `pgcrypto` enabled for UUID generation when running locally (e.g., `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`)

## Environment Setup
1. Copy `.env.example` to `.env.local` and configure:
   - `DATABASE_URL` – Postgres connection string
   - `NEXTAUTH_SECRET` / `AUTH_PROVIDER_*` – existing auth integration
   - `NOTIFICATION_SERVICE_URL` + credentials for reminder dispatch
   - `OTEL_EXPORTER_OTLP_ENDPOINT` for observability
2. Install dependencies: `npm install`
3. Generate shadcn/ui components: `npx shadcn-ui init`
4. Apply Prisma schema: `npx prisma migrate dev`

## Local Development
- Start dev server with instrumentation: `npm run dev`
- Run Prisma studio (optional) for inspecting data: `npx prisma studio`
- Tailwind design tokens live reload via PostCSS
- Launch reminder worker locally when testing notifications: `npm run worker`

## Testing & Quality Gates
- Linting: `npm run lint`
- Unit/integration tests (Vitest + MSW): `npm run test`
- End-to-end tests (Playwright): `npm run e2e`
- Accessibility regression (Pa11y + Axe via Playwright): `npm run test:a11y`
- Performance budgets (Lighthouse CI against local build): `npm run perf`

CI pipeline executes `lint`, `test`, `e2e`, `perf`, and `build` to satisfy constitution gates.

## Running Background Reminder Worker
- Local cron simulation: `npm run worker` (polls reminders every minute)
- For Vercel deployment, configure [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) hitting `/api/internal/reminder-dispatch` endpoint.

## Observability
- Client web vitals feed into Vercel Analytics automatically when `ANALYTICS_WRITE_KEY` configured.
- Server traces exported via OpenTelemetry OTLP collector; run `npm run otel:dev` for local collector.

## Deployment Checklist
- `npm run build` to validate production bundle
- Ensure Prisma migrations applied (`npm run migrate:deploy`)
- Verify environment variables in Vercel project settings
- Execute smoke Playwright suite against staged deployment before promotion
- Enable cron job after verifying reminder dispatch logs remain within SLA (<60s lag)
