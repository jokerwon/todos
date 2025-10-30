# Data Model: TODO List Application

## Entity: User (external reference)
- **Description**: Authenticated account from existing SDD Practice authentication service.
- **Key Fields**: `id (UUID)`, `email`, `name` (read-only for this feature).
- **Notes**: All feature entities belong to exactly one user; multi-tenant sharing is out of scope.

## Entity: Task
- **Fields**:
  - `id (UUID)` – primary key.
  - `userId (UUID)` – foreign key to User; indexed.
  - `title (string, 1-120 chars)` – required; trimmed; unique per user when active? (duplicates allowed, but we track createdAt to differentiate).
  - `description (string, 0-2000 chars)` – optional rich text (stored as markdown/plain text).
  - `status (enum: ACTIVE, COMPLETED, ARCHIVED)` – default ACTIVE.
  - `dueDate (timestamp with timezone, nullable)` – must be >= now unless user confirms past date.
  - `reminderLeadMinutes (int, nullable)` – derived convenience for quick reminders; must be between 5 and 1440.
  - `categoryIds (string array)` – denormalized for quick filtering, derived from join table.
  - `createdAt (timestamp tz)` – defaults to now.
  - `updatedAt (timestamp tz)` – auto-updated.
  - `completedAt (timestamp tz, nullable)` – set when status transitions to COMPLETED.
- **Relationships**:
  - Many-to-many with Category via `TaskCategory` join table.
  - One-to-many with Reminder (Task has 0..n reminders).
- **Validation Rules**:
  - Title required, trimmed, must pass profanity check.
  - When status transitions to COMPLETED, `completedAt` must be set.
  - `dueDate` cannot be earlier than `createdAt - 1 day` unless flagged `allowPastDue` from UI confirmation.
  - Maximum active reminders per task: 3.
- **State Transitions**:
  - ACTIVE → COMPLETED (set `completedAt`, schedule follow-up analytics event).
  - COMPLETED → ACTIVE (clear `completedAt`, re-evaluate reminders).
  - ACTIVE/COMPLETED → ARCHIVED (soft delete; reminders canceled).

## Entity: Category
- **Fields**:
  - `id (UUID)` – primary key.
  - `userId (UUID)` – owner.
  - `name (string, 1-60 chars)` – unique per user (case-insensitive).
  - `color (string, nullable)` – hex code from design palette.
  - `icon (string, nullable)` – shadcn icon identifier.
  - `sortOrder (int)` – optional manual ordering.
  - `createdAt`, `updatedAt` timestamps.
- **Relationships**:
  - Many-to-many with Task via `TaskCategory` join table.
- **Validation Rules**:
  - Max categories per user: 20.
  - Name must pass same profanity filter; trim whitespace.

## Entity: TaskCategory (join)
- **Fields**: `taskId (UUID)`, `categoryId (UUID)`; composite primary key.
- **Notes**: Maintains task/category assignments; cascades on delete.

## Entity: Reminder
- **Fields**:
  - `id (UUID)` – primary key.
  - `taskId (UUID)` – foreign key to Task.
  - `userId (UUID)` – denormalized for multi-tenancy guard.
  - `triggerAt (timestamp tz)` – schedule time; must be >= now + 5 minutes.
  - `channel (enum: IN_APP, EMAIL)` – default IN_APP; duplicates allowed per channel.
  - `status (enum: SCHEDULED, SENT, MISSED, CANCELED)` – default SCHEDULED.
  - `lastAttemptAt (timestamp tz, nullable)` – set when delivery attempted.
  - `meta (jsonb)` – payload for notification content (task title snippet).
  - `createdAt`, `updatedAt` timestamps.
- **Validation Rules**:
  - Enforce maximum of 5 active reminders per user/day to meet scale assumptions.
  - When task is completed/archived, associated reminders auto-cancel.
- **State Transitions**:
  - SCHEDULED → SENT (upon successful notification; record `lastAttemptAt`).
  - SCHEDULED → MISSED (if system cannot deliver within ±5 minutes window; log anomaly).
  - Any → CANCELED (user action or task deletion).

## Derived Views & Metrics
- **TaskSummary View**: Aggregates counts per status and per category for fast dashboard chips.
- **ReminderQueue View**: Materialized view (or SQL query) selecting upcoming reminders within 5-minute windows for background worker.

## Security & Multi-tenancy Guardrails
- All queries filter by `userId` to prevent cross-tenant access.
- Prisma middleware enforces user ownership before mutations.
- Soft delete (archived) tasks keep history but hidden from default queries; periodic cleanup scheduled.
