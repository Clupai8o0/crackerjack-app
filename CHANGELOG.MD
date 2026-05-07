# Changelog

All shipped units of work, newest first. Format inspired by [Keep a Changelog](https://keepachangelog.com/), simplified for solo development.

Tags:
- `feat` — new feature or screen
- `fix` — bug fix
- `chore` — tooling, deps, refactor
- `db` — migration or RLS change
- `infra` — CI, EAS, environment
- `docs` — documentation only

Format per entry:
```
- <tag>(<phase>): <one-line summary>. (<commit short SHA>)
```

When the human owner needs to test something, list it under "**To test**" within the Unreleased section. Move to a dated section once they've signed off.

---

## Unreleased

### To test
- Run `pnpm ios` to build and launch the app in the iOS Simulator. Tap through: sign-up with email → confirm email in Inbucket (http://localhost:54324) → sign in → pick role (artist / organizer / both) → land on home showing your display name.
- Open the `/dev/components` route in the running simulator to visually verify all design system primitives (text scales, pills, buttons, avatar, photo cards, calendar, glow, empty state).
- `pnpm typecheck` and `pnpm lint` must both pass with no errors (they do as of latest commit).

### Shipped
- `chore(P1)`: Expo SDK 55 + TypeScript scaffold — package.json, tsconfig strict, path aliases, biome.json (lint+format), eas.json (dev/preview/prod profiles), .env.example, GitHub Actions CI.
- `db(P1)`: Supabase migrations 0001–0004 — all V1 tables, RLS policies, indexes, triggers (set_updated_at, handle_new_user, avg_rating, total_bookings).
- `db(P1)`: supabase/seed.sql — 2 test artists, 1 organizer, 1 completed booking + review.
- `feat(P1)`: Design system in code — lib/theme.ts tokens; NativeWind + Tailwind config consuming tokens; all 15 Wave 1–4 primitives (Text, Pill, Button, IconButton, Avatar, Input, FormField, Sheet, ListRow, Screen, StatusBar, TabBar, PhotoCard, Calendar, Glow); pattern components (EmptyState, SectionHeader, KeyboardScreen); dev stories route at /dev/components.
- `feat(P1)`: Auth flows — sign-in (email+password), sign-up (email+password), phone OTP with email fallback, role select screen; auth guard in root layout routing session → role → home.
- `feat(P1)`: Home placeholder — shows signed-in user's display name and role-aware copy.
- `infra(P1)`: Sentry + PostHog wired in root layout; typed analytics event wrappers in lib/analytics.ts.
- `chore(P1)`: Fixed version matrix — Expo SDK 55 uses RN 0.83.6 (not 0.79); aligned all native deps via `expo install --fix`; downgraded Sentry to 7.11.0 and Flash List to 2.0.2 per SDK pinning.
- `fix(P1)`: router.replace path trailing-slash TS error in app/_layout.tsx; biome.json excludes auto-generated env .d.ts files; native dirs regenerated against RN 0.83.6.

---

## Releases

_No releases yet. First release will be the Phase 1 milestone build (signed-in user lands on home screen with role)._