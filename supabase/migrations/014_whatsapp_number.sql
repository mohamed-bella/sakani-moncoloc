-- Add whatsapp_number column to listings to allow per-listing phone overrides
ALTER TABLE "public"."listings" ADD COLUMN "whatsapp_number" TEXT;
