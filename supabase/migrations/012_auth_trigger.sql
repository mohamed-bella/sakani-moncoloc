-- 0. Enable required extension
create extension if not exists pgcrypto;

-- 1. Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  final_name text;
  final_whatsapp text;
begin
  final_name := coalesce(new.raw_user_meta_data->>'name', 'مستخدم جديد');
  final_whatsapp := coalesce(new.raw_user_meta_data->>'whatsapp', 'rec_' || encode(gen_random_bytes(6), 'hex'));

  begin
    insert into public.profiles (id, name, whatsapp, is_admin, is_banned)
    values (new.id, final_name, final_whatsapp, false, false)
    on conflict (id) do update set
      name = excluded.name,
      whatsapp = excluded.whatsapp;
  exception when unique_violation then
    -- If whatsapp is taken by someone else, use a unique recovery ID instead of failing
    insert into public.profiles (id, name, whatsapp, is_admin, is_banned)
    values (new.id, final_name, 'dup_' || encode(gen_random_bytes(6), 'hex'), false, false)
    on conflict (id) do nothing;
  exception when others then
    -- Catch all other errors
  end;
  
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
