# Decisions

A log of structural decisions and their reasoning. Add to this file whenever you make a decision that future-you (or a future contributor) will benefit from understanding.

When NOT to log here:
- Variable names, file organization within a feature, library APIs
- Anything reversible in < 1 hour

When to log:
- Choosing a dependency
- Reshaping the schema
- Changing how a cross-cutting concern works (auth, payments, push)
- Skipping or deferring something previously planned
- Anything where the next person will think "wait, why?"

Format per entry:
```
## NNNN · <Title>
**Date**: YYYY-MM-DD
**Status**: Decided / Superseded by NNNN / Reverted
**Context**: <what's the situation>
**Decision**: <what we're doing>
**Consequences**: <trade-offs accepted>
```

---

## Pre-seeded decisions

These were made during planning, before the repo was initialized. They're load-bearing — re-litigate only if a real constraint forces it.

---

## 0001 · Supabase over MongoDB + custom server
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: Two-sided marketplace with relational data (users → bookings → reviews → payments → payouts). Need auth, DB, storage, realtime, and server-side functions for webhooks. Free-tier-friendly.
**Decision**: Supabase as the single backend platform.
**Consequences**: One vendor for five concerns. RLS as the primary authorization layer (no separate middleware). Postgres relational integrity. Trade-offs accepted: vendor lock-in to Supabase's flavor of Postgres + edge functions; mitigation is the data layer abstraction in `lib/` (see 0014).

---

## 0002 · Expo over bare React Native
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: Solo dev (Claude Code), need fastest time to shipping, free EAS builds.
**Decision**: Expo SDK with the option to `expo prebuild` to bare RN later if needed.
**Consequences**: Some native modules can't run in Expo Go and require dev builds (Razorpay being the obvious one — see Phase 4). Trade-off accepted; the productivity gain pre-Phase 4 outweighs the friction.

---

## 0003 · Razorpay over Stripe
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: India market. UPI + cards + netbanking + wallets needed. INR domestic.
**Decision**: Razorpay for both payments and payouts (RazorpayX).
**Consequences**: Stripe alternative deferred. If we expand outside India, this becomes a migration task — but that's V2+ at earliest.

---

## 0004 · NativeWind over StyleSheet
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: Design system needs token-driven styling. Future marketing site will be web (Next.js + Tailwind), and sharing mental model has value.
**Decision**: NativeWind. Tokens defined in `lib/theme.ts`, exposed as Tailwind utilities.
**Consequences**: One additional build-time dependency; minor learning curve for anyone used to StyleSheet. Trade-off accepted.

---

## 0005 · Zustand for client state, TanStack Query for server state
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: Need predictable state, async data caching, optimistic updates. Don't want Redux.
**Decision**: Zustand for client-only state (forms drafts, UI toggles). TanStack Query for everything from Supabase.
**Consequences**: Two state libraries instead of one. Justified because the concerns are genuinely different — server state has caching, refetching, and invalidation needs that client state doesn't.

---

## 0006 · pnpm via Corepack, not global install
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: pnpm version drift across machines is a recurring pain.
**Decision**: Pin pnpm version in `package.json#packageManager`, enable Corepack.
**Consequences**: First-time setup needs `corepack enable` (one extra step in the README). Worth it for version consistency.

---

## 0007 · Biome over ESLint + Prettier
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: ESLint + Prettier setup is slow, fragile, and config-heavy.
**Decision**: Biome handles both lint and format.
**Consequences**: Smaller plugin ecosystem than ESLint. So far, no rule we want is missing. Reconsider if a needed rule is unavailable.

---

## 0008 · mise for runtime version management
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: nvm shell init is slow, asdf is broader than we need, multiple developers will need consistent versions eventually.
**Decision**: mise (`brew install mise`), pinned via `.mise.toml`.
**Consequences**: One more tool to install. Pays for itself the first time someone joins and gets consistent Node + Java in a single command.

---

## 0009 · Forward-only migrations, never edited after merge
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: Migrations as code, predictable rollouts, no surprises in production.
**Decision**: All schema changes are new files. Bug in `0003`? Write `0007_fix_thing_in_0003.sql`. Never edit `0003`.
**Consequences**: More files over time, slightly more SQL noise. Avoids the entire class of "the migration ran differently in prod" issues.

---

