# CLAUDE.md

You are working on **Crackerjack**, a two-sided mobile marketplace for performing artists and event organizers in India. This file is your operating manual. Read it at the start of every session.

---

## What we're building

A native mobile app (iOS + Android) where:
- **Artists** (DJs, photographers, magicians, dancers, etc.) create profiles, set availability, and receive booking requests.
- **Organizers** (event hosts, venue owners, headhunters) discover artists, book them, pay through escrow, and review them.
- Money moves end-to-end via Razorpay. No agents in the middle.

Target launch: India, with Goa as the wedge market. Single-region MVP.

Detailed product context: [`docs/architecture.md`](./docs/architecture.md), [`docs/phases.md`](./docs/phases.md).

---

## Your role

You are the primary developer. The human owner is hands-off and is not reviewing code line-by-line. They will:
- Test features in the simulator / on device once you ship them
- Answer truly blocking product questions when surfaced
- Never write code themselves

Therefore:
- **Make decisions.** When this doc and the others are silent on a detail, pick the conventional answer and move on. Note the decision in `docs/decisions.md` if it's structural.
- **Don't ask permission for routine choices.** "Should I use `useEffect` or `useLayoutEffect` here?" — pick one. "Should I name this `BookingCard` or `BookingRow`?" — pick one.
- **Do ask before** doing something irreversible, expensive, or off-spec: dropping a table in production, calling a paid third-party API, deleting files outside the working tree, deviating from the phases plan.
- **Always update [`CHANGELOG.md`](./CHANGELOG.md)** when you complete a unit of work. The owner reads this to know what to test.

---

## Documentation map

This file is the entry point. Read it every session, then drill into the relevant doc:

| File | What it covers | When to read |
|---|---|---|
| [`README.md`](./README.md) | Project intro, quick start commands | Once, at first session |
| [`CLAUDE.md`](./CLAUDE.md) | This file — operating manual, conventions, decision rules | Every session |
| [`CHANGELOG.md`](./CHANGELOG.md) | Living log of shipped work, items the owner needs to test | At session start (to know where you left off); update after every shipped unit |
| [`Design_System`](./Design_System) | Visual rules: colors, type, spacing, components, anti-patterns | Before any UI work |
| [`docs/architecture.md`](./docs/architecture.md) | System topology, flows (auth, booking, payment, push), security, failure modes | Before implementing anything that crosses layers |
| [`docs/data-model.md`](./docs/data-model.md) | Schema, enums, RLS policies, indexes, storage buckets, migration rules | Before any DB or migration work |
| [`docs/design-system.md`](./docs/design-system.md) | Code companion to `/Design_System` — file structure, primitive build order, anti-patterns in code | Before any UI work, alongside `/Design_System` |
| [`docs/phases.md`](./docs/phases.md) | Build sequence — what to build when, with acceptance criteria per phase | When picking the next task |
| [`docs/conventions.md`](./docs/conventions.md) | Code standards: TS style, file structure, naming, imports, state, forms, errors, git, testing, a11y | When unsure about a stylistic or structural choice |
| [`docs/decisions.md`](./docs/decisions.md) | Architecture decision log — what was chosen, why, and what was traded off | Read before making a structural decision; log new entries after |
| [`docs/getting-started.md`](./docs/getting-started.md) | First-time Mac Apple Silicon setup | The human reads this; you can skip unless you're advising on environment issues |

If a question isn't answered by any of these, see "What to ask the owner about" below.

---

## Current status

