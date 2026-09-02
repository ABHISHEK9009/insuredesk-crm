/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse/lib/pdf-parse.js');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

describe('HDFC ERGO Workmen Compensation Extraction', () => {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');

  it('extracts M.P. AGROTONICS WC PDF as Workmen Compensation', async () => {
    const filePath = path.join(dir, 'M.P. AGROTONICS LTD_WC.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'M.P. AGROTONICS LTD_WC.pdf');

    expect(res.insuranceCompany).toMatch(/HDFC ERGO/i);
    expect(res.documentCategory).toBe('Workmen Compensation');
    expect(res.policyNumber).toBe('3114208885199900000');
    expect(res.insuredName).toMatch(/M\.?P\.?\s*AGROTONICS/i);
    expect(res.netPremium).toBe('14,407.00');
    expect(res.totalPremium).toBe('17,000.00');
  });

  it('extracts MAJESTIC BASMATI RICE WC PDF as Workmen Compensation', async () => {
    const filePath = path.join(dir, 'MAJESTIC BASMATI RICE PRIVATE LIMITED_wc_26-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'MAJESTIC BASMATI RICE PRIVATE LIMITED_wc_26-27.pdf');

    expect(res.insuranceCompany).toMatch(/HDFC ERGO/i);
    expect(res.documentCategory).toBe('Workmen Compensation');
    expect(res.policyNumber).toBe('3114208850651900000');
    expect(res.insuredName).toMatch(/MAJESTIC BASMATI RICE/i);
    expect(res.netPremium).toBe('15,254.00');
    expect(res.totalPremium).toBe('18,000.00');
  });
});
