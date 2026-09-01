// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { logAuditMock, prismaMock, verifyJWTMock } = vi.hoisted(() => {
  const database = {
    clientAccount: { findFirst: vi.fn() },
    policyRecord: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
    task: { findFirst: vi.fn() },
    uploadedFile: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  };
  database.$transaction = vi.fn((operation) =>
    typeof operation === "function" ? operation(database) : Promise.all(operation),
  );
  return {
    logAuditMock: vi.fn(),
    prismaMock: database,
    verifyJWTMock: vi.fn(),
  };
});

vi.mock("@/lib/db/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({ verifyJWT: verifyJWTMock }));
vi.mock("@/lib/audit", () => ({
  logAudit: logAuditMock,
  getAuditMetadata: () => ({ ipAddress: "127.0.0.1", userAgent: "vitest" }),
}));
vi.mock("@/lib/records", () => ({ normalizeRecord: (record) => record }));
vi.mock("@/app/lib/dashboard-helpers", () => ({
  formatReviewValidationError: () => "Review incomplete",
  getReviewValidation: () => ({
    valid: true,
    contactErrors: [],
    missingRequired: [],
    resolvedSchema: null,
  }),
}));

const ORGANIZATION_ID = "20000000-0000-4000-8000-000000000001";

describe("policy duplicate prevention guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyJWTMock.mockResolvedValue({
      id: "30000000-0000-4000-8000-000000000001",
      userId: "30000000-0000-4000-8000-000000000001",
      role: "AGENT",
      organizationId: ORGANIZATION_ID,
      name: "Agent",
      email: "agent@example.com",
    });
  });

  it("blocks manual save / review if an active policy record with the same policy number exists", async () => {
    prismaMock.policyRecord.findFirst.mockResolvedValueOnce({
      id: "existing-policy-uuid",
      pdfFileName: "EXISTING_POLICY.pdf",
      sourceFile: "EXISTING_POLICY.pdf",
    });

    const { POST } = await import("../src/app/api/policy-records/route.js");
    const request = new NextRequest("http://localhost/api/policy-records", {
      method: "POST",
      headers: { cookie: "token=staff-token", "Content-Type": "application/json" },
      body: JSON.stringify({
        extractedData: {
          policyNumber: "POL123456789",
          insuredName: "Rohan Gupta",
          contactNumber: "9876543210",
          insuranceCompany: "ICICI Lombard General Insurance Company Limited",
          policyType: "Motor",
        },
        reviewedData: {
          policyNumber: "POL123456789",
          insuredName: "Rohan Gupta",
          contactNumber: "9876543210",
          insuranceCompany: "ICICI Lombard General Insurance Company Limited",
          policyType: "Motor",
        },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error).toContain('Policy number "POL123456789" already exists');
    expect(prismaMock.policyRecord.create).not.toHaveBeenCalled();
  });
});
