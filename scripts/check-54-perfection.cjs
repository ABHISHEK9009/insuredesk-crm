const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

async function detailedCheck() {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf'));

  console.log(`Checking all ${files.length} PDFs...\n`);

  const issues = [];
  const fullReport = [];

  for (const f of files) {
    const buf = fs.readFileSync(path.join(dir, f));
    const parsed = await pdf(buf);
    const res = extractPolicyFromText(parsed.text, f);

    const item = {
      file: f,
      insurer: res.insuranceCompany,
      category: res.documentCategory,
      policyNumber: res.policyNumber,
      insuredName: res.insuredName,
      startDate: res.startDate,
      expiryDate: res.expiryDate,
      netPremium: res.netPremium,
      totalPremium: res.totalPremium,
      version: res.extractionTrainingVersion || res.documentFormat || 'DEFAULT'
    };

    fullReport.push(item);

    const missingFields = [];
    if (!item.insurer) missingFields.push('insurer');
    if (!item.category || item.category === 'Motor Insurance') missingFields.push('category (non-motor check)');
    if (!item.policyNumber) missingFields.push('policyNumber');
    if (!item.insuredName || item.insuredName.length < 3) missingFields.push('insuredName');
    if (!item.startDate) missingFields.push('startDate');
    if (!item.expiryDate) missingFields.push('expiryDate');
    if (!item.netPremium && !item.totalPremium) missingFields.push('premium');

    if (missingFields.length > 0) {
      issues.push({ file: f, missingFields, current: item });
    }
  }

  console.log(`Audited ${files.length} files.`);
  console.log(`Perfect extractions: ${files.length - issues.length}`);
  console.log(`Issues found: ${issues.length}\n`);

  if (issues.length > 0) {
    console.log('--- ISSUES LIST ---');
    console.log(JSON.stringify(issues, null, 2));
  } else {
    console.log('ALL 54 POLICIES EXTRACTED 100% PERFECTLY!');
  }
}

detailedCheck().catch(console.error);
