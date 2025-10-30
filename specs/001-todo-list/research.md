# Research: TODO List Application

## Decision: Next.js App Router with server actions
- **Rationale**: App Router enables co-located route handlers, streaming UI, and server actions for direct database mutations, reducing API boilerplate while supporting optimistic updates required by the spec.
- **Alternatives**:
  - **Next.js Pages Router**: Mature but lacks built-in server actions and layouts; more legacy code.
  - **Remix**: Strong data loading model, however deviates from mandated Next.js stack and complicates team adoption.

## Decision: Zustand + TanStack Query for state management
- **Rationale**: Zustand offers minimal, testable client stores for UI state (filters, optimistic updates) while TanStack Query handles server cache syncing, enabling real-time task updates across devices.
- **Alternatives**:
  - **Redux Toolkit**: Comprehensive but heavier boilerplate compared to lightweight Zustand.
  - **React Context only**: Simple but inadequate for complex derived state and undo semantics.

## Decision: PostgreSQL via Prisma ORM
- **Rationale**: PostgreSQL provides relational modeling for tasks, categories, and reminders; Prisma accelerates schema evolution, type-safe queries, and integrates with Next.js server actions.
- **Alternatives**:
  - **Supabase REST**: Offers managed Postgres with REST, but Prisma grants richer type-safety and flexibility.
  - **MongoDB**: Simpler document model but complicates relational queries (e.g., categories) and reminder schedules.

## Decision: Reminder delivery through queue + notification service
- **Rationale**: Use background job (e.g., Vercel Cron or serverless queue) to poll upcoming reminders, enqueue notifications via existing notification service, satisfying ±60 s SLA without blocking requests.
- **Alternatives**:
  - **Client-side reminders**: Unreliable when users offline or browsers closed.
  - **Database triggers**: Harder to maintain across providers and limited observability versus application-managed queue.

## Decision: Observability stack (OpenTelemetry + Vercel Analytics)
- **Rationale**: OpenTelemetry collectors capture server timings, while Vercel Analytics records client vitals (TTFB, FID). Combined instrumentation supports constitution performance stewardship.
- **Alternatives**:
  - **Custom logging only**: Insufficient correlation between client/server performance.
  - **Third-party APM (Datadog)**: Powerful but adds cost/complexity for initial release.

## Decision: Testing strategy
- **Rationale**: Vitest for fast unit/component tests, MSW for mocking fetch in integration tests, and Playwright for end-to-end ensures coverage of task CRUD, filtering, and reminder flows before implementation per constitution.
- **Alternatives**:
  - **Jest**: Well-known but slower; Vitest integrates with Vite tooling and modern ESM.
  - **Cypress**: Strong e2e but Playwright offers better cross-browser coverage and trace artifacts.
