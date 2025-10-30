# Implementation Plan: Login Module

**Branch**: `002-login-module` | **Date**: 2025-10-29 | **Spec**: [specs/002-login-module/spec.md](spec.md)
**Input**: Feature specification from `/specs/002-login-module/spec.md`

## Summary

Deliver a secure login workflow using a temporary client-side credential & session store (localStorage + in-memory cache) while the backend authentication service is under development. The plan covers email/password login, remember-me persistence, and recovery/SSO entry points, all wrapped with linting, automated testing, WCAG-compliant UI, and telemetry. When the server auth API is ready, the storage adapter can be swapped with minimal surface changes.

## Technical Context

**Language/Version**: TypeScript 5.9 with Next.js 16 (React 19)
**Primary Dependencies**: Next.js App Router, React 19, Zustand, Zod, Tailwind CSS 4.1, MSW, localStorage APIs, Web Crypto
**Storage**: LocalStorage (temporary) + in-memory cache; abstraction layer prepared for future server tokens
**Testing**: Vitest (unit), MSW-backed integration tests, Playwright (E2E)
**Target Platform**: Web (Next.js deployed to Vercel/staging)
**Project Type**: Single Next.js project
**Performance Goals**: Login action p95 < 300 ms (client-side validation), remember-me refresh < 200 ms, login page LCP < 2 s on 3G Fast
**Constraints**: No plaintext credential storage; must hash before saving locally, WCAG 2.1 AA compliance, instrument login metrics for audits
**Scale/Scope**: Single-user/local testing now; architecture must support multi-user remote auth later without rewriting UI

## Constitution Check

- **Code Quality Excellence**: Use ESLint flat config, Prettier, strict TypeScript settings, shared auth utilities in `lib/auth`, document interim client-store rationale in `docs/architecture/login.md`. ✅
- **Test Discipline & Coverage**: Author unit tests (hashing, session manager), integration tests (MSW-backed login flows), and Playwright scenarios (success, failure, remember-me, redirect). Wire into CI before implementation. ✅
- **Consistent User Experience**: Reuse shadcn form components, provide bilingual accessible error messaging, align with design tokens and layout guidelines, schedule design review. ✅
- **Performance Stewardship**: Instrument login attempt metrics, implement exponential backoff on repeated failures, and ensure local session refresh stays under defined budgets. ✅

## Project Structure

### Documentation (this feature)

```text
specs/002-login-module/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── auth-client.openapi.json
└── tasks.md          # generated later via /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── auth/login/page.tsx
├── auth/forgot-password/page.tsx       # existing or stubbed entry
├── api/auth/local/route.ts             # temporary local auth stub (mirrors future server API)
├── components/auth/
│   ├── login-form.tsx
│   ├── remember-toggle.tsx
│   └── social-buttons.tsx
├── hooks/
│   └── use-session.ts                  # Zustand store for client sessions
└── providers/
    └── session-provider.tsx            # wraps app with session context

lib/
├── auth/client-store.ts                # localStorage-backed credential/session store
├── auth/hash.ts                        # Web Crypto helpers
├── auth/guards.ts                      # route guards + middleware utilities
└── observability/auth-metrics.ts       # login telemetry helpers

middleware.ts                           # extend to check client session state before redirect

tests/
├── unit/lib/auth/client-store.test.ts
├── unit/lib/auth/hash.test.ts
├── unit/lib/auth/session-manager.test.ts
├── integration/auth/login-flow.test.tsx
└── e2e/auth.login.spec.ts
```

**Structure Decision**: Keep the Next.js workspace single-project layout. Introduce `lib/auth` abstractions so swapping the storage provider later (from localStorage to server API) is a drop-in change. Dedicated `use-session` hook centralizes client session state.

## Complexity Tracking

No constitutional violations. Documented migration path to server-side auth prevents ad-hoc complexity later.
