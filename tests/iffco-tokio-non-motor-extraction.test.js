/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse/lib/pdf-parse.js');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

describe('IFFCO-Tokio Non-Motor Extraction (Fire, Burglary, CPM)', () => {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');

  it('extracts SHRI RAM DAL MILL Fire PDF as Fire Insurance', async () => {
    const filePath = path.join(dir, 'SHRI RAM DAL MILL_FIRE_26-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'SHRI RAM DAL MILL_FIRE_26-27.pdf');

    expect(res.insuranceCompany).toMatch(/IFFCO.*Tokio/i);
    expect(res.documentCategory).toBe('Fire Insurance');
    expect(res.policyNumber).toBe('12B37885');
    expect(res.insuredName).toMatch(/SHRI RAM DAL MILL/i);
    expect(res.netPremium).toBe('14,002.89');
    expect(res.totalPremium).toBe('16,523.00');
  });

  it('extracts SHRI DAL MILL Burglary PDF as Burglary Insurance', async () => {
    const filePath = path.join(dir, 'SHRI DAL MILL_BURGLARY_26-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'SHRI DAL MILL_BURGLARY_26-27.pdf');

    expect(res.insuranceCompany).toMatch(/IFFCO.*Tokio/i);
    expect(res.documentCategory).toBe('Burglary Insurance');
    expect(res.policyNumber).toBe('44554856');
    expect(res.insuredName).toMatch(/SHRI RAM DAL MILL/i);
    expect(res.netPremium).toBe('125.47');
  });

  it('extracts VKM CPM PDF as Contractors Plant & Machinery', async () => {
    const filePath = path.join(dir, '0402D00406_vkm_cpm_26-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, '0402D00406_vkm_cpm_26-27.pdf');

    expect(res.insuranceCompany).toMatch(/IFFCO.*Tokio/i);
    expect(res.documentCategory).toBe('Contractors Plant & Machinery');
    expect(res.policyNumber).toBe('32277246');
    expect(res.insuredName).toMatch(/VIJAY KUMAR MISHRA/i);
    expect(res.netPremium).toBe('6,720.00');
    expect(res.totalPremium).toBe('7,929.60');
  });
});
