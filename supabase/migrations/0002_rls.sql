-- Enable RLS on all tables. Default-deny.
alter table profiles            enable row level security;
alter table artist_profiles     enable row level security;
alter table artist_categories   enable row level security;
alter table portfolio_items     enable row level security;
alter table availability_blocks enable row level security;
alter table bookings            enable row level security;
alter table payments            enable row level security;
alter table payout_accounts     enable row level security;
alter table conversations       enable row level security;
alter table messages            enable row level security;
alter table reviews             enable row level security;
alter table notifications       enable row level security;
alter table audit_log           enable row level security;

-- profiles
create policy "profiles: public read"
  on profiles for select using (true);

create policy "profiles: own update"
  on profiles for update using (auth.uid() = id);

-- artist_profiles
create policy "artist_profiles: public read"
  on artist_profiles for select using (true);

create policy "artist_profiles: own update"
  on artist_profiles for update using (auth.uid() = profile_id);

create policy "artist_profiles: own insert"
  on artist_profiles for insert with check (auth.uid() = profile_id);

-- artist_categories
create policy "artist_categories: public read"
  on artist_categories for select using (true);

create policy "artist_categories: own write"
  on artist_categories for insert with check (auth.uid() = artist_id);

create policy "artist_categories: own delete"
  on artist_categories for delete using (auth.uid() = artist_id);

-- portfolio_items
create policy "portfolio_items: public read"
  on portfolio_items for select using (deleted_at is null);

create policy "portfolio_items: own insert"
  on portfolio_items for insert with check (auth.uid() = artist_id);

create policy "portfolio_items: own update"
  on portfolio_items for update using (auth.uid() = artist_id);

create policy "portfolio_items: own delete"
  on portfolio_items for delete using (auth.uid() = artist_id);

-- availability_blocks
create policy "availability_blocks: public read"
  on availability_blocks for select using (true);

create policy "availability_blocks: own insert"
  on availability_blocks for insert with check (auth.uid() = artist_id);

create policy "availability_blocks: own update"
  on availability_blocks for update using (auth.uid() = artist_id);

create policy "availability_blocks: own delete"
  on availability_blocks for delete using (auth.uid() = artist_id);

-- bookings — organizer inserts, edge function updates
create policy "bookings: parties read"
  on bookings for select
  using (auth.uid() = organizer_id or auth.uid() = artist_id);

create policy "bookings: organizer insert"
  on bookings for insert
  with check (auth.uid() = organizer_id and status = 'requested');

-- payments — edge function only (service role bypasses RLS)
create policy "payments: parties read"
  on payments for select
  using (
    exists (
      select 1 from bookings b
      where b.id = booking_id
        and (b.organizer_id = auth.uid() or b.artist_id = auth.uid())
    )
  );

-- payout_accounts — own only
create policy "payout_accounts: own read"
  on payout_accounts for select using (auth.uid() = artist_id);

create policy "payout_accounts: own insert"
  on payout_accounts for insert with check (auth.uid() = artist_id);

create policy "payout_accounts: own update"
  on payout_accounts for update using (auth.uid() = artist_id);

-- conversations
create policy "conversations: participants read"
  on conversations for select
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "conversations: authenticated insert"
  on conversations for insert
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

-- messages
create policy "messages: participants read"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

create policy "messages: participant insert"
  on messages for insert
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

-- reviews — public read; insert only after completed booking
create policy "reviews: public read"
  on reviews for select using (true);

create policy "reviews: insert after completed booking"
  on reviews for insert
  with check (
    reviewer_id = auth.uid() and
    exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.status = 'completed'
        and (b.organizer_id = auth.uid() or b.artist_id = auth.uid())
    )
  );

-- notifications — own only
create policy "notifications: own read"
  on notifications for select using (auth.uid() = user_id);

create policy "notifications: own update (mark read)"
  on notifications for update using (auth.uid() = user_id);

-- audit_log — no client access
-- (service role only via edge functions)
