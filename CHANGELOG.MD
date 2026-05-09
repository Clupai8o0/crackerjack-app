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
- **Welcome screen (social-first)**: "Let's Log In" now shows Continue with Google / Continue with Apple buttons, then "Sign in with password" below. Google/Apple require OAuth credentials configured in Supabase dashboard before they work — see notes below.
- **Sign-up screen**: Shows email/password form + Google/Apple buttons below the "or continue with" divider.
- **Account setup — Artist**: After role select, artists and "both" users land on a 5-step wizard: (1) name + bio, (2) categories (multi-select pills), (3) years experience + languages, (4) pricing, (5) city + travel radius. Each step has "Skip this step". Final step has "Finish setup".
- **Account setup — Organizer**: After role select, organizers see a 2-field form (name + city) with "Start exploring".
- **Setup completion routing**: Once setup is complete, `setup_complete = true` is written to `profiles`. Re-opening the app should go directly to the home screen — not setup again.
- **Auth guard fix**: On app restart, role is now loaded from the DB profile (not just in-memory store). Users should no longer be re-routed to role selection after an app restart.
- **Migration 0005**: `supabase db reset` applies cleanly with the new `setup_complete boolean` column on `profiles`.

> **Social auth credentials needed** — Google: create OAuth 2.0 client in Google Cloud Console, add client ID to Supabase Auth settings and to `.env.local` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. Apple: configure Sign in with Apple in Apple Developer portal, add Service ID + key to Supabase Auth settings.

### Shipped
- `docs`: `docs/getting-started.md` §9 — added the iOS simulator code-signing gotcha (Personal Team + Apple Development cert + WWDR G3 intermediate) so future fresh-machine setups don't get blocked by the misleading "physical iOS devices" error when `expo-apple-authentication` is in plugins.
- `chore(P1)`: Expo SDK 55 + TypeScript scaffold — package.json, tsconfig strict, path aliases, biome.json (lint+format), eas.json (dev/preview/prod profiles), .env.example, GitHub Actions CI.
- `db(P1)`: Supabase migrations 0001–0004 — all V1 tables, RLS policies, indexes, triggers (set_updated_at, handle_new_user, avg_rating, total_bookings).
- `db(P1)`: supabase/seed.sql — 2 test artists, 1 organizer, 1 completed booking + review.
- `feat(P1)`: Design system in code — lib/theme.ts tokens; NativeWind + Tailwind config consuming tokens; all 15 Wave 1–4 primitives (Text, Pill, Button, IconButton, Avatar, Input, FormField, Sheet, ListRow, Screen, StatusBar, TabBar, PhotoCard, Calendar, Glow); pattern components (EmptyState, SectionHeader, KeyboardScreen); dev stories route at /dev/components.
- `feat(P1)`: Auth flows — sign-in (email+password), sign-up (email+password), phone OTP with email fallback, role select screen; auth guard in root layout routing session → role → home.
- `feat(P1)`: Onboarding carousel — 4-slide animated intro shown once (SecureStore persisted); floating orbs (Reanimated withRepeat), animated pagination dots (pill↔dot), per-slide content fade+slide-up; new auth welcome screen, forgot-password screen; redesigned sign-in, sign-up, role-select to match design with CJ mark + display heading pairing.
- `feat(P1)`: Home placeholder — shows signed-in user's display name and role-aware copy.
- `infra(P1)`: Sentry + PostHog wired in root layout; typed analytics event wrappers in lib/analytics.ts.
- `chore(P1)`: Fixed version matrix — Expo SDK 55 uses RN 0.83.6 (not 0.79); aligned all native deps via `expo install --fix`; downgraded Sentry to 7.11.0 and Flash List to 2.0.2 per SDK pinning.
- `fix(P1)`: router.replace path trailing-slash TS error in app/_layout.tsx; biome.json excludes auto-generated env .d.ts files; native dirs regenerated against RN 0.83.6.

---

## Releases

_No releases yet. First release will be the Phase 1 milestone build (signed-in user lands on home screen with role)._