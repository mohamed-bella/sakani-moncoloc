-- Drop the NOT NULL constraint on user_id to allow anonymous guest posting
ALTER TABLE "public"."listings" ALTER COLUMN "user_id" DROP NOT NULL;
