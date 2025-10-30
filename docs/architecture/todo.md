# Architecture Notes: TODO List Application

## Overview
- Next.js 14 App Router delivers unified UI + API surface ensuring task capture, organization, and reminders share co-located logic.
- Zustand manages client state for tasks, filters, and summaries while delegating persistence to Prisma/PostgreSQL via server actions.
- Prisma models tasks, categories, reminders with relational integrity; reminder scheduling enforces minimum lead time and per-day limits before writing to the queue.

## Key Modules
- `app/hooks/use-task-store.ts`: central client store handling task partitions, summaries, filter query construction, and load orchestration via `/api/tasks`.
- `lib/tasks-service.ts`: server-side orchestration for CRUD + filtered retrieval with category and reminder aggregations.
- `lib/reminders-service.ts`: validates reminder lead times, enforces quotas, and serializes reminder payloads for dispatch.
- `app/api/internal/reminder-dispatch/route.ts`: cron-safe endpoint sweeping upcoming reminders and recording delivery latency metrics.

## UI Composition
- `TaskForm` supports category assignment and invokes store refresh after creation.
- `FilterBar` toggles due windows + category chips, rerunning server fetches to keep UI consistent with canonical state.
- `TaskList` surfaces inline reminder scheduling via `ReminderModal` and renders summary badges for upcoming reminders.

## Observability & Telemetry
- Web vitals funnel through `AnalyticsProvider` to `/api/internal/metrics` (future integration), while reminder dispatch records lag via `recordReminderLag` for SLA monitoring.

## Extensibility
- Reminder dispatch currently logs delivery and marks reminders as sent; integrate external notification providers by extending `app/api/internal/reminder-dispatch/route.ts`.
- Task filtering allows expansion (e.g., status, search) without altering UI primitives—store builds query string from filter state.
