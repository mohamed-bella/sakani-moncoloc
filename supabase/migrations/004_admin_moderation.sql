-- ============================================================
-- MIGRATION 004 — Full Admin Moderation System
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── 1. Add is_banned flag to profiles ───────────────────────
alter table public.profiles
  add column if not exists is_banned boolean default false;

-- ─── 2. Add ban reason column ────────────────────────────────
alter table public.profiles
  add column if not exists ban_reason text;

-- ─── 3. Delete reason on listings (for audit) ────────────────
alter table public.listings
  add column if not exists deleted_at timestamptz;

alter table public.listings
  add column if not exists deleted_by uuid references auth.users(id);

-- ─── 4. Extend reports with resolver info ────────────────────
alter table public.reports
  add column if not exists resolved_by uuid references auth.users(id);

alter table public.reports
  add column if not exists resolved_at timestamptz;

-- ─── 5. RLS — Admins can update ANY listing (close/delete) ───
drop policy if exists "Admins can update any listing" on listings;
create policy "Admins can update any listing"
  on listings for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

-- ─── 6. RLS — Admins can delete ANY listing ──────────────────
drop policy if exists "Admins can delete any listing" on listings;
create policy "Admins can delete any listing"
  on listings for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

-- ─── 7. RLS — Admins can view ALL listings (any status) ──────
drop policy if exists "Admins can view all listings" on listings;
create policy "Admins can view all listings"
  on listings for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

-- ─── 8. RLS — Admins can view ALL profiles ───────────────────
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
        and p2.is_admin = true
    )
  );

-- ─── 9. RLS — Admins can update ANY profile (ban/unban) ──────
drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid()
        and p2.is_admin = true
    )
  );

-- ─── 10. RLS — Admins can update reports (resolve) ───────────
drop policy if exists "Admins can update reports" on reports;
create policy "Admins can update reports"
  on reports for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

-- ─── 11. Prevent banned users from posting ───────────────────
-- Drop and recreate the listings insert policy to also check is_banned
drop policy if exists "Users can insert own listings" on listings;
create policy "Users can insert own listings"
  on listings for insert
  with check (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_banned IS NOT TRUE
    )
  );

-- ─── 12. Verify setup (run this SELECT to confirm): ──────────
-- select * from pg_policies where tablename in ('listings', 'profiles', 'reports') order by tablename, policyname;
