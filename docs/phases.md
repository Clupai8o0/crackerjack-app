# Phases

The build plan. Six phases over ~14 weeks. Each phase has a goal, a task list, and a "phase complete" definition. Don't skip ahead; phases gate each other.

For each phase: pick the next unfinished task, implement, verify, commit, update [`../CHANGELOG.md`](../CHANGELOG.md). Repeat until the phase's "done" criteria are met.

---

## Phase 1 · Foundation (Weeks 1–3)

**Goal:** A logged-in user with a chosen role lands on a styled placeholder home screen. All foundation pieces in place.

### Tasks

#### 1.1 Repo & infra
- [ ] Initialize Expo + TypeScript project, configure path aliases, install all stack deps
- [ ] Configure Biome (lint + format), TypeScript strict mode
- [ ] Set up GitHub Actions CI: typecheck + lint on every PR
- [ ] Create `eas.json` with development / preview / production profiles
- [ ] `.env.example` with all required keys

#### 1.2 Supabase
- [ ] Create hosted Supabase project (Mumbai or Singapore region)
- [ ] `supabase init`, link to remote, verify local stack runs
- [ ] Migration `0001_init.sql` — all V1 tables from [`data-model.md`](./data-model.md)
- [ ] Migration `0002_rls.sql` — RLS policies for all tables
- [ ] Migration `0003_indexes.sql` — required indexes
- [ ] Migration `0004_triggers.sql` — `set_updated_at`, `handle_new_user`, denormalized counters
- [ ] `supabase/seed.sql` — categories list, a few test artists/organizers, one completed booking with review
- [ ] Storage buckets `portfolios/`, `avatars/` with RLS

#### 1.3 Design system in code
- [ ] `lib/theme.ts` token export
- [ ] Tailwind config consuming theme tokens
- [ ] Fonts loaded (Inter, Instrument Serif, JetBrains Mono) via `expo-font`
- [ ] Wave 1 primitives: `Text`, `Pill`, `Button`, `IconButton`, `Avatar`
- [ ] Wave 2 primitives: `Input`, `FormField`, `Sheet`, `ListRow`
- [ ] Wave 3 chrome: `Screen`, `StatusBar`, `TabBar`
- [ ] Wave 4: `PhotoCard`, `Calendar`, `Glow`
- [ ] `app/dev/components.tsx` stories route showing every variant

#### 1.4 Auth
- [ ] `lib/supabase.ts` — Supabase client, secure storage, auth context provider
- [ ] Sign-in screen (email + password)
- [ ] Sign-up screen (email + password)
- [ ] Phone OTP screen (with email fallback wired since SMS in India is flaky)
- [ ] Role select screen (artist / organizer)
- [ ] Auth guard: redirect to `/sign-in` if no session, to `/role` if role null, to `/(app)/` otherwise
- [ ] Home placeholder showing the user's display name

#### 1.5 Observability
- [ ] Sentry wired, capturing crash test event
- [ ] PostHog wired, capturing app open + screen view events
- [ ] Document event names in `docs/conventions.md` §"Analytics events"

### Phase 1 done when

- Fresh clone → `pnpm install` → `pnpm start` → app runs in iOS sim
- New user can: sign up via email or phone → pick role → land on home placeholder showing their name
- `pnpm typecheck` and `pnpm lint` are green on `main`
- `supabase db reset` produces the same schema locally as in the hosted project
- Sentry shows the crash test event; PostHog shows the test session
- Stories route at `/dev/components` shows every primitive × every variant

### Phase 1 risks

- **Indian SMS delivery via Supabase Auth (Twilio default).** Email fallback must be wired from day one. If OTP delivery rates are unacceptable in beta, plan a switch to MSG91 via Edge Function — budget half a week.
- **RLS lockout.** Easy to write a policy that locks dev out of own data. Test every policy against three personas (artist, organizer, anonymous) before merging.

---

