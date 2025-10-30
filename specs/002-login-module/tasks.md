---

description: "Task list for login module implementation"
---

# Tasks: Login Module

**Input**: Design documents from `/specs/002-login-module/`
**Prerequisites**: plan.md (required), spec.md, research.md, data-model.md, contracts/

**Tests**: Automated tests are REQUIRED for every new behavior. Define unit, integration, contract, accessibility, and performance coverage per user story; note any additional testing types the specification demands.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- Include explicit tasks for accessibility validation, performance verification, and instrumentation when a story affects user experience.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Add feature flag `FEATURE_LOCAL_AUTH` and defaults in `.env.example`
- [X] T002 Scaffold auth documentation stub `docs/architecture/login.md`
- [X] T003 [P] Configure MSW auth handlers scaffold in `tests/mocks/auth-handlers.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T004 Implement `lib/auth/hash.ts` using Web Crypto PBKDF2 helpers
- [X] T005 [P] Implement local credential/session store abstraction in `lib/auth/client-store.ts`
- [X] T006 [P] Implement session Zustand hook `app/hooks/use-session.ts`
- [X] T007 Wire interim session provider `app/providers/session-provider.tsx`
- [X] T008 Update proxy guard to respect client-session feature flag

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure Email Login (Priority: P1) 🎯 MVP

**Goal**: Allow users to authenticate with email/password using the interim client-store, producing a secure session cookie/state and redirecting to the main app.

**Independent Test**: Run Playwright login scenario with valid credentials, verify redirect to `/`, presence of session token, audit log entry, and failure path messages.

### Tests for User Story 1 (MANDATORY) ⚠️

- [X] T009 [P] [US1] Write unit tests for hashing + credential verification in `tests/unit/lib/auth/hash.test.ts`
- [X] T010 [P] [US1] Write unit tests for client-store session lifecycle in `tests/unit/lib/auth/client-store.test.ts`
- [X] T011 [P] [US1] Add Playwright login success/failure E2E in `tests/e2e/auth.login.spec.ts`

### Implementation for User Story 1

- [X] T012 [US1] Build login API stub in `app/api/auth/local/route.ts`
- [X] T013 [US1] Implement login form UI and validation in `app/components/auth/login-form.tsx`
- [X] T014 [US1] Compose login page at `app/auth/login/page.tsx` with provider integration
- [X] T015 [US1] Add audit logging helper in `lib/auth/audit.ts`
- [X] T016 [US1] Add instrumentation hooks in `lib/observability/auth-metrics.ts`

**Checkpoint**: User Story 1 is independently functional and meets quality gates

---

## Phase 4: User Story 2 - Remember Me & Session Persistence (Priority: P2)

**Goal**: Provide persistent sessions with remember-me, automatic redirect on expiration, and stored redirect path.

**Independent Test**: Playwright scenario toggles remember-me, closes/reopens browser (context isolation) and confirms session persists; another scenario verifies redirect to login when token expires.

### Tests for User Story 2 (MANDATORY) ⚠️

- [X] T017 [P] [US2] Write integration tests for remember-me session persistence in `tests/integration/auth/login-flow.test.tsx`
- [X] T018 [P] [US2] Extend Playwright coverage for remember-me + redirect in `tests/e2e/auth.login.spec.ts`

### Implementation for User Story 2

- [X] T019 [US2] Extend session store with remember-me expiry logic in `lib/auth/client-store.ts`
- [X] T020 [US2] Add remember toggle component in `app/components/auth/remember-toggle.tsx`
- [X] T021 [US2] Update proxy + session-provider to refresh token and preserve `redirectTo`
- [X] T022 [US2] Add route guard helper `lib/auth/guards.ts` for protected pages

**Checkpoint**: User Stories 1 and 2 operate independently with persistent sessions

---

## Phase 5: User Story 3 - Account Recovery Entry Points (Priority: P3)

**Goal**: Provide entry points to password recovery and optional SSO buttons, respecting feature flags and accessible UX.

**Independent Test**: Verify forgot password link navigates correctly with prefilled email; ensure SSO buttons appear when feature flag on and navigate to stub endpoints.

### Tests for User Story 3 (MANDATORY) ⚠️

- [X] T023 [P] [US3] Add unit tests for CTA visibility logic in `tests/unit/lib/auth/session-manager.test.ts`
- [X] T024 [P] [US3] Add Playwright coverage for recovery/SSO entry points in `tests/e2e/auth.login.spec.ts`

### Implementation for User Story 3

- [X] T025 [P] [US3] Add recovery links to login form respecting accessibility guidelines
- [X] T026 [US3] Implement social buttons component `app/components/auth/social-buttons.tsx`
- [X] T027 [US3] Add feature flag wiring and stub SSO route redirect handlers

**Checkpoint**: All user stories independently functional with recovery/SSO entry points

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consolidate documentation, telemetry, and handoff readiness

- [X] T028 Update `docs/architecture/login.md` with final implementation notes & migration plan
- [X] T029 Add login metrics dashboard wiring (console stub) in `lib/observability/auth-metrics.ts`
- [ ] T030 Run accessibility regression (`pnpm test:a11y`) and fix issues in login UI
- [X] T031 Update Quickstart instructions for local auth testing in `specs/002-login-module/quickstart.md`

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → User Stories in priority order (US1 → US2 → US3) → **Polish (Phase 6)**
- User stories can proceed in parallel once foundational tasks complete, but US2 depends on login store from US1; US3 depends on login UI from US1.
- Playwright/MSW test scaffolding must exist before implementing features to maintain TDD discipline.

## Implementation Strategy

1. Complete foundational local auth abstractions (hashing, store, session provider, middleware hook).
2. Deliver P1 login experience with tests and telemetry.
3. Layer remember-me persistence, ensuring refresh/redirect flows tested end-to-end.
4. Add recovery/SSO entry points gated behind feature flags.
5. Polish documentation, observability, and accessibility before handoff.

## Notes

- Tasks marked [P] operate on separate files and can run in parallel once prerequisites satisfied.
- Remove interim localStorage implementation when backend auth is ready; keep adapters to ease migration.
