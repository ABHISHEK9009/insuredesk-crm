-- Add the nullable WhatsApp signature column to users without removing or changing existing data.
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "whatsapp_signature" TEXT;