```
Current phase: 1 — Foundation
Last shipped: (uncommitted) Full Phase 1 scaffold — Expo 55, all design system primitives, auth flows, Supabase migrations, Sentry + PostHog
Next up: Create hosted Supabase project (task 1.2), then run supabase init + supabase link, apply migrations, verify local stack
```

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile | Expo SDK (latest stable) + TypeScript | Use Expo Router for navigation |
| Styling | NativeWind (Tailwind for RN) | Tokens from `lib/theme.ts`, see [`docs/design-system.md`](./docs/design-system.md) |
| State (client) | Zustand | One store per feature module |
| State (server) | TanStack Query | All Supabase reads go through it |
| Forms | react-hook-form + zod | Schemas in `features/*/schema.ts` |
| Lists | FlashList | Never plain `FlatList` for > 10 items |
| Backend | Supabase | Auth, Postgres, Storage, Realtime, Edge Functions |
| Payments | Razorpay | Test mode until Phase 4; live mode in Phase 4 |
| Push | Expo Push Notifications | Triggered via Edge Functions |
| Maps | `react-native-maps` + Google Places | Free tier OK for MVP |
| Errors | Sentry | Free tier, wired in Phase 1 end |
| Analytics | PostHog | Free tier, wired in Phase 1 end |
| Linting | Biome | Replaces ESLint + Prettier |
| Pkg mgr | pnpm via Corepack | Don't `npm i -g pnpm` |
| Node | v20 LTS via mise | Pinned in `.mise.toml` |

Detailed rationale in [`docs/architecture.md`](./docs/architecture.md).

---

## Repo structure

```
crackerjack-app/
├── app/                    # Expo Router routes
│   ├── (auth)/            # sign-in, sign-up, otp, role-select
│   ├── (app)/             # authenticated routes
│   ├── (booking)/         # booking flow
│   └── dev/               # dev-only routes (component stories)
├── components/
│   ├── ui/                # primitives (Text, Pill, Button, etc.)
│   └── patterns/          # compositions (HeroHeader, EmptyState, etc.)
├── features/              # feature modules
│   ├── auth/
│   ├── artist/
│   ├── booking/
│   ├── chat/
│   └── search/
├── lib/                   # supabase client, theme, utils, constants
├── hooks/                 # shared hooks
├── types/                 # shared TS types
├── supabase/
│   ├── migrations/        # forward-only SQL
│   └── functions/         # edge functions (Deno)
├── assets/                # fonts, images
├── docs/                  # this directory
├── CLAUDE.md
├── CHANGELOG.md
└── README.md
```

Strict rules:
- No raw `<View>` / `<Text>` from `react-native` in `app/` route files. Compose with primitives only.
- Hex colors live only in `lib/theme.ts`. Anywhere else, use Tailwind classes that reference theme tokens.
- One file per component, default export, PascalCase filename.
- Feature modules are self-contained: if `features/booking/` needs a component only it uses, the component lives there, not in `components/`.

Full conventions: [`docs/conventions.md`](./docs/conventions.md).

---

## Commands

```bash
# dev
pnpm start              # Metro
pnpm ios                # build + run iOS sim
pnpm android            # build + run Android emulator
pnpm typecheck          # tsc --noEmit
pnpm lint               # biome check
pnpm format             # biome format --write
pnpm test               # vitest (added in Phase 4 onwards)

# supabase
supabase start          # local stack
supabase db reset       # drop + reapply all migrations + seed
supabase migration new <name>  # create new migration file
supabase functions serve       # local edge functions

# build
eas build --profile development --platform ios|android
eas build --profile preview --platform ios|android
eas update --branch production
```

Run `pnpm typecheck && pnpm lint` before every commit. Both must pass.

---

## How to work on a task

1. **Read [`docs/phases.md`](./docs/phases.md)** to identify the next task in the current phase.
2. **Read the docs that task touches** — `docs/architecture.md` if it's a flow, `docs/data-model.md` if it's schema, `docs/design-system.md` + `Design_System` if it's UI.
3. **Plan briefly in chat** before writing — list the files you'll create or modify. Keeps you from drifting.
4. **Implement.** Small, focused, named for the thing it does.
5. **Verify**:
   - `pnpm typecheck` passes
   - `pnpm lint` passes
   - For UI: render the screen in the iOS sim, walk through every state (loading, empty, error, populated)
   - For DB: `supabase db reset`, then poke via Studio
   - For Edge Functions: invoke locally with a sample payload
6. **Commit** with a message that starts with the phase + task identifier:
   ```
   feat(P1): sign-in screen with email + password
   fix(P2): portfolio reorder no longer loses order on app restart
   chore: bump expo SDK
   ```
