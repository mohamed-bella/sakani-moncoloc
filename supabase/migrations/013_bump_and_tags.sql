-- Migration: Add bumped_at and tags to listings table

-- 1. Add bumped_at column to support chronological bumping of listings to the top
ALTER TABLE "public"."listings" ADD COLUMN "bumped_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Add tags array for lifestyle and personality preferences
ALTER TABLE "public"."listings" ADD COLUMN "tags" TEXT[] DEFAULT '{}'::TEXT[];

-- 3. Backfill bumped_at to inherit from created_at for existing listings
UPDATE "public"."listings" SET "bumped_at" = "created_at";
