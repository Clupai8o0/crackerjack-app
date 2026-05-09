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

### Owner action required before testing
- ~~**Apply migration 0006** to hosted Supabase~~ — **DONE** 2026-05-09. All 6 migrations (0001–0006) are now applied. Required a one-line `set search_path = public, extensions;` at the top of 0001 and 0006 because hosted Supabase puts uuid-ossp in the `extensions` schema and doesn't include it on the default search path; locally this is a no-op.
- **Configure SMS provider in Supabase Auth** — the new flow's phone OTP step won't deliver SMS without this. Supabase dashboard → Auth → Providers → Phone → enable Twilio (or any supported provider) and paste credentials. Until this is done, `useSendPhoneOtp` will return an error at runtime and users will be stuck on the verify-phone screen.
- **Turn OFF "Confirm email"** in Supabase dashboard → Auth → Providers → Email. Code expects email-confirm-off — the new flow uses phone OTP as the sole verification gate.
- **Verify the `avatars` storage bucket exists** (public). If missing, profile screen silently skips avatar upload; create the bucket to enable it.
- **For end-to-end artist test**: after submitting an application, manually flip `is_verified = true` and `application_status = 'approved'` on the artist's `artist_profiles` row (Supabase Studio) to simulate admin approval. The app should let them through to `/(app)` on next launch.

### To test (auth flow rebuild — 2026-05-09)
The full new flow, end-to-end:
1. **Onboarding** (existing) → **Welcome** (existing, Google + Apple + email) → **Sign up** (now no "check your email" — completes silently) OR **Sign in**.
2. **Phone verification** (`/(auth)/verify-phone`, NEW): two-state screen — enter `+91XXXXXXXXXX`, then a 6-digit OTP. 30s resend cooldown. Wrong code shows inline error. After verify, `profiles.phone` and `profiles.phone_verified_at` should both be populated.
3. **Profile basics** (`/(auth)/setup/profile`, NEW): name + city required, optional avatar via image picker.
4. **Role select** (`/(auth)/role`, edited): three roles — Artist / Organizer / Attendee. Attendee copy: "I'm just here to look — Discover artists and follow events. (You can't book — yet.)"
5. **Branch by role**:
   - **Organizer / Attendee**: single confirmation screen → home.
   - **Artist**: 4-step details wizard (bio → categories → exp+langs → pricing+radius) → ID upload (front, back, selfie via front camera) → bank or UPI → submitted screen with Glow.
6. **Artist re-entry while pending**: kill and relaunch with `application_status='submitted'`, `is_verified=false` → routes to `/(auth)/waitlist`. After admin flips `is_verified=true`, next launch routes to `/(app)`.
7. **App restart for completed roles**: organizer / attendee / verified artist all land on `/(app)` directly without re-running setup.

Granular cases for each screen:

#### Artist application flow
- **Artist details screen** (`/(auth)/setup/artist/details`): 4-step wizard (bio → categories → experience+languages → rates+radius). Progress dots animate. Categories step cannot be skipped (min 1). Final Continue calls `useSaveArtistDetails` then pushes to ID step.
- **Photo ID screen** (`/(auth)/setup/artist/id`): Three upload tiles — ID Front, ID Back, Selfie (selfie uses front camera). Each tile shows dashed border while empty, image fill + Replace affordance after upload, spinner overlay while uploading. Continue only enabled when all three are uploaded.
- **Bank/UPI screen** (`/(auth)/setup/artist/bank`): Segmented toggle between UPI and Bank account modes. UPI: single field. Bank: account holder, account number, IFSC (auto-uppercase). On submit: `useSavePayoutAccount` → `useSubmitArtistApplication` → replaces to submitted screen.
- **Application submitted screen** (`/(auth)/setup/artist/submitted`): Centered headline with Glow behind it. Back gesture disabled. "Got it" → `/(app)`.
- **Waitlist screen** (`/(auth)/waitlist`): Shows "Under review" or "Application closed" depending on `application_status`. Submitted date in mono caption when pending. Sign out link at bottom.

#### Post-signup auth screens
- **verify-phone screen** (`/(auth)/verify-phone`): Two-step — enter +91 phone, receive 6-digit SMS, verify. Resend button with 30 s cooldown. "Sign out" link at bottom for already-authed users.
- **profile setup screen** (`/(auth)/setup/profile`): Name (required) + city (required) + optional avatar (tappable ring → image picker → uploads to `avatars` bucket). CTA writes to `profiles` via `useUpdateProfileBasics`. AuthGate routes forward.
- **role select screen** (`/(auth)/role`): New copy — "I'm an artist" / "I organize events" / "I'm just here to look" (attendee). Headline is "What brings you here?" in display-m + display-italic-m pair.
- **sign-up screen** (`/(auth)/sign-up`): "Check your email" branch removed. Auth completes immediately; AuthGate takes over routing.
- **organizer setup screen** (`/(auth)/setup/organizer`): Simplified to "You're set" + "Start exploring" — name/city now collected on profile screen.
- **attendee setup screen** (`/(auth)/setup/attendee`): New — "Welcome in" + "Start browsing" → `useCompleteSetup`.
- **otp.tsx removed**: Replaced by `verify-phone.tsx`.

### Shipped (auth flow rebuild — 2026-05-09)
- `db(P2)`: migration `0006_artist_application.sql` — `attendee` role enum value, `phone_verified_at` on profiles, `artist_application_status` enum + columns on artist_profiles, `artist_documents` table with RLS, `artist-kyc` private storage bucket with per-user + admin RLS.
- `feat(P2)`: phone verification gate — `/(auth)/verify-phone` single screen, two states (phone → OTP), 30s resend countdown. Uses `supabase.auth.updateUser({ phone })` + `verifyOtp({ type: 'phone_change' })` since users are already authed at this step.
- `feat(P2)`: profile basics screen captured before role select so all roles share the same identity surface.
- `feat(P2)`: role select rebuilt — three roles (artist / organizer / attendee), discovery-only attendee.
- `feat(P2)`: artist application sub-routes at `/(auth)/setup/artist/{details,id,bank,submitted}` — split out of the old monolithic setup screen. ID upload tiles with per-tile spinner. Bank/UPI segmented toggle. KYC files land in private `artist-kyc` bucket (path: `{userId}/{docType}.jpg`).
- `feat(P2)`: waitlist screen — pulls live application status, mono-formatted submitted-on date.
- `feat(P2)`: AuthGate routing rewritten — session → phone → profile basics → role → role-specific setup (or waitlist for artists). Loop-guarded; `useArtistApplication` query gated behind role=artist.
- `chore(P2)`: removed `app/(auth)/otp.tsx` (phone OTP is no longer an alt sign-in path); removed "check your email" branch from sign-up; simplified `setup/organizer.tsx` to a confirmation screen; added `setup/attendee.tsx` mirror.
- `feat(P2)`: new mutations — `useSendPhoneOtp`, `useVerifyPhoneOtp`, `useUpdateProfileBasics`, `useSaveArtistDetails`, `useUploadKycDocument`, `useSavePayoutAccount`, `useSubmitArtistApplication`, `useCompleteSetup`. New query `useArtistApplication`. New helper `lib/storage.ts#uploadKycFile` (uses `expo-file-system/legacy` + `base64-arraybuffer`).
- `docs`: `docs/decisions.md` 0019 — auth flow rebuild, supersedes 0013. Documents email-confirm-off + attendee-discovery-only + KYC-front-loaded decisions.

### To test (prior — Phase 1 baseline)
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