## Phase 2 · Artist side (Weeks 4–6)

**Goal:** An artist completes a profile, uploads portfolio media, marks dates unavailable, and sees incoming booking requests (mock until Phase 3 ships request creation).

### Tasks

#### 2.1 Onboarding flow
- [ ] Multi-step onboarding: bio → categories (multi-select) → languages + experience → pricing → service radius
- [ ] react-hook-form + zod schemas in `features/artist/schema.ts`
- [ ] Submit writes `artist_profiles` + `artist_categories` rows
- [ ] Skip-and-edit-later option from any step

#### 2.2 Portfolio
- [ ] Image picker (`expo-image-picker`) with client-side resize to max 2000px on long edge
- [ ] Video picker, 30s max, 50MB max
- [ ] Upload to Supabase Storage `portfolios/` with progress UI
- [ ] Portfolio grid with reorder (`react-native-draggable-flatlist`)
- [ ] Delete with confirmation sheet
- [ ] Cap at 10 items per Phase 1 mvp scope

#### 2.3 Availability
- [ ] Calendar UI (using `Calendar` primitive)
- [ ] Two-tap range selection to mark dates unavailable
- [ ] Persist to `availability_blocks`
- [ ] Indicator on profile when artist has next-7-days blocked

#### 2.4 Artist dashboard
- [ ] Three-tab shell: Pending / Upcoming / Past
- [ ] Booking row card with organizer avatar + name + event date + amount
- [ ] Empty state per tab (use `EmptyState` pattern)
- [ ] Pull-to-refresh

#### 2.5 Profile (own + public)
- [ ] Public artist profile route `/(app)/profile/[id]` — used by both organizer view and own preview
- [ ] Edit mode for own profile
- [ ] Replace avatar
- [ ] Manage portfolio order

### Phase 2 done when

- Artist can complete onboarding in under 5 minutes (per `00_project_overview.md` success criterion)
- Profile renders correctly when viewed by another user (anonymous read works)
- Blocked dates persist and survive app restart
- Two test artists can't overwrite each other's media (verified)

### Phase 2 risks

- **Video upload performance on poor connections.** Use `expo-file-system` upload session with progress. Hard-cap 50MB per clip.
- **Storage costs on Supabase free tier (1GB).** Resize images client-side. Monitor usage weekly.

---

## Phase 3 · Organizer side (Weeks 7–9)

**Goal:** An organizer searches, finds an artist, submits a booking request, and the artist can respond with accept/decline/counter.

### Tasks

#### 3.1 Discover
- [ ] Discover home screen with tile grid of artists
- [ ] Postgres function `search_artists(filters jsonb)` returning paginated results
- [ ] Filter sheet — category multi-select
- [ ] Filter sheet — city autocomplete (Google Places API)
- [ ] Filter sheet — price range (slider)
- [ ] Filter sheet — date availability
- [ ] Filter state persisted in URL params (Expo Router) so deep links work
- [ ] FlashList for virtualization

#### 3.2 Public profile (organizer view)
- [ ] Same component as artist's own profile preview, with "Request booking" CTA
- [ ] Reviews summary (count + average) — placeholder until Phase 5 ships review writes

#### 3.3 Booking request flow
- [ ] Multi-step: date+time → location (Google Places) → event type → brief → propose amount → review
- [ ] Submit writes `bookings` row with status `requested`
- [ ] Confirmation screen with timeline of next steps
- [ ] In-app badge for the artist (push lands in Phase 5)

#### 3.4 Counter-offer round-trip
- [ ] Artist accept / decline / counter actions on the booking row
- [ ] Counter creates new `proposed_amount` and sets status `countered`
- [ ] Organizer sees counter, can accept (→ `accepted`) or decline back (→ `declined`)

### Phase 3 done when

- Organizer can go from cold-open to submitted booking request in under 90 seconds
- Filter combinations narrow results correctly against the seed dataset
- Counter-offer round-trips between two test accounts
- Search returns < 500ms on the free tier with seed data

