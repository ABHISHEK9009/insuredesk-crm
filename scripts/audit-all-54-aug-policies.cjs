const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

async function auditAll54() {
  const dir = path.join(process.cwd(), 'storage', 'aug policy (2)', 'aug policy');
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf'));

  console.log(`Auditing all ${files.length} PDFs in ${dir}...\n`);

  const results = [];

  for (const f of files) {
    try {
      const buf = fs.readFileSync(path.join(dir, f));
      const parsed = await pdf(buf);
      const res = extractPolicyFromText(parsed.text, f);

      results.push({
        file: f,
        company: res.insuranceCompany,
        category: res.documentCategory,
        policyNumber: res.policyNumber,
        insuredName: res.insuredName,
        startDate: res.startDate,
        expiryDate: res.expiryDate,
        netPremium: res.netPremium,
        totalPremium: res.totalPremium,
        status: (res.documentCategory && res.policyNumber && res.insuredName) ? 'SUCCESS' : 'PARTIAL'
      });
    } catch (err) {
      results.push({
        file: f,
        error: err.message,
        status: 'ERROR'
      });
    }
  }

  console.log(`TOTAL FILES: ${results.length}`);
  console.log(`SUCCESSFULLY EXTRACTED: ${results.filter(r => r.status === 'SUCCESS').length}`);
  console.log(`PARTIAL / NEED ATTENTION: ${results.filter(r => r.status !== 'SUCCESS').length}\n`);

  // Category counts
  const categoryCounts = {};
  results.forEach(r => {
    categoryCounts[r.category || 'Unknown'] = (categoryCounts[r.category || 'Unknown'] || 0) + 1;
  });
  console.log('Category Counts:', categoryCounts);

  console.log('\n--- FULL AUDIT LIST ---');
  console.log(JSON.stringify(results, null, 2));
}

auditAll54().catch(console.error);
