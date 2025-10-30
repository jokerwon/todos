# Login Module Architecture (Interim Client-Side Auth)

## Overview
- Implements email/password login entirely in the browser until server auth APIs are ready.
- Provides a client-side credential store (localStorage + in-memory cache) behind an `AuthAdapter` interface.
- Guards routes via middleware and Zustand session hook; feature flag `FEATURE_LOCAL_AUTH` gates the temporary mode.
- All flows emit structured audit events and telemetry to ease the eventual server migration.

## Components
- `lib/auth/hash.ts`: Web Crypto helpers (PBKDF2) for hashing credentials.
- `lib/auth/client-store.ts`: Handles credential CRUD, session issuance, remember-me persistence, failed attempt throttling.
- `lib/auth/guards.ts`: Utility functions for middleware and route protection.
- `app/hooks/use-session.ts`: Zustand store exposing session state & actions.
- `app/providers/session-provider.tsx`: Initializes session state and refresh timers.
- `app/api/auth/local/route.ts`: Stub API aligned with future server endpoints (`login`, `refresh`, `logout`).

## Data Flow
1. Login form submits to `/api/auth/local`.
2. Stub route calls `AuthAdapter` (currently client-store) to verify credentials.
3. On success, session token is stored (localStorage + memory) and cookie set via response headers (for middleware).
4. Middleware checks cookie & optional header; if absent, redirect to `/auth/login?redirectTo=...`.
5. Remember-me extends expiry; refresh timer re-issues token before expiration.

## Migration Plan
- Replace client-store implementation with server-backed adapter calling real API endpoints while preserving interface.
- Remove local credential persistence and disable `FEATURE_LOCAL_AUTH` in production builds.
- Reuse existing Playwright/MSW test scaffolding by swapping handlers to real network responses.

## Security Notes
- Hash before storing credentials; never persist plaintext password.
- Rate-limit login attempts with exponential backoff even in client mode.
- Clear sensitive data from memory on logout (`session-store.reset()`).

## Telemetry
- Record login attempts via `lib/observability/auth-metrics.ts`.
- Emit audit logs to console for now; future step is to POST to server logging endpoint.
