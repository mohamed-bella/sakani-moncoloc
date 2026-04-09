-- ============================================================
-- MIGRATION 016 — Pending Approval Status
-- ============================================================

-- IMPORTANT: 
-- In PostgreSQL, ALTER TYPE ... ADD VALUE cannot be executed in the same 
-- transaction block where that new value is used as a default or in data.
-- 
-- ACTION: Run this line below FIRST and ALONE in the Supabase SQL Editor:
-- ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'pending';
--
-- THEN, after that succeeds, run the rest of this script.

-- 1. Update default status for new listings
ALTER TABLE public.listings ALTER COLUMN status SET DEFAULT 'pending';

-- 2. Optional: update search indexes or other constraints if needed
-- (The existing search policies already handle non-active statuses correctly)
