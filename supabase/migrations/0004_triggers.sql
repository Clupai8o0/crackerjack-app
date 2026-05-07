-- Generic updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_artist_profiles_updated_at
  before update on artist_profiles
  for each row execute function set_updated_at();

create trigger trg_bookings_updated_at
  before update on bookings
  for each row execute function set_updated_at();

create trigger trg_payments_updated_at
  before update on payments
  for each row execute function set_updated_at();

create trigger trg_payout_accounts_updated_at
  before update on payout_accounts
  for each row execute function set_updated_at();

-- Auto-create profiles row on auth.users insert
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Recompute artist avg_rating after review insert
create or replace function update_artist_avg_rating()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update artist_profiles
  set avg_rating = (
    select round(avg(r.rating)::numeric, 1)
    from reviews r
    where r.reviewee_id = new.reviewee_id
  )
  where profile_id = new.reviewee_id;
  return new;
end;
$$;

create trigger trg_review_update_avg_rating
  after insert on reviews
  for each row execute function update_artist_avg_rating();

-- Increment total_bookings when booking is completed
create or replace function update_total_bookings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    update artist_profiles
    set total_bookings = total_bookings + 1
    where profile_id = new.artist_id;
  end if;
  return new;
end;
$$;

create trigger trg_booking_completed_total
  after update on bookings
  for each row execute function update_total_bookings();
