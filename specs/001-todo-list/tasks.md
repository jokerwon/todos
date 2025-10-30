---

description: "Task list for TODO List Application"
---

# Tasks: TODO List Application

**Input**: Design documents from `/specs/001-todo-list/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Automated tests are REQUIRED for every new behavior. Define unit, integration, contract, accessibility, and performance coverage per user story; note any additional testing types the specification demands.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- Include explicit tasks for accessibility validation, performance verification, and instrumentation when a story affects user experience.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js workspace dependencies in `package.json`
- [X] T002 Configure strict TypeScript compiler options in `tsconfig.json`
- [X] T003 [P] Configure ESLint/Prettier tooling in `eslint.config.mjs`
- [X] T004 [P] Install Tailwind CSS + shadcn baseline in `tailwind.config.ts`
- [X] T005 Scaffold shared layout shell and metadata in `app/layout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Define environment configuration template and feature toggles in `.env.example`
- [X] T007 [P] Model Task, Category, Reminder tables and relations in `prisma/schema.prisma`
- [X] T008 [P] Generate initial Prisma migration and client singleton in `lib/prisma.ts`
- [X] T009 [P] Enforce authenticated access via session middleware in `middleware.ts`
- [X] T010 Configure observability helpers for metrics/tracing in `lib/observability.ts`
- [X] T011 Establish analytics provider context and web vitals wiring in `app/providers/analytics-provider.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Capture daily tasks (Priority: P1) 🎯 MVP

**Goal**: Enable signed-in users to create, view, edit, and complete personal tasks with durable persistence.

**Independent Test**: From a clean database, create tasks, update details, toggle completion, refresh the page, and confirm state persists with instrumentation remaining within performance budgets.

### Tests for User Story 1 (MANDATORY) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation, and include accessibility/performance assertions where applicable.**

- [X] T012 [P] [US1] Author contract tests for `POST/GET /api/tasks` in `tests/integration/api/tasks.contract.test.ts`
- [X] T013 [P] [US1] Add Playwright flow covering task capture/completion in `tests/e2e/tasks.capture.spec.ts`
- [X] T014 [P] [US1] Add Zustand store unit tests with optimistic updates in `tests/unit/hooks/use-task-store.test.ts`

### Implementation for User Story 1

- [X] T015 [P] [US1] Define task validation schemas with Zod in `lib/validation/tasks.ts`
- [X] T016 [US1] Implement task repository/service operations in `lib/tasks-service.ts`
- [X] T017 [US1] Build Next.js route handler for GET/POST tasks in `app/api/tasks/route.ts`
- [X] T018 [US1] Implement task creation form component with accessibility in `app/components/task-form.tsx`
- [X] T019 [US1] Implement task list and completion controls in `app/components/task-list.tsx`
- [X] T020 [US1] Implement Zustand task store with optimistic updates in `app/hooks/use-task-store.ts`
- [X] T021 [US1] Compose task list page with instrumentation hooks in `app/page.tsx`

**Checkpoint**: User Story 1 is independently functional and meets quality gates

---

## Phase 4: User Story 2 - Organize tasks by context (Priority: P2)

**Goal**: Allow users to manage categories, apply due-date filters, and focus on specific task contexts.

**Independent Test**: Seed tasks across categories/dates, apply filters, validate UI updates and summaries, and ensure instrumentation records filter usage while performance stays within budgets.

### Tests for User Story 2 (MANDATORY) ⚠️

- [X] T022 [P] [US2] Author contract tests for `GET/POST/PATCH /api/categories` in `tests/integration/api/categories.contract.test.ts`
- [X] T023 [P] [US2] Add integration tests for task filtering logic in `tests/integration/app/task-filters.test.tsx`
- [X] T024 [P] [US2] Extend Playwright coverage for filter UX/accessibility in `tests/e2e/tasks.filter.spec.ts`

### Implementation for User Story 2

- [X] T025 [P] [US2] Implement category service utilities in `lib/categories-service.ts`
- [X] T026 [US2] Build category CRUD route handler in `app/api/categories/route.ts`
- [X] T027 [US2] Extend task route to support filter query params in `app/api/tasks/route.ts`
- [X] T028 [US2] Implement filter bar UI with keyboard support in `app/components/filter-bar.tsx`
- [X] T029 [US2] Implement category management panel in `app/components/category-manager.tsx`
- [X] T030 [US2] Extend task store to manage filters and summaries in `app/hooks/use-task-store.ts`
- [X] T031 [US2] Render status/category summaries with badges in `app/components/task-summary.tsx`

**Checkpoint**: User Stories 1 and 2 operate independently with contextual organization features

---

## Phase 5: User Story 3 - Stay on track with reminders (Priority: P3)

**Goal**: Enable reminder scheduling and timely notifications so critical tasks are not missed.

**Independent Test**: Schedule reminders, trigger dispatch via worker/cron, verify in-app/email notifications with actionable controls, and confirm metrics capture delivery timings.

### Tests for User Story 3 (MANDATORY) ⚠️

- [X] T032 [P] [US3] Author contract tests for `POST/PATCH/DELETE /api/reminders` in `tests/integration/api/reminders.contract.test.ts`
- [X] T033 [P] [US3] Add unit tests for reminder scheduling/queue logic in `tests/unit/lib/notifications.test.ts`
- [X] T034 [P] [US3] Add Playwright scenario validating reminder notifications in `tests/e2e/tasks.reminder.spec.ts`

### Implementation for User Story 3

- [X] T035 [P] [US3] Define reminder validation schemas in `lib/validation/reminders.ts`
- [X] T036 [US3] Implement reminder orchestration helpers in `lib/reminders-service.ts`
- [X] T037 [US3] Build reminder route handlers in `app/api/reminders/route.ts`
- [X] T038 [US3] Implement reminder dispatch endpoint for cron in `app/api/internal/reminder-dispatch/route.ts`
- [X] T039 [US3] Implement reminder configuration modal in `app/components/reminder-modal.tsx`
- [X] T040 [US3] Integrate reminder states into task list UI in `app/components/task-list.tsx`
- [X] T041 [US3] Implement serverless worker script for reminders in `scripts/reminder-worker.ts`

**Checkpoint**: All user stories are independently functional with reminder automation in place

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consolidate quality, documentation, and cross-story enhancements

- [X] T042 [P] Document architecture decisions and reuse patterns in `docs/architecture/todo.md`
- [X] T043 Tune telemetry configuration and alert thresholds in `lib/observability.ts`
- [X] T044 [P] Run accessibility regression suite and address findings in `tests/e2e/tasks.a11y.spec.ts`
- [X] T045 Validate and refine onboarding instructions in `specs/001-todo-list/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – run immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion – blocks user stories
- **User Story Phases (3–5)**: Each depends on Foundational completion; deliver in priority order (P1 → P2 → P3) or in parallel with careful coordination
- **Polish (Phase 6)**: Requires all targeted user stories to be complete

