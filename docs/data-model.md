# Data Model

Postgres on Supabase. RLS for authorization. Forward-only migrations in `supabase/migrations/`.

This doc is the schema source of truth. When you change the DB, change this doc in the same PR.

---

## Conventions

- Every table has `created_at timestamptz default now()` and (where mutable) `updated_at timestamptz`.
- Every table has `deleted_at timestamptz` for soft delete. Never hard-delete.
- Primary keys are `uuid` defaulting to `uuid_generate_v4()` (uuid-ossp extension).
- Foreign keys reference `auth.users.id` indirectly through `profiles.id`.
- Enum types live in the `public` schema, named `<entity>_<attribute>` or just `<attribute>` when unambiguous.
- All money is `numeric` with currency stored alongside (default `'INR'`).
- All timestamps are `timestamptz`. Never `timestamp` without timezone.

---

## Extensions

```sql
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
```

PostGIS not enabled in V1. Geographic search uses city string equality. Add PostGIS in V1.1 when artist density justifies radius search.

---

## Enums

```sql
create type user_role as enum ('artist', 'organizer', 'both', 'admin');
create type price_unit as enum ('per_hour', 'per_event', 'per_day');
create type artist_category as enum (
  'dj', 'fire_led_dancer', 'magician', 'emcee', 'photographer',
  'instrumentalist', 'singer_band', 'lifestyle_painter', 'model', 'drone_specialist'
);
create type portfolio_type as enum ('image', 'video');
create type booking_status as enum (
  'requested', 'countered', 'accepted', 'declined',
  'paid', 'in_progress', 'completed', 'cancelled', 'disputed'
);
create type payment_status as enum ('pending', 'held', 'released', 'refunded', 'failed');
```

---

## Core tables

### `profiles`
Extends `auth.users`. Created on first sign-in via a trigger.
```
id              uuid PK / FK auth.users.id
role            user_role nullable          -- null until role-select screen
display_name    text
phone           text unique
email           text unique
avatar_url      text
city            text
country         text default 'IN'
notification_prefs jsonb default '{}'::jsonb
expo_push_token text                         -- registered after permission grant
created_at      timestamptz default now()
updated_at      timestamptz default now()
deleted_at      timestamptz
```

### `artist_profiles`
1:1 with `profiles` where `role` includes artist.
```
profile_id        uuid PK / FK profiles.id
bio               text
years_experience  int
languages         text[]
base_price        numeric
price_unit        price_unit
currency          text default 'INR'
service_radius_km int
is_verified       bool default false
total_bookings    int default 0               -- denormalized, updated by trigger
avg_rating        numeric(2,1)                 -- denormalized, updated by trigger
created_at        timestamptz default now()
updated_at        timestamptz default now()
deleted_at        timestamptz
```

### `artist_categories`
Many-to-many between artist and categories.
```
artist_id  uuid FK profiles.id
category   artist_category
PRIMARY KEY (artist_id, category)
```

### `portfolio_items`
```
id           uuid PK
artist_id    uuid FK profiles.id
type         portfolio_type
storage_path text                              -- Supabase Storage object path
caption      text
sort_order   int default 0
created_at   timestamptz default now()
deleted_at   timestamptz
```

### `availability_blocks`
Dates the artist is NOT available. Easier than tracking when they ARE.
```
id         uuid PK
artist_id  uuid FK profiles.id
start_date date
end_date   date
reason     text
created_at timestamptz default now()
```

### `bookings`
The central transactional entity.
```
id              uuid PK
organizer_id    uuid FK profiles.id
artist_id       uuid FK profiles.id
event_date      timestamptz
event_end       timestamptz
location_text   text
location_lat    numeric
location_lng    numeric
event_type      text
brief           text
proposed_amount numeric
final_amount    numeric
currency        text default 'INR'
status          booking_status default 'requested'
created_at      timestamptz default now()
updated_at      timestamptz default now()
deleted_at      timestamptz

CHECK (organizer_id != artist_id)
CHECK (event_end > event_date)
```

### `payments`
One row per booking (in V1; partial payments not supported).
```
id                    uuid PK
booking_id            uuid FK bookings.id UNIQUE
razorpay_order_id     text
razorpay_payment_id   text
amount                numeric
platform_fee          numeric
artist_payout         numeric
currency              text default 'INR'
status                payment_status default 'pending'
held_at               timestamptz
released_at           timestamptz
created_at            timestamptz default now()
updated_at            timestamptz default now()
```

### `payout_accounts`
```
id                       uuid PK
artist_id                uuid FK profiles.id
account_holder           text
account_number_encrypted bytea           -- pgcrypto
ifsc                     text
upi_id                   text
razorpay_fund_account_id text
is_verified              bool default false
created_at               timestamptz default now()
updated_at               timestamptz default now()
```

### `conversations`
```
id              uuid PK
booking_id      uuid FK bookings.id NULL  -- conversation can pre-date booking
participant_a   uuid FK profiles.id
participant_b   uuid FK profiles.id
last_message_at timestamptz
created_at      timestamptz default now()

CHECK (participant_a != participant_b)
```