7. **Update [`CHANGELOG.md`](./CHANGELOG.md)** with a one-line summary under "Unreleased". The owner reads this to know what to test next.
8. **Open a draft PR** to `main`. CI must be green.

---

## Definition of done

A unit of work is done when:
- It does what `docs/phases.md` says it does
- TypeScript compiles, Biome is clean
- The acceptance criteria for that phase task in `docs/phases.md` are visibly met
- For UI: every state is implemented (loading / empty / error / populated)
- For DB: migration applies cleanly on a fresh `supabase db reset`
- For features touching auth or money: tested with at least two distinct user accounts
- `CHANGELOG.md` updated
- Commit pushed, CI green

If any of the above isn't true, it isn't done.

---

## Decision rules

When in doubt:
- **Performance vs. simplicity**: simplicity wins until something is measurably slow. Don't preoptimize.
- **Reusability vs. duplication**: prefer duplication once. Extract on the second use, never on the first.
- **Library vs. handroll**: handroll if it's < 50 lines and isn't security-sensitive. Library otherwise.
- **Optimistic vs. pessimistic UI**: optimistic for writes the server is unlikely to reject; pessimistic for payments and bookings.
- **Local state vs. server state**: anything that came from Supabase is server state, lives in TanStack Query, never in Zustand.
- **Conditional rendering vs. routes**: separate routes for separate screens, even if they share 80% of UI. Expo Router is cheap.

---

## What to ask the owner about

Surface these and stop:
- A product question that materially changes scope ("should artists be able to bid on open requests?" — that's a new feature, not a clarification)
- A legal/compliance question (KYC requirements, GST, refund policy specifics)
- A cost decision ("we'll exceed the Supabase free tier in 6 weeks at this rate")
- A name / brand / copy decision that's user-facing and non-obvious
- An ambiguity in the design system that touches more than one screen

What NOT to ask about:
- Implementation details (variable names, file organization, library choice within the stack)
- Any decision that's already covered in this doc or the docs in `/docs/`
- "Should I add X?" where X isn't in `docs/phases.md` — the answer is no, finish what's planned first

---

## Anti-patterns

Things you must not do, even when tempted:

- **Adding features outside the current phase.** If `docs/phases.md` says Phase 2 is artist-side, don't ship organizer search just because you can. Liquidity matters more than features.
- **Modifying merged migrations.** Migrations are forward-only. If a column was wrong, write `0007_fix_column.sql`, not `git push -f`.
- **Skipping RLS.** Every new table gets RLS the same PR. Never "I'll add it later."
- **Trusting the client for state.** Booking status, payment status, user roles — all live server-side. Client reflects, doesn't decide.
- **Building generic abstractions on the first occurrence.** No `<GenericList>` after one list use. Wait for the third.
- **Reaching for new dependencies.** The stack is fixed (see table above). Adding a new dep is a decision; log it in `docs/decisions.md` and justify it.
- **Using emoji as iconography.** Use Phosphor icons. The Design System forbids emoji UI.
- **Pure white, gradients, drop shadows.** Forbidden by the Design System. Re-read [`Design_System`](./Design_System) §9 if uncertain.
- **`console.log` in committed code.** Use Sentry breadcrumbs or remove.

---

## When something breaks

- Prefer reverting to debugging in production. `git revert <sha>`, push, investigate offline.
- For DB issues, never `psql` against production. Use Supabase Studio with caution; for write operations, write a migration.
- For auth issues, check RLS first, JWT second, network third. RLS is right >90% of the time.
- For payment issues, the Razorpay dashboard is source of truth. The app reflects it via the webhook.

---

## Files you must keep current

As you work:
- `CHANGELOG.md` — every shipped unit
- `docs/decisions.md` — every structural decision (new dep, schema reshape, scope change)
- This file (`CLAUDE.md`) — when conventions change, when commands change, when the stack shifts

If a doc is stale, update it the same PR as the change. Stale docs are a defect.