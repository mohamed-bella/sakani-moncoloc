-- ============================================
-- SAVED LISTINGS (المفضلة)
-- ============================================

create table public.saved_listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

-- RLS
alter table public.saved_listings enable row level security;

create policy "Users can view own saved listings"
  on saved_listings for select using (auth.uid() = user_id);

create policy "Users can insert own saved listings"
  on saved_listings for insert with check (auth.uid() = user_id);

create policy "Users can delete own saved listings"
  on saved_listings for delete using (auth.uid() = user_id);
