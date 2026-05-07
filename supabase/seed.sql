-- Seed data for local development. Idempotent — safe to re-run after supabase db reset.

do $$
declare
  artist1_id    uuid := '11111111-0000-0000-0000-000000000001';
  artist2_id    uuid := '11111111-0000-0000-0000-000000000002';
  organizer1_id uuid := '22222222-0000-0000-0000-000000000001';
  booking1_id   uuid := '33333333-0000-0000-0000-000000000001';
begin

  -- Auth users must exist before profiles (FK constraint)
  insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, raw_user_meta_data)
  values
    (artist1_id,    'arjun@test.crackerjack',  crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"display_name":"Arjun Sharma"}'::jsonb),
    (artist2_id,    'priya@test.crackerjack',  crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"display_name":"Priya Nair"}'::jsonb),
    (organizer1_id, 'rohan@test.crackerjack',  crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"display_name":"Rohan Mehta"}'::jsonb)
  on conflict (id) do nothing;

  -- Profiles (handle_new_user trigger may have already created them; upsert)
  insert into profiles (id, role, display_name, city, email)
  values
    (artist1_id,    'artist',    'Arjun Sharma', 'Goa',    'arjun@test.crackerjack'),
    (artist2_id,    'artist',    'Priya Nair',   'Mumbai', 'priya@test.crackerjack'),
    (organizer1_id, 'organizer', 'Rohan Mehta',  'Goa',    'rohan@test.crackerjack')
  on conflict (id) do update set
    role         = excluded.role,
    display_name = excluded.display_name,
    city         = excluded.city,
    email        = excluded.email;

  -- Artist profiles
  insert into artist_profiles (profile_id, bio, years_experience, languages, base_price, price_unit, service_radius_km)
  values
    (artist1_id, 'Open-format DJ based in Goa. 6 years playing beach weddings, silent discos, and club residencies.', 6, array['English', 'Hindi', 'Konkani'],  12000, 'per_event', 100),
    (artist2_id, 'Documentary photographer with a warm, candid style. Trained at NIFT Delhi.',                        4, array['English', 'Hindi', 'Malayalam'], 25000, 'per_event', 200)
  on conflict (profile_id) do nothing;

  -- Categories
  insert into artist_categories (artist_id, category)
  values
    (artist1_id, 'dj'),
    (artist2_id, 'photographer')
  on conflict do nothing;

  -- Completed booking for review aggregation testing
  insert into bookings (id, organizer_id, artist_id, event_date, event_end, location_text, event_type, brief, proposed_amount, final_amount, status)
  values (
    booking1_id,
    organizer1_id,
    artist1_id,
    now() - interval '10 days',
    now() - interval '10 days' + interval '4 hours',
    'Taj Vivanta, Goa',
    'Wedding reception',
    'Open-format set for 200 guests. Mix of Bollywood, house, and commercial.',
    12000, 12000, 'completed'
  )
  on conflict (id) do nothing;

  -- Review
  insert into reviews (booking_id, reviewer_id, reviewee_id, rating, body)
  values (
    booking1_id, organizer1_id, artist1_id, 5,
    'Arjun was exceptional — read the crowd perfectly and kept the dance floor packed all night.'
  )
  on conflict (booking_id, reviewer_id) do nothing;

end;
$$;
