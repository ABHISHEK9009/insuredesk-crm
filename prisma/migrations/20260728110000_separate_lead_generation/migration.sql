CREATE TABLE "lead_generation" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "alternate_phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "occupation" TEXT,
  "business_type" TEXT,
  "contact_person_name" TEXT,
  "customer_type" TEXT NOT NULL DEFAULT 'New',
  "assigned_to" TEXT,
  "reference_source" TEXT,
  "source_policy_id" UUID,
  "source_policy_number" TEXT,
  "source_policy_type" TEXT,
  "source_company" TEXT,
  "selected_lobs" JSONB NOT NULL DEFAULT '[]',
  "lob_details" JSONB NOT NULL DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'New Lead',
  "follow_up_date" TIMESTAMPTZ(6),
  "last_follow_up_date" TIMESTAMPTZ(6),
  "next_follow_up_date" TIMESTAMPTZ(6),
  "follow_up_remark" TEXT,
  "follow_up_outcome" TEXT,
  "remarks" TEXT,
  "converted_to_customer" BOOLEAN NOT NULL DEFAULT false,
  "converted_policy_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ(6),
  "customer_profile_id" UUID,
  "organization_id" UUID,
  "created_by_id" UUID,
  "updated_by_id" UUID,
  CONSTRAINT "lead_generation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lead_generation_phone_idx" ON "lead_generation"("phone");
CREATE INDEX "lead_generation_organization_id_deleted_at_updated_at_idx" ON "lead_generation"("organization_id", "deleted_at", "updated_at");
CREATE INDEX "lead_generation_organization_id_status_idx" ON "lead_generation"("organization_id", "status");
CREATE INDEX "lead_generation_organization_id_next_follow_up_date_idx" ON "lead_generation"("organization_id", "next_follow_up_date");
CREATE INDEX "lead_generation_organization_id_created_at_idx" ON "lead_generation"("organization_id", "created_at");
CREATE INDEX "lead_generation_created_by_id_deleted_at_updated_at_idx" ON "lead_generation"("created_by_id", "deleted_at", "updated_at");
CREATE INDEX "lead_generation_customer_profile_id_idx" ON "lead_generation"("customer_profile_id");
CREATE INDEX "lead_generation_deleted_at_idx" ON "lead_generation"("deleted_at");

ALTER TABLE "lead_generation" ADD CONSTRAINT "lead_generation_customer_profile_id_fkey" FOREIGN KEY ("customer_profile_id") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead_generation" ADD CONSTRAINT "lead_generation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead_generation" ADD CONSTRAINT "lead_generation_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead_generation" ADD CONSTRAINT "lead_generation_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "lead_generation" (
  "id", "name", "phone", "alternate_phone", "email", "address", "city", "state",
  "occupation", "business_type", "contact_person_name", "customer_type", "assigned_to",
  "reference_source", "source_policy_id", "source_policy_number", "source_policy_type",
  "source_company", "selected_lobs", "lob_details", "status", "follow_up_date",
  "last_follow_up_date", "next_follow_up_date", "follow_up_remark", "follow_up_outcome",
  "remarks", "converted_to_customer", "converted_policy_id", "created_at", "updated_at",
  "deleted_at", "customer_profile_id", "organization_id", "created_by_id", "updated_by_id"
)
SELECT
  profile."id", profile."name", profile."phone", profile."alternate_phone", profile."email",
  profile."address", profile."city", profile."state", profile."occupation", profile."business_type",
  profile."contact_person_name", profile."customer_type", profile."assigned_to", profile."reference_source",
  profile."source_policy_id", profile."source_policy_number", profile."source_policy_type",
  profile."source_company", profile."selected_lobs", profile."lob_details", profile."status",
  profile."follow_up_date", profile."last_follow_up_date", profile."next_follow_up_date",
  profile."follow_up_remark", profile."follow_up_outcome", profile."remarks",
  profile."converted_to_customer", profile."converted_policy_id", profile."created_at",
  profile."updated_at", profile."deleted_at",
  CASE WHEN EXISTS (
    SELECT 1 FROM "pdf_records" policy
    WHERE policy."customer_portfolio_id" = profile."id" AND policy."deleted_at" IS NULL
  ) OR EXISTS (
    SELECT 1 FROM "endorsements" endorsement
    WHERE endorsement."customer_id" = profile."id" AND endorsement."deleted_at" IS NULL
  ) THEN profile."id" ELSE NULL END,
  profile."organization_id", profile."created_by_id", profile."updated_by_id"
FROM "customer_profiles" profile
WHERE EXISTS (
  SELECT 1 FROM "audit_logs" audit
  WHERE audit."entity_type" = 'CustomerProfile'
    AND audit."entity_id" = profile."id"::text
    AND audit."action" = 'CUSTOMER_PROFILE_CREATE'
    AND audit."metadata" ? 'selectedLOBs'
)
ON CONFLICT ("id") DO NOTHING;
