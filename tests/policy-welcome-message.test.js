import { describe, expect, it } from "vitest";

describe("policy upload welcome message", () => {
  it("formats the WhatsApp welcome message with clean spacing and branded link", () => {
    const resolvedName = "Abhishek Verma";
    const insuredName = "Abhishek Verma";
    const policyNumber = "POL-8839707135";
    const insuranceCompany = "ICICI Lombard General Insurance";
    const policyCode = "rec_abc123";
    const baseUrl = "https://bimaheadquarter.com";
    const policyPdfUrl = `${baseUrl}/d/${policyCode}`;

    const welcomeMessage = `Dear ${resolvedName},

Greetings from Bima Headquarter.

Thank you for choosing us as your trusted insurance partner. Your policy records are now active with us.

Policy Summary:
• Insured Name: ${insuredName}
• Policy No: ${policyNumber}
• Insurer: ${insuranceCompany}

Access Your Digital Policy Document:
${policyPdfUrl}

For any claim requests, policy endorsements, or queries, our team is always available on this WhatsApp number.

Best regards,  
Team Bima Headquarter
by InsureDesk IMF Pvt. Ltd.`;

    expect(welcomeMessage).toContain("Dear Abhishek Verma,");
    expect(welcomeMessage).toContain("Greetings from Bima Headquarter.");
    expect(welcomeMessage).toContain("Policy No: POL-8839707135");
    expect(welcomeMessage).toContain("https://bimaheadquarter.com/d/rec_abc123");
    expect(welcomeMessage).toContain("Team Bima Headquarter\nby InsureDesk IMF Pvt. Ltd.");
  });

  it("handles missing contact phone safely without throwing an exception", async () => {
    const { sendPolicyUploadWelcomeMessage } = await import(
      "../src/lib/policies/welcome-message.js"
    );

    const result = await sendPolicyUploadWelcomeMessage({
      recordId: "00000000-0000-0000-0000-000000000000",
      data: { contactPhone: "" },
    });

    expect(result.sent).toBe(false);
    expect(result.reason).toBeDefined();
  });
});
