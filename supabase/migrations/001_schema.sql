-- ============================================
-- SAKANI (سكني) — Supabase Database Schema
-- Copy and paste this into Supabase SQL Editor
-- ============================================

-- ==================
-- PROFILES TABLE
-- ==================

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  whatsapp text not null unique,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ==================
-- LISTINGS TABLE
-- ==================

create type listing_type as enum ('room_available', 'looking_for_roommate');
create type gender_preference as enum ('any', 'male', 'female');
create type listing_status as enum ('active', 'closed');

create table public.listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type listing_type not null,
  title text not null,
  description text not null,
  city text not null,
  neighborhood text,
  price integer not null,
  gender_preference gender_preference default 'any',
  photos text[] default '{}',
  status listing_status default 'active',
  view_count integer default 0,
  whatsapp_click_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index listings_city_idx on listings(city);
create index listings_type_idx on listings(type);
create index listings_status_idx on listings(status);
create index listings_user_id_idx on listings(user_id);

-- RLS
alter table public.listings enable row level security;

create policy "Anyone can view active listings"
  on listings for select using (status = 'active');

create policy "Users can view own listings (any status)"
  on listings for select using (auth.uid() = user_id);

create policy "Users can insert own listings"
  on listings for insert with check (auth.uid() = user_id);

create policy "Users can update own listings"
  on listings for update using (auth.uid() = user_id);

create policy "Users can delete own listings"
  on listings for delete using (auth.uid() = user_id);

-- ==================
-- RPC FUNCTIONS
-- ==================

-- Increment view count (called from public API, no auth needed)
create or replace function increment_view_count(listing_id uuid)
returns void as $$
  update listings set view_count = view_count + 1 where id = listing_id;
$$ language sql security definer;

-- Increment WhatsApp click count
create or replace function increment_whatsapp_click(listing_id uuid)
returns void as $$
  update listings set whatsapp_click_count = whatsapp_click_count + 1 where id = listing_id;
$$ language sql security definer;

-- Auto-update updated_at on listings changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger listings_updated_at
  before update on listings
  for each row execute function update_updated_at();

-- ==================
-- STORAGE SETUP
-- ==================
-- After running this SQL, go to Storage in your Supabase dashboard and:
-- 1. Create a bucket called "listing-photos"
-- 2. Set it to PUBLIC
-- 3. Set max file size: 5MB
-- 4. Allowed MIME types: image/jpeg, image/png, image/webp
--
-- Then add these storage policies:
-- Allow authenticated users to upload to their own folder:
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true);

create policy "Authenticated users can upload listing photos"
  on storage.objects for insert
  with check (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

create policy "Anyone can view listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "Users can delete own listing photos"
  on storage.objects for delete
  using (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
