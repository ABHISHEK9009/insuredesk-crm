// @vitest-environment node

import fs from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => fs.readFileSync(path, "utf8");

describe("lead generation data separation", () => {
  it("stores leads in a dedicated Prisma model", () => {
    const schema = read("prisma/schema.prisma");

    expect(schema).toContain("model LeadGeneration {");
    expect(schema).toContain('@@map("lead_generation")');
    expect(schema).toMatch(/customerProfileId\s+String\?/);
  });

  it("keeps lead and birthday APIs on separate models", () => {
    const leadRoute = read("src/app/api/customer-profiles/route.js");
    const birthdayRoute = read("src/app/api/operations/birthday-management/route.js");

    expect(leadRoute).toContain("prisma.leadGeneration");
    expect(leadRoute).not.toContain("prisma.customerProfile.create");
    expect(birthdayRoute).toContain("prisma.customerProfile");
    expect(birthdayRoute).not.toContain("prisma.leadGeneration");
  });

  it("migrates only audit-verified manual lead rows", () => {
    const migration = read("prisma/migrations/20260728110000_separate_lead_generation/migration.sql");

    expect(migration).toContain("CUSTOMER_PROFILE_CREATE");
    expect(migration).toContain('audit."metadata" ? \'selectedLOBs\'');
    expect(migration).toContain('INSERT INTO "lead_generation"');
    expect(migration).not.toMatch(/INSERT INTO "lead_generation"[\s\S]*FROM "customer_profiles" cp\s*;/);
    expect(migration).not.toMatch(/\bDELETE\s+FROM\b/i);
    expect(migration).not.toMatch(/\bUPDATE\s+"customer_profiles"\b/i);
  });

  it("uses the lead table for lead reports", () => {
    const report = read("src/lib/reports/lead-generation.js");

    expect(report).toContain("FROM lead_generation cp");
    expect(report).not.toContain("FROM customer_profiles cp");
  });

  it("previews editable WhatsApp messages without redirecting to WhatsApp Web", () => {
    const detailPage = read("src/app/(dashboard)/dashboard/manual-entry/customer-profiling/[id]/page.js");

    expect(detailPage).toContain("WhatsApp Message Preview");
    expect(detailPage).toContain("Review and customize the message before sending.");
    expect(detailPage).toContain("sendWhatsAppMessage");
    expect(detailPage).not.toContain("wa.me");
  });
});
