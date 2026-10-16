# Changelog

## B2 — Auth, roles, admin (2026-10-16)

Accounts for all four roles, forced first-login password change, and basic admin pages. Spec updated: COMPANION_SPEC §3.1 ("Accounts and passwords"), §15 (`refresh_tokens`), §16 (`PATCH /me`, admin temporary password). OPEN_QUESTIONS #15 resolved.

### API
- `users` per COMPANION_SPEC §15, plus `refresh_tokens` (first Alembic migration). Email is stored lower-cased and phone as `+8801XXXXXXXXX`. Login takes either one in a single field, and Bangla digits work.
- argon2 hashing. Passwords need ≥ 8 characters including a digit, the same rule the design's set-password checklist shows. When no account matches, login still runs a dummy hash check, so response time doesn't reveal which accounts exist. A deactivated account is only reported after the right password.
- **Sessions**: an access JWT (15 min, cookie path `/`) and a refresh JWT (30 days, cookie path `/api/v1/auth`), both `httpOnly` + `SameSite=Lax`. `Secure` is on via `COOKIE_SECURE`. Each refresh token's `jti` is stored, so logout, password change, temporary-password reset and deactivation revoke sessions. The refresh token isn't rotated: rotation would make two tabs refreshing at the same moment log each other out. Every request reloads the user, so deactivation takes effect immediately.
- `JWT_SECRET` (new in `.env.example`). If it's empty, the API uses a random key per process and logs a warning, so a fresh checkout still runs but sessions end on restart. docker-compose passes it through.
- **Forced password change**: the default `get_current_user` dependency refuses `must_change_password` users with 403 `password_change_required`. Only `GET /me` and `POST /auth/change-password` use the permissive variant, so every future endpoint is gated automatically. A test walks the OpenAPI schema and checks every non-public endpoint, so it also covers routes added in later phases. No current password is needed while replacing a temporary one, and the new password must differ from it.
- Role guard: `require_roles(...)` (`AdminUser` alias). It runs after the password-change gate.
- Admin: create specialist (verified, returns a one-time 12-character temporary password with no ambiguous characters), list, `PATCH {is_active}`, and `POST /admin/users/{id}/temporary-password` for manual resets of any non-admin (OPEN_QUESTIONS #15). Chamber location waits for the specialist directory (B8).
- `PATCH /me {preferred_locale}` remembers the language choice.
- Errors carry `detail.field` where a form field is at fault: `email_taken`, `phone_taken`, `invalid_email`, `invalid_phone`, `weak_password`, `identifier_required`, `organisation_required`, `wrong_password`, `password_unchanged`. Others: `invalid_credentials`, `account_inactive`, `not_authenticated`.
- Seed (idempotent): admin, parent, teacher, teacher2, doctor @demo.bd / `demo1234`. All names are fictional and the schools/clinic are labelled "Sample". The demo doctor is verified and has already changed their password. To show the forced change in a demo, create a specialist from the admin page.
- Tests: 96 total, covering sign-up/login/refresh/logout/change-password flows, cookie attributes, invalid tokens (expired, bad signature, refresh-as-access), role guards for every admin endpoint × role, the forced-change gate on every endpoint, deactivation, resets, identifier normalisation and the seed. The test DB is a fresh in-memory SQLite per test (StaticPool).

### Web
- Routes: `/login`, `/signup` (role choice) → `/signup?role=parent|teacher`, `/set-password`, `/home` (parent), `/teacher`, `/specialist`, `/admin`, `/admin/specialists/new`. The route groups `(auth) (parent) (teacher) (specialist) (admin)` each wrap their pages in a guard.
- Guards are client-side (`components/auth/gates.tsx`: `RequireRole`, `GuestOnly`, `PendingPasswordOnly`) and only decide what to show; the API enforces access. Logged-out users go to `/login?next=…`, and only same-app paths are accepted for `next`. A user who must change their password always lands on `/set-password`, and a wrong role goes to its own home. If the API is unreachable, the guards show an error with a retry.
- API client: on a 401 it refreshes the access cookie once (concurrent requests share one refresh) and retries. `useMe()` returns `null` when logged out instead of throwing. Logout does a full reload so no child data stays in memory.
- Language: sign-up stores the current locale. Logging in, or using the toggle while logged in, saves the choice. Opening `/` while logged in goes to your home in your saved language.
- Forms use react-hook-form + zod (both in the CLAUDE.md stack, added now). Client checks mirror the API's (password rule, BD phone). Server field errors appear on the matching input; other errors appear in an alert above the submit button.
- New `components/ui` primitives, named after the handoff: `Button` (+ `buttonClasses` for links), `TextField`, `ChoiceCard` (native radio), `Tabs` (pill, arrow keys), `Card`, `RoleBadge`, `StateView`. Screens follow Onboarding 02–04 copy and layout. Teacher/specialist/admin homes aren't designed (handoff §1), so they're plain placeholders.
- The landing page is now the splash with "Get started" / "Log in". The B1 API-status placeholder is removed. Page titles use `%s · সহযাত্রী`.
- `pnpm gen:api` now passes `--default-non-nullable false`, so request fields that have server defaults stay optional.
- Wordmarks copied from `design/assets/` to `public/brand/wordmark_{bn,en}.png`.

### Verified
- API: `alembic upgrade head`, `python -m app.seed` (twice: 5 created, then 0), `ruff check`, `ruff format --check`, `pytest` (96 passed).
- Web: `pnpm lint`, `pnpm typecheck`, prettier. In Chrome (desktop width), against a dev API and web on :8001/:3001:
  - wrong password shows a translated error;
  - admin creates a specialist (field validation, Bangla-digit phone) and the one-time password appears;
  - the specialist logs in with phone + temporary password, is forced to `/set-password`, can't reach `/specialist` until done, and the live rule checklist works;
  - after the change, the specialist home shows the verified badge, and the role guard bounces them off `/admin`;
  - the toggle saves `en`, and `/` reopens `/en/specialist`;
  - logged out, `/en/home` → `/en/login?next=%2Fhome`;
  - teacher sign-up in English: a duplicate email error shows on the email field, then success lands on `/en/teacher`;
  - refresh works through the Next rewrite with the path-scoped cookie;
  - admin re-issues a temporary password and deactivates/reactivates.
  - No console errors.
- **Not verified:** layout at 390 px (the Chrome window couldn't be resized again), `docker compose up --build` with this phase, and the 401 → refresh → retry path in the browser (the refresh endpoint and the API side are tested; the client retry was not exercised).

## B1 — Scaffold (2026-10-16)

Monorepo per CLAUDE.md §4. No product features yet: a Bangla placeholder landing page that checks the API.

### API (`apps/api`)
- FastAPI on Python 3.12 managed by uv. Settings via pydantic-settings (`DATABASE_URL`, `CORS_ORIGINS`); `.env.example` lists both.
- SQLAlchemy 2 engine/session (`app/core/db.py`) and declarative `Base` with a constraint naming convention (`app/models/base.py`). Alembic reads the URL from settings and uses batch mode so migrations work on SQLite. No migrations yet: the first arrives with the users table in B2.
- One error format for everything (`app/core/errors.py`): `ApiError` plus handlers for HTTP errors, validation errors and unhandled exceptions, all returning `{"error": {"code", "message_key", "detail"}}`. Validation errors list field locations and error types only, never the submitted values (they may be child data). `ErrorResponse` is documented as the `default` response on every `/api/v1` route, so the generated TS client types errors too.
- `GET /api/v1/health` runs `SELECT 1` and returns `{"status": "ok", "database": "ok"}`, or 503 `database_unavailable`. All API routes live under `/api/v1`, so "/health" in PROMPTS.md is `/api/v1/health`.
- CORS for `CORS_ORIGINS` with credentials (needed for the B2 cookies).
- `python -m app.seed` exists so the CLAUDE.md command chain runs; it seeds nothing until B2.
- ruff (lint + format) and pytest: 9 tests covering health, the DB-down error, CORS allow/deny, and every error handler.

### Web (`apps/web`)
- Next.js 16.4 (App Router, Turbopack, TypeScript strict), created with `create-next-app`. Its `cacheComponents` / `partialPrefetching` defaults are switched off: most pages will be per-user and cookie-driven, and plain dynamic rendering is simpler to reason about for the POC.
- Tailwind v4 with the **design handoff tokens** (OPEN_QUESTIONS #1): `src/styles/tokens.css` and `src/styles/theme.css` are copies of the handoff's `tokens.css` and `tailwind.v4.css`. Tokens are imported into the base layer so utilities always win. CLAUDE.md §7/§8 updated.
- Fonts: Hind Siliguri (body) and Baloo Da 2 (display), Bengali + Latin subsets, via `next/font/google` (self-hosted at build time; the first build needs internet).
- next-intl 4 with `[locale]` routing in `src/lib/i18n/`: `bn` default, `/` → `/bn`, Accept-Language detection off (Bangla-first). `src/proxy.ts` is Next 16's renamed middleware. Messages live in `messages/bn.json` and `messages/en.json`; message keys are type-checked, and `src/lib/i18n/messages-parity.ts` fails `pnpm typecheck` if the two files' keys differ. Uncertain Bangla strings are listed in `messages/_review.md`.
- `LanguageToggle` (`components/ui`, named as in the handoff) swaps the locale segment and keeps the path.
- TanStack Query provider. Typed API client: `pnpm gen:api` → `src/lib/api/schema.d.ts` (openapi-typescript, committed), `openapi-fetch` client, `unwrap()` that throws `ApiRequestError`, and `useErrorMessage()` that translates the API's `message_key` (unknown keys fall back to a generic message).
- The browser calls `/api/v1/*` on the web origin; `next.config.ts` rewrites it to FastAPI (`API_INTERNAL_URL`, default `http://localhost:8000`) so auth cookies stay first-party.
- Placeholder landing page based on the splash design (Onboarding 01): logo, promise line, "being built" note, live API status with a translated error and retry.
- ESLint (Next flat config + Prettier compat), Prettier, `pnpm typecheck` (`next typegen && tsc --noEmit`).
- Logo: `logo_shoho.png` isn't in the repo, so `design/assets/shohojatri-logo.png` was **copied** (not moved, since `design/` is read-only reference) to `public/brand/logo_shoho.png`, plus the English lockup as `logo_shoho_en.png`. The brand mark is the favicon (`src/app/icon.png`).
- `next dev` writes `apps/web/AGENTS.md`, which points coding agents at the Next docs bundled in `node_modules`. It's committed so the tree stays clean.

### Docker
- `docker-compose.yml`: `api` (migrates + seeds on start; SQLite on a named volume) and `web` (production build; the API address is a build arg because rewrites are compiled in). Postgres isn't wired up yet: set `DATABASE_URL` and add a driver when needed.

### Verified
- API: `uv sync && uv run alembic upgrade head && uv run python -m app.seed && uv run uvicorn app.main:app` starts; `ruff check`, `ruff format --check` and `pytest` pass.
- Web: `pnpm lint`, `pnpm typecheck`, `pnpm build` pass. With `pnpm dev` + API: `/` → 307 `/bn`; `/bn` and `/en` render with the right `<html lang>` and title; `/api/v1/health` is proxied to FastAPI. In Chrome, both locales render with the logo and Bangla fonts, the toggle switches locale, and stopping the API shows the translated "can't reach the server" message with a retry button.
- **Not verified:** `docker compose up --build`. The Docker daemon wasn't running, so only `docker compose config` was checked. Layout wasn't checked at a 390 px viewport (the browser window couldn't be resized).
