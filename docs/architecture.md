# Architecture

System design for the Crackerjack mobile app. Read this before implementing flows that cross layers (auth, payments, push, realtime).

---

## Topology

```
┌────────────────────────────────────────────────────────────┐
│                    Mobile App (Expo RN)                    │
│  Expo Router · Zustand · TanStack Query · NativeWind       │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTPS / WebSocket
                           ▼
┌────────────────────────────────────────────────────────────┐
│                         Supabase                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐     │
│  │   Auth   │ │ Postgres │ │ Storage  │ │  Realtime  │     │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘     │
│              ┌──────────────────────────┐                  │
│              │     Edge Functions       │                  │
│              │  (Deno: webhooks, jobs)  │                  │
│              └──────────────────────────┘                  │
└─────────┬──────────────────────────┬───────────────────────┘
          │                          │
          ▼                          ▼
   ┌───────────┐              ┌──────────────┐
   │ Razorpay  │              │  Expo Push   │
   │ (escrow)  │              │ Notifications│
   └───────────┘              └──────────────┘
```

Single-region deployment for MVP. Mumbai or Singapore — pick whichever has lower latency from Goa.

---

## Why this stack

Each choice exists because alternatives were considered and rejected. Don't relitigate without reading [`decisions.md`](./decisions.md).

- **Supabase over MongoDB + custom server**: marketplace data is fundamentally relational. RLS replaces a middleware authorization layer. One service replaces five.
- **Expo over bare React Native**: free EAS builds, OTA updates, no native toolchain pain. Can `expo prebuild` later if needed.
- **Razorpay over Stripe**: India market. UPI + cards + netbanking + wallets. Stripe doesn't serve INR-domestic well.
- **Edge Functions over a separate Node server**: zero ops, single deploy target, Deno's permission model is stricter. We can add a Hono-on-Vercel layer later for cron/admin if Edge Functions hit a wall.
- **NativeWind over StyleSheet**: same mental model as the marketing site we'll eventually build. Tailwind tokens map cleanly to design system tokens.

---

## Layers

### Mobile client

- Routes live in `app/` (Expo Router, file-based)
- Compose pages from `components/patterns/` and `components/ui/` only — no raw `react-native` primitives in route files
- Server reads always go through TanStack Query hooks in `features/*/queries.ts`
- Server writes always go through TanStack Query mutations in `features/*/mutations.ts`
- Client-only state (form drafts, UI toggles, current filters) lives in Zustand stores under `features/*/store.ts`
- All Supabase access through `lib/supabase.ts`. Never `import { createClient } from '@supabase/supabase-js'` outside that file.

### Database

- Postgres with RLS as the primary authorization mechanism
- Migrations in `supabase/migrations/` are forward-only — never edit a merged migration
- Soft delete on all tables via `deleted_at timestamptz`
- Audit log for sensitive operations (payouts, refunds, status changes) via `audit_log` table populated by Edge Functions

Full schema: [`data-model.md`](./data-model.md).

### Edge Functions

Located in `supabase/functions/`. One function per concern:

- `create_order` — creates Razorpay orders for accepted bookings
- `razorpay_webhook` — receives Razorpay events, verifies signatures, updates payment state
- `release_payout` — initiates Razorpay payouts to artist accounts
- `send_push` — sends Expo push notifications when triggered
- `reconcile_payments` — cron, retries failed payouts, alerts on stuck records
- `state_machine_advance` — cron, advances bookings from `paid` → `in_progress` at event start

Functions are responsible for state transitions. The client requests; the function decides.

### Storage

- Bucket `portfolios/` — public read, write only by owner. Path: `{artist_id}/{uuid}.{ext}`
- Bucket `avatars/` — same RLS pattern
- Image transformations via Supabase Image Transformation API (avoid loading full-res in lists)
- Migrate to Cloudflare R2 + Image Resizing if free tier is exceeded

### Realtime

- Chat: subscribe to `messages` table filtered by `conversation_id`
- Booking status: subscribe to `bookings` row by id
- Notifications: subscribe to `notifications` filtered by `user_id`

Subscribe at the screen level, unsubscribe on unmount.

---

## Key flows

### Auth

1. App launches → check `supabase.auth.getSession()`
2. No session → redirect to `/(auth)/sign-in`
3. Session exists → check `profiles.role`
4. Role null → redirect to `/(auth)/role`
5. Role set → `/(app)/`

Tokens stored in `expo-secure-store`. Never `AsyncStorage` (plaintext).

