-- Add setup_complete flag to profiles.
-- Existing rows default to false; the auth guard will route them through setup.
alter table profiles
  add column if not exists setup_complete boolean not null default false;