## 0010 · OrbStack over Docker Desktop on Apple Silicon
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: Docker Desktop's memory footprint and performance on Apple Silicon are noticeably worse than alternatives.
**Decision**: OrbStack for local Supabase containerization.
**Consequences**: Free for personal use; commercial use requires a license. If team grows, evaluate licensing.

---

## 0011 · Single Supabase region (Mumbai or Singapore) for V1
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: Multi-region adds complexity; V1 is India-only.
**Decision**: Single region. Pick whichever has lower latency from Goa once we measure.
**Consequences**: All users see one region's latency. Acceptable for V1; revisit if expanding outside South/Southeast Asia.

---

## 0012 · No staging environment in V1
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: Solo dev, simple stack, infrequent releases.
**Decision**: dev = local Supabase + a single shared cloud project. Production = a second cloud project. No third tier.
**Consequences**: No "staging" to test in before prod. Mitigation: Phase 6 has a beta tester pool that effectively functions as staging. Add staging when we hire a second dev.

---

## 0013 · Email auth fallback wired from day one (alongside phone OTP)
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: Indian SMS delivery via Supabase Auth's default Twilio integration is unreliable.
**Decision**: Both email and phone OTP available on every auth surface. User picks.
**Consequences**: More UI to design (two paths instead of one). Mitigation: phone OTP can fail and the user has a fallback in the same screen, no support ticket needed.

---

## 0014 · Data layer abstracted behind `lib/supabase.ts` only
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: We may migrate off Supabase post-funding (to AWS Postgres + Cognito). Want the migration to be one file change, not many.
**Decision**: Only `lib/supabase.ts` imports `@supabase/supabase-js`. All other code consumes via TanStack Query hooks that wrap Supabase calls.
**Consequences**: A small abstraction tax now. Pays off if the migration ever happens. If it never happens, the cost was minimal.

---

## 0015 · No PostGIS in V1; geographic search is city-string equality
**Date**: 2025-09 (planning)
**Status**: Decided
**Context**: True radius search needs PostGIS. PostGIS adds complexity and we don't have artist density to justify it yet.
**Decision**: Defer PostGIS to V1.1. Filter by `city` exact match in V1.
**Consequences**: Organizer search is less flexible than ideal. Surface this constraint clearly in the filter UI ("Showing artists in Goa" — not "near you").

---

## 0016 · Visual design system replaces existing Figma's visual direction
**Date**: 2025-10 (post-handoff to dev)
**Status**: Decided
**Context**: The existing Figma flow (founders) uses a generic "club app" aesthetic — dark navy + magenta gradient, neon-club mood. Wrong for a transactional product where users are wiring real money.
**Decision**: Build a new design system from scratch (lives in [`/Design_System`](../Design_System)). Use the existing Figma only as a reference for IA and screen flow. Visuals are net-new.
**Consequences**: Founders will see a different-looking app than they expected. Mitigation: present the new system + 3–5 hero screens with rationale before going wide.

---

## 0017 · No bottom-sheet toast / snackbar in V1
**Date**: 2025-10
**Status**: Decided
**Context**: Design System forbids toast/snackbar (§9). Confirmation patterns are inline (button label flips state, chip changes flavor).
**Decision**: When a confirmation is needed, change the source element's state in place. No floating notification surface.
**Consequences**: Some flows need rethinking (e.g. "Booking submitted" used to be a toast — now it's a full confirmation screen, see Phase 3 task 3.3).

---

## 0018 · Custom-rendered status bar instead of system status bar
**Date**: 2025-10
**Status**: Decided
**Context**: Design System §5.7 requires a custom 44pt status bar that composes over photos with the same scrim treatment. The system status bar can't do that.
**Decision**: Render our own. Implementation is the `StatusBar` primitive in `components/ui/`.
**Consequences**: Slight extra effort per screen (every screen renders `<StatusBar>` via `<Screen>`). Pays for itself on photo-led screens where the system bar would fight with the scrim.

---

## How to add an entry

1. Increment the highest existing number
2. Use the format above
3. Be specific in "Decision" — vague decisions don't help anyone
4. Be honest in "Consequences" — list what we're giving up, not just what we're gaining
5. If a decision is later reversed, don't delete it. Set `Status: Superseded by NNNN` and add the new entry below.

History is more valuable than tidiness here.