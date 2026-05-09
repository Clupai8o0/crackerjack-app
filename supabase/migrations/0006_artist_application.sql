-- See 0001_init.sql for the rationale on this — search_path needs widening
-- per migration session on hosted Supabase to resolve uuid_generate_v4().
set search_path = public, extensions;

-- Migration: artist application flow
--
-- Rationale:
-- 1. Artists go through a KYC / application pipeline before they can accept bookings.
--    This migration adds the state machine columns (application_status,
--    application_submitted_at) to artist_profiles and creates the artist_documents
--    table that holds references to the three uploaded ID images stored in the
--    private 'artist-kyc' bucket.
-- 2. `attendee` is a new first-class role for users who only want to discover
--    and attend events — no booking or listing capability.
-- 3. phone_verified_at is separated from `phone` so we can distinguish "user
--    provided a phone" from "user has verified it via OTP".

-- ─── enums ────────────────────────────────────────────────────────────────────

alter type user_role add value if not exists 'attendee';

create type artist_application_status as enum ('draft', 'submitted', 'approved', 'rejected');

-- ─── profiles ─────────────────────────────────────────────────────────────────

alter table profiles
  add column if not exists phone_verified_at timestamptz;

-- ─── artist_profiles ──────────────────────────────────────────────────────────

alter table artist_profiles
  add column if not exists application_status artist_application_status not null default 'draft',
  add column if not exists application_submitted_at timestamptz;

-- ─── artist_documents ─────────────────────────────────────────────────────────

create table artist_documents (
  id           uuid primary key default uuid_generate_v4(),
  artist_id    uuid not null references profiles(id) on delete cascade,
  doc_type     text not null check (doc_type in ('id_front', 'id_back', 'selfie')),
  storage_path text not null,
  created_at   timestamptz not null default now(),
  unique (artist_id, doc_type)
);

alter table artist_documents enable row level security;

create policy "artist_documents: own select"
  on artist_documents for select
  using (auth.uid() = artist_id);

create policy "artist_documents: own insert"
  on artist_documents for insert
  with check (auth.uid() = artist_id);

create policy "artist_documents: own update"
  on artist_documents for update
  using (auth.uid() = artist_id);

create policy "artist_documents: own delete"
  on artist_documents for delete
  using (auth.uid() = artist_id);

-- Admins can read all documents for review.
create policy "artist_documents: admin select"
  on artist_documents for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- ─── storage: artist-kyc bucket ───────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('artist-kyc', 'artist-kyc', false)
on conflict do nothing;

-- Artists may manage objects under their own uid prefix.
create policy "artist-kyc: own insert"
  on storage.objects for insert
  with check (
    bucket_id = 'artist-kyc'
    and starts_with(name, auth.uid()::text || '/')
  );

create policy "artist-kyc: own select"
  on storage.objects for select
  using (
    bucket_id = 'artist-kyc'
    and starts_with(name, auth.uid()::text || '/')
  );

create policy "artist-kyc: own update"
  on storage.objects for update
  using (
    bucket_id = 'artist-kyc'
    and starts_with(name, auth.uid()::text || '/')
  );

create policy "artist-kyc: own delete"
  on storage.objects for delete
  using (
    bucket_id = 'artist-kyc'
    and starts_with(name, auth.uid()::text || '/')
  );

-- Admins can read every object in the bucket for KYC review.
create policy "artist-kyc: admin select"
  on storage.objects for select
  using (
    bucket_id = 'artist-kyc'
    and exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