### Phase 3 risks

- **No PostGIS in V1.** Geographic search is `city = X` string equality. Surface this constraint in the filter UI; defer radius search to V1.1.
- **Race conditions on same-date bookings.** No exclusivity at schema level until payment locks it. Surface available dates but don't pretend the calendar is authoritative.

---

## Phase 4 · Transactions (Weeks 10–11)

**Goal:** Real money moves end-to-end. Razorpay test mode passes; live mode follows after KYC.

### Tasks

#### 4.1 Setup
- [ ] Razorpay account, test keys, KYC submission for live mode (takes 2–7 business days — start at Phase 4 day 1)
- [ ] RazorpayX account for payouts (separate approval)
- [ ] Switch app from Expo Go to development build (`eas build --profile development`) — Razorpay needs native SDK

#### 4.2 Payment
- [ ] Edge Function `create_order` — validates booking is `accepted`, creates Razorpay order
- [ ] React Native Razorpay SDK integration on booking confirmation screen
- [ ] Edge Function `razorpay_webhook` — signature verification, idempotency keyed on `razorpay_payment_id`
- [ ] Webhook updates `payments` row, transitions booking to `paid`
- [ ] Realtime subscription so client UI updates without polling

#### 4.3 Escrow & lifecycle
- [ ] Booking state machine guards (in Edge Functions, not client)
- [ ] Cron Edge Function: `paid` → `in_progress` at `event_date`
- [ ] 48-hour completion review window
- [ ] Mark complete UI for organizer
- [ ] Auto-release after window if no dispute

#### 4.4 Payout
- [ ] Payout account screen (bank: account + IFSC, OR UPI ID)
- [ ] Razorpay Fund Account creation via API → store `razorpay_fund_account_id`
- [ ] Edge Function `release_payout` calling Razorpay Payouts API
- [ ] Reconciliation cron (every 15 min) — retries failures, alerts on stuck records

#### 4.5 Cancellation & refund
- [ ] Organizer cancel before `in_progress` → full refund
- [ ] Artist cancel after `accepted` → full refund + strike in `audit_log`
- [ ] After `in_progress`: redirect to `support@crackerjack.info` (manual for V1)

### Phase 4 done when

- End-to-end test: organizer pays ₹100 in test mode → Razorpay shows captured → artist marks complete → payout simulated → status `released`
- Webhook signature verification rejects an invalid signature
- Duplicate webhook delivery is a no-op
- Live mode KYC approved and at least one ₹1 live transaction completed

### Phase 4 risks

- **Razorpay KYC turnaround.** 2–7 business days. Start day 1 of Phase 4.
- **RazorpayX (Payouts API) approval.** Separate process, may take longer. If it stalls, fall back to manual UPI handoff for V1 launch.
- **Trusting client for payment state.** Never. Webhook is truth; UI subscribes via Realtime.

---

## Phase 5 · Communication (Weeks 12–13)

**Goal:** Chat works in real time, push notifications fire on key events, reviews work after completed bookings.

### Tasks

#### 5.1 Chat
- [ ] Auto-create conversation when an organizer first messages or first submits a booking request
- [ ] Conversation list screen (inbox)
- [ ] Chat thread screen with Realtime subscription on `messages` filtered by `conversation_id`
- [ ] Day separators, read receipts via `read_at`
- [ ] Text only — no media in V1

#### 5.2 Push
- [ ] `expo-notifications` permission flow on first foreground after sign-in
- [ ] Store `expo_push_token` on `profiles`
- [ ] DB trigger on `notifications` insert → Edge Function `send_push` → Expo Push API
- [ ] Triggers wired for: booking request received, status change, new message, payout released

