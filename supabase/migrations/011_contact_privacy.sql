-- ============================================
-- CONTACT REVEAL TRACKING (خصوصية أرقام الواتساب)
-- ============================================

-- Track when a user clicks the contact button
create table public.contact_reveals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- RLS
alter table public.contact_reveals enable row level security;

-- Users can only view their own reveal history
create policy "Users can view own reveals"
  on contact_reveals for select using (auth.uid() = user_id);

-- Only authenticated users can insert (restricted by trigger)
create policy "Users can insert own reveals"
  on contact_reveals for insert with check (auth.uid() = user_id);

-- ============================================
-- ANTI-SCRAPING RATE LIMIT TRIGGER
-- ============================================

create or replace function protect_whatsapp_scraping()
returns trigger as $$
declare
  hourly_count int;
  daily_count int;
  already_revealed boolean;
begin
  -- 1. Check if user already revealed THIS listing (no cost to reveal again)
  select exists(
    select 1 from public.contact_reveals 
    where user_id = new.user_id 
    and listing_id = new.listing_id
  ) into already_revealed;

  if already_revealed then
    return new;
  end if;

  -- 2. Hourly Limit: Max 10 reveals
  select count(*) into hourly_count 
  from public.contact_reveals
  where user_id = new.user_id 
  and created_at > now() - interval '1 hour';

  if hourly_count >= 10 then
    raise exception 'عذراً، لقد وصلت للحد الأقصى لمشاهدة أرقام التواصل في الساعة (10). يرجى المحاولة لاحقاً لحماية خصوصية المستخدمين.';
  end if;

  -- 3. Daily Limit: Max 50 reveals
  select count(*) into daily_count
  from public.contact_reveals
  where user_id = new.user_id 
  and created_at > now() - interval '24 hours';

  if daily_count >= 50 then
    raise exception 'لقد وصلت للحد اليومي لمشاهدة أرقام التواصل (50). شكراً لحفاظك على خصوصية السكنى.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger
drop trigger if exists trigger_protect_whatsapp_scraping on public.contact_reveals;
create trigger trigger_protect_whatsapp_scraping
  before insert on public.contact_reveals
  for each row execute function protect_whatsapp_scraping();