### `messages`
```
id              uuid PK
conversation_id uuid FK conversations.id ON DELETE CASCADE
sender_id       uuid FK profiles.id
body            text
read_at         timestamptz
created_at      timestamptz default now()
```

### `reviews`
```
id           uuid PK
booking_id   uuid FK bookings.id
reviewer_id  uuid FK profiles.id
reviewee_id  uuid FK profiles.id
rating       int CHECK (rating BETWEEN 1 AND 5)
body         text
created_at   timestamptz default now()

UNIQUE (booking_id, reviewer_id)   -- one review per direction per booking
```

### `notifications`
```
id         uuid PK
user_id    uuid FK profiles.id
type       text
title      text
body       text
data       jsonb
read_at    timestamptz
created_at timestamptz default now()
```

### `audit_log`
Sensitive operations write here. Read-only after insert.
```
id         uuid PK
actor_id   uuid                          -- profile id or system
action     text                          -- e.g. 'booking.cancel', 'payout.release'
subject    text                          -- e.g. 'booking:{uuid}', 'payment:{uuid}'
metadata   jsonb
created_at timestamptz default now()
```

---

## Triggers

- `set_updated_at()` — generic `before update` trigger, applied to every table with `updated_at`
- `handle_new_user()` — `after insert` on `auth.users`, creates corresponding `profiles` row
- `update_artist_avg_rating()` — `after insert` on `reviews`, recomputes denormalized rating
- `update_total_bookings()` — `after update` on `bookings` when status transitions to `completed`

---

## Indexes

| Table | Index | Purpose |
|---|---|---|
| `artist_categories` | `(category)` | Browse by category |
| `bookings` | `(artist_id, event_date)` | Availability checks |
| `bookings` | `(organizer_id, status)` | Organizer dashboard |
| `bookings` | `(artist_id, status)` | Artist dashboard |
| `messages` | `(conversation_id, created_at desc)` | Chat scroll |
| `reviews` | `(reviewee_id)` | Profile aggregation |
| `notifications` | `(user_id, created_at desc) where read_at is null` | Inbox unread |
| `portfolio_items` | `(artist_id, sort_order)` | Profile portfolio render |
| `availability_blocks` | `(artist_id, start_date, end_date)` | Availability lookup |

PostGIS index on `bookings.location_*` deferred to V1.1.

---

## RLS policies

Every table has RLS enabled. Default-deny.

### `profiles`
- Read: anyone (public profile)
- Update: only own (`auth.uid() = id`)
- Delete: never (soft delete only, via Edge Function)

### `artist_profiles`
- Read: anyone
- Update: only own (`auth.uid() = profile_id`)

### `artist_categories`
- Read: anyone
- Insert/Delete: only own

### `portfolio_items`
- Read: anyone
- Insert/Update/Delete: only own (`auth.uid() = artist_id`)

### `availability_blocks`
- Read: anyone (organizers need to see blocked dates)
- Insert/Update/Delete: only own

### `bookings`
- Read: organizer or artist on the booking (`auth.uid() in (organizer_id, artist_id)`)
- Insert: organizer creates (`auth.uid() = organizer_id` AND status = 'requested')
- Update: only via Edge Function (RLS denies direct writes; functions use service role)

### `payments`
- Read: parties to the booking (joined through `bookings`)
- Write: only via Edge Function (service role)

### `payout_accounts`
- Read/Write: only own (`auth.uid() = artist_id`)
- Encrypted columns never returned in raw form to the client

### `conversations`
- Read: participant (`auth.uid() in (participant_a, participant_b)`)
- Insert: any authenticated user (with check that they're a participant)
- Update: only `last_message_at` (via trigger or function)

### `messages`
- Read: participants of the conversation
- Insert: must be participant; `sender_id = auth.uid()` enforced

### `reviews`
- Read: anyone
- Insert: only if a `bookings` row with `status = 'completed'` exists between reviewer and reviewee, and reviewer is the `auth.uid()`
- Update/Delete: never

### `notifications`
- Read: only own
- Insert: only via Edge Function (service role)
- Update: only own (to set `read_at`)

### `audit_log`
- Read: admin role only
- Insert: only via Edge Function

---

## Storage buckets

### `portfolios`
- Public read
- Authenticated write, path enforced as `{auth.uid()}/...`
- Max object size: 50 MB (videos), 10 MB (images, before resize)

### `avatars`
- Public read
- Authenticated write, path enforced as `{auth.uid()}/...`
- Max object size: 5 MB

---

## Migration strategy

- One migration file per logical change. Don't batch unrelated schema changes.
- Naming: `NNNN_short_description.sql` — `NNNN` is a 4-digit incrementing number, padded with zeros.
- Every migration ends with `commit;` implicitly. No transactions split across files.
- `supabase db reset` must succeed against a fresh database. Test before merging.
- Never edit a merged migration. To fix, write a forward correction (`0007_fix_typo_in_column_name.sql`).

---

## Seed data

`supabase/seed.sql` — runs after `supabase db reset`. Contains:

- Sample categories for the picker
- A few test artist profiles with portfolios (for organizer-side dev work)
- A few test organizer profiles
- One sample completed booking with a review (for review aggregation testing)

Seed should be idempotent — it can be re-run without error.