### User Story Dependencies

- **User Story 1 (P1)**: No upstream dependencies beyond foundational work
- **User Story 2 (P2)**: Builds on data structures and APIs from US1 but remains independently deployable after foundational tasks
- **User Story 3 (P3)**: Requires task persistence from US1 and category context from US2 but exposes reminder functionality as an independent increment once prior stories land

### Within Each User Story

- Create failing tests before implementation
- Implement validation/models before service logic
- Implement service logic before UI/route wiring
- Add instrumentation and accessibility states before marking story complete

### Parallel Opportunities

- Setup tasks T003–T005 can proceed in parallel after T001–T002
- Foundational tasks T007–T011 can be parallelized by domain (schema, auth, observability)
- Within each user story, parallelize tasks marked [P] such as contract tests, validation schema creation, and service utilities that touch distinct files
- User stories 2 and 3 can overlap once their predecessor’s shared surfaces are merged and stable

---

## Parallel Example: User Story 1

```bash
# Parallel test preparation
Task: "T012 [P] [US1] Author contract tests for POST/GET /api/tasks in tests/integration/api/tasks.contract.test.ts"
Task: "T013 [P] [US1] Add Playwright flow covering task capture/completion in tests/e2e/tasks.capture.spec.ts"
Task: "T014 [P] [US1] Add Zustand store unit tests with optimistic updates in tests/unit/hooks/use-task-store.test.ts"

# Parallel implementation groundwork
Task: "T015 [P] [US1] Define task validation schemas with Zod in lib/validation/tasks.ts"
Task: "T016 [US1] Implement task repository/service operations in lib/tasks-service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1–2 to establish infrastructure
2. Deliver Phase 3 (US1) and validate via automated tests + manual QA
3. Deploy MVP enabling core task capture and completion workflows

### Incremental Delivery

1. Release US1 (task capture) as the MVP
2. Layer US2 (contextual organization) and validate independently
3. Layer US3 (reminders) once organization is stable; monitor reminder SLAs

### Parallel Team Strategy

1. During Phases 1–2, divide work by expertise (infrastructure, database, instrumentation)
2. Assign dedicated owners per user story once foundational work lands
3. Use checkpoints to ensure each increment passes automated tests and constitutional gates before merging

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to a specific user story for traceability
- Verify tests fail before implementing functionality
- Commit after each task or logical group
- Stop at checkpoints to validate each user story independently
- Avoid introducing cross-story coupling that prevents isolated deployments
