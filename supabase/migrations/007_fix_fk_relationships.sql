-- ============================================================
-- MIGRATION 007 — Correcting Foreign Keys for Embeddings
-- ============================================================

-- PostgREST nesting (e.g., listings -> profiles) requires a direct FK 
-- between the tables in the 'public' schema. 
-- listings.user_id currently points to auth.users, which breaks embeddings.

ALTER TABLE public.listings 
  DROP CONSTRAINT IF EXISTS listings_user_id_fkey;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also check reports table just in case
ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_user_id_fkey;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
