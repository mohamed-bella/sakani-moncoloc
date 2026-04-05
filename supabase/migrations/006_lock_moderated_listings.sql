-- ============================================================
-- MIGRATION 006 — Locking Moderated Listings
-- =============================================

-- 1. Add locked_by_admin flag to listings
alter table public.listings
  add column if not exists locked_by_admin boolean default false;

-- 2. Update RLS policy for users to prevent editing locked listings
-- Users can only update their own listings IF they are not locked by an admin
drop policy if exists "Users can update own listings" on listings;
create policy "Users can update own listings"
  on listings for update
  using (
    auth.uid() = user_id 
    AND (locked_by_admin IS NOT TRUE)
  );

-- 3. Admins bypass this lock by using their own policy
-- (The "Admins can update any listing" policy still works because it's additive)
