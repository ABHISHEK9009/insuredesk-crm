const fs = require('fs');
const path = require('path');
const { extractPolicyFromPdf } = require('../src/lib/policies/pdf/extractor.cjs');

async function main() {
  const dir = path.resolve('storage/health');
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf'));

  console.log(`\n================ TESTING ${files.length} HEALTH POLICY EXTRACTIONS ================\n`);

  const results = [];
  let successCount = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const buffer = fs.readFileSync(filePath);
      const res = await extractPolicyFromPdf(buffer, file);

      const isValid = (
        res.documentCategory === "Health Insurance" &&
        res.insuranceCompany &&
        res.policyNumber &&
        res.insuredName &&
        !/Member\s+ID|Date\s+of\s+Birth/i.test(res.insuredName) &&
        res.totalPremium &&
        res.policyStartDate &&
        res.policyEndDate
      );

      if (isValid) successCount++;

      results.push({
        file: file.length > 35 ? file.slice(0, 32) + '...' : file,
        insurer: (res.insuranceCompany || "MISSING").replace(/ (?:General )?Insurance(?: Company)?(?: Limited)?/i, ""),
        category: res.documentCategory,
        policyNo: res.policyNumber || "MISSING",
        insuredName: res.insuredName || res.customerName || "MISSING",
        premium: res.totalPremium || res.grossPremium || "MISSING",
        period: `${res.policyStartDate || '?'} to ${res.policyEndDate || '?'}`,
        sumIns: res.sumInsured || "N/A",
        status: isValid ? "✅ PASS" : "⚠️ CHECK",
      });
    } catch (err) {
      results.push({
        file,
        error: err.message,
        status: "❌ ERROR",
      });
    }
  }

  console.table(results);
  console.log(`\nResults: ${successCount} / ${files.length} Passed Perfectly`);
}

main();