JWT carries `auth.uid()`. RLS policies use it directly. There is no separate authorization service.

### Booking lifecycle

State machine, enforced by Edge Functions. Status field: `bookings.status`.

```
[Organizer] search → view artist → send request                    status: 'requested'
        ↓
[Artist] receives push → views request
        ├── accept                                                  status: 'accepted'
        ├── decline                                                 status: 'declined' (terminal)
        └── counter (new amount)                                    status: 'countered'
              ↓
        [Organizer] accepts counter                                 status: 'accepted'
        ↓
[Organizer] pays via Razorpay → funds held                          status: 'paid'
        ↓
[Cron] event date arrives                                           status: 'in_progress'
        ↓
[Organizer] marks complete → 48hr window                            status: 'completed'
        ↓
[Cron or manual] release payout                                     payment.status: 'released'
        ↓
[Both] leave reviews
```

Client never writes `status` directly — it requests transitions, server validates and persists.

### Payment

1. Client → Edge Function `create_order` → Razorpay order ID returned
2. Client opens Razorpay UI (native SDK in dev build, not Expo Go)
3. User pays
4. Razorpay → webhook → Edge Function `razorpay_webhook`
5. Function verifies signature (mandatory, every request)
6. Function updates `payments` row, transitions `bookings.status` to `paid`
7. Client gets the update via Realtime subscription

Idempotency: webhook keyed on `razorpay_payment_id`. Duplicate deliveries are no-ops.

### Push

1. App requests permission on first foreground after sign-in
2. Stores `expo_push_token` on `profiles`
3. DB triggers on `notifications` insert → Edge Function `send_push`
4. Function calls Expo Push API with the recipient's token

The `notifications` table is source of truth. Push is best-effort delivery. The in-app inbox (Phase 5) reads from `notifications` directly.

---

## Security

Non-negotiables:
- All sensitive operations go through Edge Functions, never direct client → DB writes
- RLS is the safety net, not the primary boundary — but every table has RLS regardless
- Razorpay webhook signature verification on every request, not just first call
- Bank/UPI info encrypted at rest using Postgres `pgcrypto`
- No PII in client-side analytics; PostHog gets anonymized user IDs
- Phone OTP rate-limited via Supabase Auth settings
- JWT refresh handled by the Supabase client; we never inspect or mint tokens manually

What's intentionally out of scope for V1:
- 2FA beyond phone OTP
- Device fingerprinting
- Behavioral fraud detection
- Fine-grained admin RBAC (one `admin` role, manage via Studio)

---

## Failure modes

Document, don't pretend they don't exist:

| Mode | Mitigation |
|---|---|
| Payment held but artist payout account not verified | Block payout, notify both, escalate via Edge Function alert |
| Artist accepts then cancels last-minute | Refund organizer fully, mark artist with strike in `audit_log` |
| Organizer marks complete dishonestly | 48hr review window before payout release; artist can dispute via `support@crackerjack.info` (manual) |
| Push notification fails | Fall back to in-app badge; `notifications` table is truth |
| Razorpay webhook missed | Idempotent retries + reconciliation cron every 15 min |
| OTP not delivered (Indian SMS) | Allow email fallback on every screen that asks for OTP |
| Realtime disconnects on flaky 4G | TanStack Query refetch-on-focus covers gaps |
| Free-tier limits hit | Sentry alert wired to founder email; emergency upgrade path documented |

---

## Observability

- **Sentry** — crashes + JS errors. Breadcrumbs on every user-initiated action (sign-in, booking submit, payment).
- **PostHog** — funnels: signup → profile complete → first message → first booking → first payment.
- **Supabase logs** — queries, function invocations, auth events.

PII rules:
- Sentry: never log full user emails, names, or amounts. Hash to user IDs.
- PostHog: anonymize user IDs (no email, no phone).
- Supabase: respect query log retention (default is fine for free tier).

---

## What's deliberately simple

- **No microservices.** Everything is Supabase + a handful of Edge Functions.
- **No queue (BullMQ, SQS).** DB triggers + Edge Functions handle async at MVP scale.
- **No CDN config beyond Supabase defaults.**
- **No multi-region.** Single Supabase region.
- **No staging environment** until needed. Use Supabase branching when GA. Until then, dev = local + a single shared cloud project.
- **No automated UI tests** until a regression bites twice.

The complexity budget gets spent on the booking state machine, payment reliability, and design system. Everything else stays small.