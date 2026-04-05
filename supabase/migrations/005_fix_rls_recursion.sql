-- ============================================================
-- MIGRATION 005 — Fix Infinite Recursion in RLS Policies
-- 
-- Root cause: Migration 004 added policies on 'listings' that
-- contain subqueries on 'profiles'. Since 'profiles' also has
-- RLS enabled, Postgres enters infinite recursion when it tries
-- to evaluate listings policies → profiles policies → listings...
--
-- Fix: Use a SECURITY DEFINER function to check is_admin.
-- Security definer functions run as the function owner (postgres),
-- bypassing RLS entirely — breaking the recursion safely.
-- ============================================================

-- ─── 1. Create a security-definer helper to check is_admin ───
-- This runs as 'postgres' (superuser), bypassing RLS on profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Grant execute to anon and authenticated roles
grant execute on function public.is_admin() to anon, authenticated;

-- ─── 2. Same for is_banned check ─────────────────────────────
create or replace function public.is_banned()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select is_banned from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_banned() to anon, authenticated;

-- ─── 3. Drop and recreate the recursive policies on listings ──

-- Admin view all listings
drop policy if exists "Admins can view all listings" on listings;
create policy "Admins can view all listings"
  on listings for select
  using (public.is_admin() = true);

-- Admin update any listing
drop policy if exists "Admins can update any listing" on listings;
create policy "Admins can update any listing"
  on listings for update
  using (public.is_admin() = true);

-- Admin delete any listing
drop policy if exists "Admins can delete any listing" on listings;
create policy "Admins can delete any listing"
  on listings for delete
  using (public.is_admin() = true);

-- Prevent banned users from posting (insert policy)
drop policy if exists "Users can insert own listings" on listings;
create policy "Users can insert own listings"
  on listings for insert
  with check (
    auth.uid() = user_id
    AND public.is_banned() = false
  );

-- ─── 4. Fix the proxy.ts admin check too ─────────────────────
-- The proxy.ts queries profiles directly; this is fine because
-- the proxy uses the anon key and profiles has a "Users can view
-- own profile" policy (auth.uid() = id), so it only reads the
-- current user's own row — no recursion risk there.

-- ─── 5. Also fix reports admin policies ──────────────────────
drop policy if exists "Admins can view reports" on reports;
create policy "Admins can view reports"
  on reports for select
  using (public.is_admin() = true);

drop policy if exists "Admins can update reports" on reports;
create policy "Admins can update reports"
  on reports for update
  using (public.is_admin() = true);

-- ─── 6. Fix profiles admin policies ─────────────────────────
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles"
  on profiles for select
  using (public.is_admin() = true);

drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile"
  on profiles for update
  using (public.is_admin() = true);

-- Verify: run this to confirm no more recursive policies
-- SELECT policyname, tablename, qual FROM pg_policies WHERE tablename IN ('listings', 'profiles', 'reports') ORDER BY tablename;
