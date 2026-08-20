-- Drop unique constraint on phone to allow distinct clients sharing an agent/broker contact number
DROP INDEX IF EXISTS "client_accounts_active_organization_phone_key";
DROP INDEX IF EXISTS "client_accounts_active_unscoped_phone_key";

-- Create standard non-unique lookup index
CREATE INDEX IF NOT EXISTS "client_accounts_org_phone_idx"
ON "client_accounts" ("organization_id", "phone");
