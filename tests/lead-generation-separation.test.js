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

  it("adds the agent signature in the shared WhatsApp sender", () => {
    const senderRoute = read("src/app/api/operations/whatsapp/test-message/route.js");

    expect(senderRoute).toContain("buildDefaultAgentSignature(session)");
    expect(senderRoute).toContain("withAgentSignature(message");
    expect(senderRoute).toContain("hasExistingSignature(text)");
    expect(senderRoute).toContain("team bimaheadquarter");
    expect(senderRoute).toContain("insuredesk imf");
    expect(senderRoute).toContain("your trusted insurance partner");
    expect(senderRoute).toContain("*Comprehensive Insurance Solutions*");
    expect(senderRoute).toContain("sendWhatsAppText(recipient, signedMessage)");
  });

  it("filters lead profiles from clickable KPI cards", () => {
    const leadPage = read("src/app/(dashboard)/dashboard/manual-entry/customer-profiling/page.js");

    expect(leadPage).toContain('function filterFromCounter(status)');
    expect(leadPage).toContain('updateFilter("status", status)');
    expect(leadPage).toContain('scrollIntoView({');
    expect(leadPage).toContain('aria-pressed={active}');
    expect(leadPage).toContain('const [limit] = useState(8)');
  });

  it("allows an agent to deselect a policy source", () => {
    const leadPage = read("src/app/(dashboard)/dashboard/manual-entry/customer-profiling/page.js");

    expect(leadPage).toContain("function clearPolicyLead()");
    expect(leadPage).toContain('aria-label="Deselect policy source"');
    expect(leadPage).toContain("phone: current.phone");
  });

  it("uses the compact required lead form with optional contact details", () => {
    const leadPage = read("src/app/(dashboard)/dashboard/manual-entry/customer-profiling/page.js");

    expect(leadPage).toContain('label="Lead Type"');
    expect(leadPage).toContain('label="Interested Product"');
    expect(leadPage).toContain('label="Lead Source"');
    expect(leadPage).toContain("LEAD_SOURCE_OPTIONS");
    expect(leadPage).toContain('placeholder="Select lead source"');
    expect(leadPage).toContain('label="Follow-up Date"');
    expect(leadPage).toContain('className="lead-optional-toggle"');
    expect(leadPage).toContain("optionalFieldsOpen ? (");
  });

  it("separates current products from an existing customer's new requirement", () => {
    const leadPage = read("src/app/(dashboard)/dashboard/manual-entry/customer-profiling/page.js");

    expect(leadPage).toContain("const currentProducts = useMemo");
    expect(leadPage).toContain("Current Products");
    expect(leadPage).toContain("New Requirement (Interested In)");
    expect(leadPage).toContain("Select new requirement");
    expect(leadPage).toContain('selectedLOBs: []');
  });

  it("uses the phone check as a saved-lead filter and opens matching leads in detail view", () => {
    const leadPage = read("src/app/(dashboard)/dashboard/manual-entry/customer-profiling/page.js");

    expect(leadPage).toContain('function updatePhoneSearch(value)');
    expect(leadPage).toContain('updateFilter("q", value.trim())');
    expect(leadPage).toContain('router.push(`/dashboard/manual-entry/lead-generation/${profile.id}`)');
    expect(leadPage).toContain('const matchedLeadMessage = useMemo');
    expect(leadPage).toContain('Here is your saved lead.');
    expect(leadPage).toContain('Created by ${ownerNames.join(", ")}');
    expect(leadPage).toContain('View More');
    expect(leadPage).not.toContain('Use Lead');
  });

  it("opens a saved lead from the complete table row", () => {
    const leadPage = read("src/app/(dashboard)/dashboard/manual-entry/customer-profiling/page.js");

    expect(leadPage).toContain('className={`profile-clickable-row');
    expect(leadPage).toContain('onClick={() => onEdit(profile)}');
    expect(leadPage).toContain('role="link"');
    expect(leadPage).toContain('tabIndex={0}');
    expect(leadPage).toContain('onClick={(event) => event.stopPropagation()}');
  });

  it("keeps lead entries private except for Super Admin", () => {
    const rbac = read("src/lib/auth/rbac.js");
    const listRoute = read("src/app/api/customer-profiles/route.js");
    const detailRoute = read("src/app/api/customer-profiles/[id]/route.js");

    expect(rbac).toContain('if (user.role === "SUPER_ADMIN")');
    expect(rbac).toContain('createdById: actorId');
    expect(listRoute).toContain('const ownProfileFilter = getCustomerProfileScopedFilter(user)');
    expect(detailRoute).toContain('...getCustomerProfileScopedFilter(session)');
  });

  it("manages LOBs separately from follow-up remarks", () => {
    const detailPage = read("src/app/(dashboard)/dashboard/manual-entry/customer-profiling/[id]/page.js");

    expect(detailPage).toContain('className="lead-add-lob-button"');
    expect(detailPage).toContain('Add Interested LOB');
    expect(detailPage).toContain('className="lead-lob-client-summary"');
    expect(detailPage).toContain('Interested LOBs');
    expect(detailPage).toContain('profile.selectedLOBs?.length || 0');
    expect(detailPage).toContain('Assigned Agent');
    expect(detailPage).toContain('function saveLobs()');
    expect(detailPage).toContain('selectedLOBs: unique([...(profile.selectedLOBs || []), ...lobForm.policyInterests])');
    expect(detailPage).toContain('className="lead-lob-selection-layout"');
    expect(detailPage).toContain('className="lead-current-lob-list"');
    expect(detailPage).toContain('LOB_OPTIONS.filter((lob) => !profile.selectedLOBs?.includes(lob))');
    expect(detailPage).toContain('className="lead-lob-client-summary follow-up-client-summary"');
    expect(detailPage).toContain('className="follow-up-form-section"');
    expect(detailPage).toContain('Conversation Remark');
    expect(detailPage).toContain('className="lead-timeline-details-section"');
    expect(detailPage).toContain('Lead &amp; LOB Details');
    expect(detailPage).toContain('className="lead-timeline-remark-section"');
    expect(detailPage).toContain('remark: item.rawRemark || item.remark || "-"');
    expect(detailPage).not.toContain('Interested Policy Types *');
    expect(detailPage).not.toContain('toggleRemarkPolicyInterest');
  });
});
