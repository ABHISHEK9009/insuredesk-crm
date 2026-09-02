/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse/lib/pdf-parse.js');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

describe('New India Non-Motor Extraction (Home and Package)', () => {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');

  it('extracts HOME VKM as Fire Insurance / Home', async () => {
    const filePath = path.join(dir, 'HOME_VKM_26-27_REWA.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'HOME_VKM_26-27_REWA.pdf');

    expect(res.insuranceCompany).toMatch(/New India/i);
    expect(res.documentCategory).toBe('Fire Insurance');
    expect(res.policyNumber).toBe('45140011268500000001');
    expect(res.insuredName).toMatch(/VIJAY KUMAR MISHRA/i);
    expect(res.startDate).toBe('05/08/2026');
    expect(res.expiryDate).toBe('04/08/2027');
  });

  it('extracts MP BOARD & PAPER MILLS as Fire Insurance / Package', async () => {
    const filePath = path.join(dir, 'M P BOARD & PAPER MILLS PVT LTD_26-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'M P BOARD & PAPER MILLS PVT LTD_26-27.pdf');

    expect(res.insuranceCompany).toMatch(/New India/i);
    expect(res.documentCategory).toBe('Fire Insurance');
    expect(res.policyNumber).toBe('45140046262400000023');
    expect(res.insuredName).toMatch(/M P BOARD & PAPER MILLS/i);
    expect(res.netPremium).toBe('1,57,670.00');
    expect(res.totalPremium).toBe('1,86,050.00');
  });
});
