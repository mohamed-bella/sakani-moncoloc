-- MIGRATION 008 — Add last_seen_at to profiles for activity tracking

alter table public.profiles
  add column if not exists last_seen_at timestamptz default now();

-- RPC function to allow authenticated users to explicitly bump their last_seen_at timestamp
-- We use a standard function (not security definer) because RLS on profiles allows users
-- to update their own row anyway. BUT using a function here makes it easy to call from
-- the frontend without building a heavy update query. Let's stick to a simple UPDATE.

create or replace function public.touch_user_activity()
returns void
language sql
as $$
  update public.profiles
  set last_seen_at = now()
  where id = auth.uid();
$$;

-- Ensure anyone can execute this
grant execute on function public.touch_user_activity() to authenticated;
