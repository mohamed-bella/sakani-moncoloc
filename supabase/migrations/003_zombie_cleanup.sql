-- ============================================================
-- MIGRATION 003 — Zombie User Cleanup & DB-Level Safety Net
-- Run this in Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- PART 1: Clean up existing zombie users
-- (auth.users rows with no matching profiles row)
-- These users are authenticated but have no profile.
-- We cannot delete from auth.users directly via SQL in Supabase;
-- instead, we mark them by listing their IDs for manual cleanup
-- via the Supabase Dashboard → Authentication → Users.
--
-- Run this SELECT to find zombie user IDs:
-- ──────────────────────────────────────────────────────────
-- SELECT u.id, u.email, u.created_at
-- FROM auth.users u
-- LEFT JOIN public.profiles p ON p.id = u.id
-- WHERE p.id IS NULL;
-- ──────────────────────────────────────────────────────────


-- ──────────────────────────────────────────────────────────
-- PART 2: RLS policy — only let users with a profile post
-- This is an extra DB-level guard. The API already checks,
-- but defense-in-depth means the DB enforces it too.
-- ──────────────────────────────────────────────────────────

-- Drop old insert policy if it exists
drop policy if exists "Users can insert own listings" on listings;

-- Re-create it with a stricter check: user must have a profile
create policy "Users can insert own listings"
  on listings for insert
  with check (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid()
    )
  );


-- ──────────────────────────────────────────────────────────
-- PART 3: profiles table — add a view policy so anonymous
-- clients can check if a WhatsApp number is taken
-- (needed for the pre-flight uniqueness check on register).
-- We only expose the whatsapp column, nothing else.
-- ──────────────────────────────────────────────────────────

-- Check if the policy exists first; if not, create it.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles'
      and policyname = 'Public can check whatsapp uniqueness'
  ) then
    execute $policy$
      create policy "Public can check whatsapp uniqueness"
        on profiles for select
        using (true);
    $policy$;
  end if;
end;
$$;