#### 5.3 Reviews
- [ ] After `completed`, both parties see "Leave review" CTA (push + in-app)
- [ ] Form: 1–5 stars + text body
- [ ] RLS: `reviews` insert blocked unless `bookings.status = 'completed'` between reviewer and reviewee
- [ ] `update_artist_avg_rating` trigger recomputes denormalized rating

#### 5.4 Settings
- [ ] Notification preferences screen — toggles for messages / booking updates / marketing (off by default)
- [ ] Stored on `profiles.notification_prefs` (jsonb)

### Phase 5 done when

- Two devices chat with sub-2-second message delivery
- Push arrives on receiving device within 5 seconds when app is backgrounded
- Cannot leave review without completed booking (RLS denial verified)

### Phase 5 risks

- **Expo Push best-effort.** Always write to `notifications` table first; push is delivery, not record. In-app inbox is source of truth.
- **Realtime over flaky 4G.** TanStack Query refetch-on-focus must cover gaps. Test with airplane mode toggling.

---

## Phase 6 · Polish & Beta (Week 14)

**Goal:** App is on TestFlight and Play Internal. Real artists and organizers using it for actual bookings.

### Tasks

#### 6.1 Quality
- [ ] Two-day bug bash — work both flows on both platforms, file issues
- [ ] Performance pass: 60fps target on FlashList scroll
- [ ] Bundle size audit, trim anything > 50KB without justification
- [ ] Accessibility audit per Design System floor: labels, 44pt targets, Dynamic Type, VoiceOver/TalkBack walkthrough

#### 6.2 Distribution setup
- [ ] Apple Developer Program enrollment (24–48 hr provisioning, start at Phase 6 day 1)
- [ ] Google Play Console enrollment
- [ ] App Store Connect listing: screenshots, description, privacy policy URL
- [ ] Play Store listing: same
- [ ] `eas submit` configured for both platforms

#### 6.3 Legal
- [ ] Privacy policy on `crackerjack.live/privacy`
- [ ] Terms of service on `crackerjack.live/terms`
- [ ] Razorpay required disclosures linked
- [ ] Push notification permission rationale string in `app.json`

#### 6.4 Beta launch
- [ ] TestFlight external link with first 25 beta users
- [ ] Play Internal Track with same group
- [ ] Feedback collection process (email or simple form)
- [ ] On-call rotation defined for support@crackerjack.info

### Phase 6 done when

- Artist can sign up and appear in search within 5 minutes
- Organizer can search → request → pay → review without leaving the app
- Money moves end-to-end on the live (not test) Razorpay account
- App doesn't crash on a 2-year-old Android with 4GB RAM (Samsung A23 or equivalent as test device)
- TestFlight build live with at least one external tester signed off

### Phase 6 risks

- **App Store review rejection.** Common: missing privacy policy, payment outside IAP. Razorpay for physical services is permitted (events are physical-world services); document this in review notes upfront.
- **Beta user quality.** 25 testers ≠ 25 useful sessions. Pick people who have actual upcoming bookings.

---

## Cross-cutting (every phase)

These apply throughout, not in any specific phase:

- Migration files are forward-only and idempotent where possible
- New table → new RLS policy in same PR
- New Edge Function → corresponding test in `supabase/functions/_tests/`
- Sentry breadcrumbs on user-initiated actions
- PostHog event for any new conversion step
- Loading + empty + error states present for every new list/screen
- Accessibility labels on new interactive elements
- `CHANGELOG.md` entry for every shipped unit
- Stale docs → updated same PR

---

## What's deliberately not in V1

Don't get tempted. These are V1.1 or later:

- Event ticketing
- Merchandise
- Token / reward system
- Subscription tiers, premium artist features
- Sound equipment / venue rental marketplace
- Multi-language UI (English only at launch)
- Web app (mobile-only)
- Complex availability/scheduling beyond block dates
- Group bookings, multi-artist events
- Disputes/arbitration tooling (manual via support email)
- Featured/boosted profiles
- Referral program
- Native admin app (Supabase Studio is enough until volume forces it)