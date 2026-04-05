-- ============================================================
-- MIGRATION 012 — Atomic Profile Creation via Triggers
-- This ensures account integrity. Every auth.user MUST have a profile.
-- ============================================================

-- 1. Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, whatsapp, is_admin, is_banned)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'مستخدم الجديد'),
    coalesce(new.raw_user_meta_data->>'whatsapp', 'rec_' || encode(gen_random_bytes(6), 'hex')),
    false,
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Cleanup existing "Zombies"
-- For any user in auth.users that is missing a profile, create one now.
insert into public.profiles (id, name, whatsapp, is_admin, is_banned)
select 
  u.id, 
  coalesce(u.raw_user_meta_data->>'name', 'مستخدم مسترجع'),
  coalesce(u.raw_user_meta_data->>'whatsapp', 'recovered_' || u.id),
  false,
  false
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
