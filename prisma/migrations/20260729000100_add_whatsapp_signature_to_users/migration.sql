-- Add nullable whatsapp signature column to users without deleting or modifying existing data.
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "whatsapp_signature" TEXT;
