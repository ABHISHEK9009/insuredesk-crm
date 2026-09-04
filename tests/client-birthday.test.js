import { describe, expect, it } from "vitest";
import { calculateAgeAndCountdown } from "../src/lib/customer-profiles/birthday-helpers.js";

describe("client birthday helper functions", () => {
  it("calculates age correctly when birthday has passed", () => {
    const today = new Date("2026-06-25");
    const result = calculateAgeAndCountdown("1990-03-15", today);
    expect(result.age).toBe(36);
  });

  it("calculates age correctly when birthday is in the future", () => {
    const today = new Date("2026-06-25");
    const result = calculateAgeAndCountdown("1990-10-25", today);
    expect(result.age).toBe(35);
  });

  it("calculates countdown days correctly for upcoming birthdays", () => {
    const today = new Date("2026-06-25");
    const result = calculateAgeAndCountdown("1990-06-30", today);
    expect(result.daysToBirthday).toBe(5);
  });

  it("calculates countdown days correctly for today's birthday", () => {
    const today = new Date("2026-06-25");
    const result = calculateAgeAndCountdown("1990-06-25", today);
    expect(result.daysToBirthday).toBe(0);
  });

  it("returns null values for missing date of birth", () => {
    const result = calculateAgeAndCountdown("", new Date());
    expect(result.age).toBeNull();
    expect(result.daysToBirthday).toBeNull();
  });

  it("generates a personalized birthday card buffer and base64 string", async () => {
    const { generateBirthdayCard } = await import("../src/lib/birthday/card-renderer.js");
    const card = await generateBirthdayCard({ recipientName: "Abhishek Verma" });
    
    expect(card).toBeDefined();
    expect(card.mimeType).toBe("image/jpeg");
    expect(card.width).toBe(1086);
    expect(card.height).toBe(1448);
    expect(card.base64).toBeDefined();
    expect(card.base64.length).toBeGreaterThan(1000);
    expect(card.buffer).toBeInstanceOf(Buffer);
    expect(card.buffer.length).toBeGreaterThan(1000);
  });

  it("compiles birthday wish templates with customer and company variables", async () => {
    const { compileTemplate } = await import("../src/lib/whatsapp/queue-manager.js");
    const rawTemplate = "Dear {{customerName}},\n\nWishing you a very Happy Birthday! 🎂 Warm regards,\n*Team {{companyName}}*";
    const compiled = compileTemplate(rawTemplate, {
      customerName: "Abhishek Verma",
      companyName: "Bima Headquarter",
    });

    expect(compiled).toContain("Dear Abhishek Verma,");
    expect(compiled).toContain("*Team Bima Headquarter*");
    expect(compiled).not.toContain("{{customerName}}");
    expect(compiled).not.toContain("{{companyName}}");
  });

  it("normalizes phone numbers and sanitizes birthday payloads properly", async () => {
    const { normalizeIndianPhone, sanitizeCustomerProfilePayload } = await import(
      "../src/lib/customer-profiles/utils.js"
    );

    expect(normalizeIndianPhone("9876543210")).toBe("9876543210");
    expect(normalizeIndianPhone("+91 98765 43210")).toBe("9876543210");
    expect(normalizeIndianPhone("09876543210")).toBe("9876543210");
    expect(normalizeIndianPhone("12345")).toBe(""); // Invalid phone

    const sanitized = sanitizeCustomerProfilePayload({
      name: "Paras Sethi",
      phone: "+91 9876543210",
      email: "paras@example.com",
      dob: "1995-09-04",
    });

    expect(sanitized.name).toBe("Paras Sethi");
    expect(sanitized.phone).toBe("9876543210");
    expect(sanitized.dob).toBeInstanceOf(Date);
  });
});

