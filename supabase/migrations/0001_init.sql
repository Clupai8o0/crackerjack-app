-- Hosted Supabase installs uuid-ossp / pgcrypto into the `extensions` schema
-- and does not include it on the default search_path. Without this line,
-- unqualified calls like uuid_generate_v4() fail when migrations run via the
-- CLI (`supabase db push`). Locally the path already includes extensions, so
-- this is a no-op there.
set search_path = public, extensions;

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enums
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

-- profiles — extends auth.users
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            user_role,
  display_name    text,
  phone           text unique,
  email           text unique,
  avatar_url      text,
  city            text,
  country         text not null default 'IN',
  notification_prefs jsonb not null default '{}'::jsonb,
  expo_push_token text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- artist_profiles — 1:1 with profiles for artists
create table artist_profiles (
  profile_id        uuid primary key references profiles(id) on delete cascade,
  bio               text,
  years_experience  int,
  languages         text[],
  base_price        numeric,
  price_unit        price_unit,
  currency          text not null default 'INR',
  service_radius_km int,
  is_verified       bool not null default false,
  total_bookings    int not null default 0,
  avg_rating        numeric(2,1),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

-- artist_categories — many-to-many
create table artist_categories (
  artist_id  uuid not null references profiles(id) on delete cascade,
  category   artist_category not null,
  primary key (artist_id, category)
);

-- portfolio_items
create table portfolio_items (
  id           uuid primary key default uuid_generate_v4(),
  artist_id    uuid not null references profiles(id) on delete cascade,
  type         portfolio_type not null,
  storage_path text not null,
  caption      text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

-- availability_blocks — dates artist is NOT available
create table availability_blocks (
  id         uuid primary key default uuid_generate_v4(),
  artist_id  uuid not null references profiles(id) on delete cascade,
  start_date date not null,
  end_date   date not null,
  reason     text,
  created_at timestamptz not null default now()
);

-- bookings — central transactional entity
create table bookings (
  id              uuid primary key default uuid_generate_v4(),
  organizer_id    uuid not null references profiles(id),
  artist_id       uuid not null references profiles(id),
  event_date      timestamptz not null,
  event_end       timestamptz not null,
  location_text   text,
  location_lat    numeric,
  location_lng    numeric,
  event_type      text,
  brief           text,
  proposed_amount numeric,
  final_amount    numeric,
  currency        text not null default 'INR',
  status          booking_status not null default 'requested',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  constraint bookings_parties_differ check (organizer_id != artist_id),
  constraint bookings_event_end_after_start check (event_end > event_date)
);

-- payments — one per booking
create table payments (
  id                    uuid primary key default uuid_generate_v4(),
  booking_id            uuid not null unique references bookings(id),
  razorpay_order_id     text,
  razorpay_payment_id   text,
  amount                numeric not null,
  platform_fee          numeric,
  artist_payout         numeric,
  currency              text not null default 'INR',
  status                payment_status not null default 'pending',
  held_at               timestamptz,
  released_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- payout_accounts — artist bank/UPI details
create table payout_accounts (
  id                       uuid primary key default uuid_generate_v4(),
  artist_id                uuid not null references profiles(id) on delete cascade,
  account_holder           text,
  account_number_encrypted bytea,
  ifsc                     text,
  upi_id                   text,
  razorpay_fund_account_id text,
  is_verified              bool not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- conversations
create table conversations (
  id              uuid primary key default uuid_generate_v4(),
  booking_id      uuid references bookings(id),
  participant_a   uuid not null references profiles(id),
  participant_b   uuid not null references profiles(id),
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),
  constraint conversations_participants_differ check (participant_a != participant_b)
);

-- messages
create table messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(id),
  body            text not null,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- reviews
create table reviews (
  id           uuid primary key default uuid_generate_v4(),
  booking_id   uuid not null references bookings(id),
  reviewer_id  uuid not null references profiles(id),
  reviewee_id  uuid not null references profiles(id),
  rating       int not null check (rating between 1 and 5),
  body         text,
  created_at   timestamptz not null default now(),
  unique (booking_id, reviewer_id)
);

-- notifications
create table notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  data       jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- audit_log — append-only
create table audit_log (
  id         uuid primary key default uuid_generate_v4(),
  actor_id   uuid,
  action     text not null,
  subject    text not null,
  metadata   jsonb,
  created_at timestamptz not null default now()
);
