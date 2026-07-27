import { describe, expect, it } from "vitest";
import {
  EXPORT_METADATA_FIELDS,
  FIELD_SETUP,
  getCategoryDefaultFieldKeys,
  getExportValueForRecord,
} from "../src/app/lib/dashboard-helpers.js";

describe("Customizable PDF Extraction & Metadata Excel Export", () => {
  it("exports metadata field definitions for audit details", () => {
    const keys = EXPORT_METADATA_FIELDS.map(([, key]) => key);
    expect(keys).toContain("uploadedBy");
    expect(keys).toContain("uploadedAt");
    expect(keys).toContain("savedAt");
    expect(keys).toContain("clientId");
    expect(keys).toContain("sourceFile");
    expect(keys).toContain("extractionMethod");
  });

  it("returns appropriate default field keys for category presets", () => {
    const motorKeys = getCategoryDefaultFieldKeys("motor");
    expect(motorKeys).toContain("vehicleNumber");
    expect(motorKeys).toContain("engineNumber");
    expect(motorKeys).toContain("chassisNumber");
    expect(motorKeys).not.toContain("stockSumInsured");

    const fireKeys = getCategoryDefaultFieldKeys("fire");
    expect(fireKeys).toContain("riskLocation");
    expect(fireKeys).toContain("occupancy");
    expect(fireKeys).not.toContain("chassisNumber");

    const healthKeys = getCategoryDefaultFieldKeys("health");
    expect(healthKeys).toContain("numberOfInsuredMembers");
    expect(healthKeys).not.toContain("engineNumber");

    const allKeys = getCategoryDefaultFieldKeys("all");
    expect(allKeys).toHaveLength(FIELD_SETUP.length);
  });

  it("formats metadata and extraction field values cleanly for export", () => {
    const mockRecord = {
      uploadedBy: "John Agent",
      uploadedAt: "2026-07-27T10:00:00.000Z",
      savedAt: "2026-07-27T10:05:00.000Z",
      clientId: "CLI-9988",
      sourceFile: "sample_motor_policy.pdf",
      extractionMethod: "rule_based_pdf",
      insuredName: "Rajesh Kumar",
      policyNumber: "POL123456789",
      startDate: "2026-08-01",
    };

    expect(getExportValueForRecord(mockRecord, "uploadedBy")).toBe("John Agent");
    expect(getExportValueForRecord(mockRecord, "clientId")).toBe("CLI-9988");
    expect(getExportValueForRecord(mockRecord, "sourceFile")).toBe("sample_motor_policy.pdf");
    expect(getExportValueForRecord(mockRecord, "insuredName")).toBe("Rajesh Kumar");
    expect(getExportValueForRecord(mockRecord, "policyNumber")).toBe("POL123456789");
    expect(getExportValueForRecord(mockRecord, "startDate")).toBe("01-08-2026");
    expect(getExportValueForRecord(mockRecord, "uploadedAt")).toMatch(/2026/);
    expect(getExportValueForRecord(mockRecord, "savedAt")).toMatch(/2026/);
  });
});
