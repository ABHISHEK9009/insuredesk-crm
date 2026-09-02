/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse/lib/pdf-parse.js');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

describe('United India Non-Motor Extraction (Fire, Burglary, Fidelity)', () => {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');

  it('extracts Fire Policy Silos Bag India as Fire Insurance', async () => {
    const filePath = path.join(dir, 'Fire Policy Silos Bag India 2026-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'Fire Policy Silos Bag India 2026-27.pdf');

    expect(res.insuranceCompany).toMatch(/United India/i);
    expect(res.documentCategory).toBe('Fire Insurance');
    expect(res.policyNumber).toBe('1913011126P107677566');
    expect(res.insuredName).toMatch(/SILO BAG INDIA/i);
    expect(res.netPremium).toBe('8,38,804.00');
    expect(res.totalPremium).toBe('9,89,789.00');
  });

  it('extracts Burglary Policy Silos Bag India as Burglary Insurance', async () => {
    const filePath = path.join(dir, 'Burglary Policy Silos Bag India 2026-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'Burglary Policy Silos Bag India 2026-27.pdf');

    expect(res.insuranceCompany).toMatch(/United India/i);
    expect(res.documentCategory).toBe('Burglary Insurance');
    expect(res.policyNumber).toBe('1913011226P107678351');
    expect(res.insuredName).toMatch(/SILO BAG INDIA/i);
    expect(res.netPremium).toBe('11,180.00');
    expect(res.totalPremium).toBe('13,192.00');
  });

  it('extracts Fidelity Policy Silos Bag India as Fidelity Insurance', async () => {
    const filePath = path.join(dir, 'Fidelity Policy Silos Bag India 2026-27.pdf');
    if (!fs.existsSync(filePath)) return;
    const buf = fs.readFileSync(filePath);
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, 'Fidelity Policy Silos Bag India 2026-27.pdf');

    expect(res.insuranceCompany).toMatch(/United India/i);
    expect(res.documentCategory).toBe('Fidelity Insurance');
    expect(res.policyNumber).toBe('1913011226P107678831');
    expect(res.insuredName).toMatch(/SILO BAG INDIA/i);
    expect(res.netPremium).toBe('44,391.00');
    expect(res.totalPremium).toBe('52,381.00');
  });
});
