-- ============================================
-- MODERATION & SEARCH INDEXES
-- ============================================

-- 0. Add Admin Column to Profiles (must be before policies that use it)
alter table public.profiles add column if not exists is_admin boolean default false;

-- 1. Create Report Categories Enum
create type report_category as enum ('fake', 'harassment', 'already_rented', 'other');

-- 2. Create Reports Table
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  category report_category not null,
  details text,
  status text default 'pending', -- pending, dismissed, listing_closed
  created_at timestamptz default now()
);

-- RLS for Reports
alter table public.reports enable row level security;

-- Anyone can submit a report
create policy "Anyone can insert reports"
  on reports for insert with check (true);

-- Only admins can see reports
create policy "Admins can view reports"
  on reports for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- 3. Add Search Index to Listings
-- We use a GIN index on a generated tsvector column for performance
alter table public.listings add column if not exists fts tsvector 
  generated always as (to_tsvector('simple', title || ' ' || description)) stored;

create index if not exists listings_fts_idx on public.listings using gin (fts);
