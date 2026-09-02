require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawData = `
MP04GA4552	17715
MP04ZJ0844	16969
MP04YA7511	760
MP04CB0912	4832
MP04ZL6963	28345
MP04EB7507	9998
MP04CN1508	5666.36
GA07L9228	45534
MP04CJ2645	2530
MP04CT2032	11196
MP09DS4073	7648
MP04CU8801	9996
MP04CP6963	11553
MP04QN4304	2282
MP04CX5642	8439
MP04VF6074	687
MP04SF1726	1282
MP04YB2059	513
MP04CN1498	5230
MP04ZK2023	15597
MP04UG1132	1418
MP04KG0802	4670
MP04CN4513	4473
MP09KD6546	46502
MP07P1734	47333
MP04CL5420	5329
MP04ZF4664	687
MP04EC5499	15093
MP07ZC1277	11472
MP04ZL4271	18111
MP04KG2833	5837
PB39M9839	39079
MP04CX5307	11191
MP48ZH8598	44325
UP85CT2063	52238
UP70FT3435	50466
UP70FT3437	51174
RJ05GB2635	46632
MP09SU7659	1311
MP09ZS9904	21699
MP04CR3198	11946
MP04ZA1437	21586
MP04BA4360	2913
MP04CT2003	38423
MP04CV2880	5953
MP04YA8427	7656
NEW	113816
MP09HG5538	48028
MP04UC1162	865
MP04YR9981	22836
MP09HG2942	50201
MP04CX5416	9994
MH12NR9208	882
MP36C1257	4266
MP38S1667	1314
MP04CJ9537	3495
MP04YR9052	1452
MP04CL3716	7063
MP04SQ6933	1387
MP04YA5899	11840
NEW9	83605
MP05MJ3270	842
MP04UF3275	1425
MP37MR8483	1407
MP04ZH1919	48494
MP04CL5566	10423
MP04SV5837	1414
MP05ZB6573	2060
MP04ZN4097	9005
MP04CG6654	4415
MP47ZE9160	11848
MP37C1668	14665
MP04ZL8631	915
MP37C5791	6908
UP70GT4941	51453
MP04YB2437	11918
MP20CE9904	5921
MP09HF1612	46266
MP04ZY0123	23745
MP04EC1080	10418
MP05MJ3964	842
HR26CM8372	15960
MP04CS8451	3436
MP04CA2453	2913
MP04CV3258	13272
MP04LD2492	4909
MP04CH4265	4429
MP17ZD6923	71283
MP17ZD6944	71283
MP04YR6085	27561
MP04YR6027	27561
NEW1	9556
NEW2	9556
NEW3	9556
MP04CV2483	9852
MP04YR7672	58606
MP04YR7640	58606
MP04YR7606	58606
MP04CN0553	4963
`;

async function main() {
  const lines = rawData.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const excelEntries = lines.map(line => {
    const parts = line.split(/\t+|\s+/);
    return {
      veh: parts[0].trim(),
      prem: parseFloat(parts[1].replace(/,/g, ''))
    };
  });

  console.log(`Total Excel Entries: ${excelEntries.length}`);

  // Fetch all active DB records
  const allDbRecords = await prisma.$queryRaw`
    SELECT id, saved_at, created_at,
           reviewed_data->>'policyNumber' as policy_number,
           data->>'policyNumber' as d_policy_number,
           reviewed_data->>'insuredName' as insured_name,
           data->>'insuredName' as d_insured_name,
           reviewed_data->>'registrationNumber' as reg_no,
           data->>'registrationNumber' as d_reg_no,
           reviewed_data->>'vehicleNumber' as veh_no,
           data->>'vehicleNumber' as d_veh_no,
           reviewed_data->>'totalPremium' as total_premium,
           data->>'totalPremium' as d_total_premium,
           reviewed_data->>'netPremium' as net_premium,
           data->>'netPremium' as d_net_premium,
           reviewed_data->>'insuranceCompany' as company,
           data->>'insuranceCompany' as d_company
    FROM pdf_records
    WHERE deleted_at IS NULL
  `;

  console.log(`Total Active DB Records: ${allDbRecords.length}`);

  const normalizeVeh = (v) => String(v || '').replace(/[\s-]+/g, '').toUpperCase();
  const parseNum = (val) => {
    if (!val) return 0;
    return parseFloat(String(val).replace(/,/g, '')) || 0;
  };

  const found = [];
  const missing = [];
  const premiumMismatches = [];

  for (const entry of excelEntries) {
    const normExcelVeh = normalizeVeh(entry.veh);
    const isNewKey = /^NEW/i.test(entry.veh);

    let match = null;

    if (isNewKey) {
      // Try matching by exact premium if it's a NEW vehicle or warehouse
      match = allDbRecords.find(r => {
        const p1 = Math.round(parseNum(r.total_premium || r.d_total_premium));
        const p2 = Math.round(parseNum(r.net_premium || r.d_net_premium));
        const expPrem = Math.round(entry.prem);
        return (p1 === expPrem || p2 === expPrem);
      });
    } else {
      match = allDbRecords.find(r => {
        const reg1 = normalizeVeh(r.reg_no || r.d_reg_no);
        const veh1 = normalizeVeh(r.veh_no || r.d_veh_no);
        return (reg1 && (reg1.includes(normExcelVeh) || normExcelVeh.includes(reg1))) ||
               (veh1 && (veh1.includes(normExcelVeh) || normExcelVeh.includes(veh1)));
      });
    }

    if (match) {
      const dbTotal = parseNum(match.total_premium || match.d_total_premium);
      const dbNet = parseNum(match.net_premium || match.d_net_premium);
      const diffTotal = Math.abs(dbTotal - entry.prem);
      const diffNet = Math.abs(dbNet - entry.prem);

      const isExactMatch = diffTotal < 2 || diffNet < 2;

      found.push({
        excelVeh: entry.veh,
        excelPrem: entry.prem,
        dbId: match.id,
        dbPolicy: match.policy_number || match.d_policy_number,
        dbInsured: match.insured_name || match.d_insured_name,
        dbVeh: match.reg_no || match.veh_no || match.d_reg_no || match.d_veh_no,
        dbTotal,
        dbNet,
        savedAt: match.saved_at,
        isExactMatch
      });

      if (!isExactMatch) {
        premiumMismatches.push({
          veh: entry.veh,
          excelPrem: entry.prem,
          dbTotal,
          dbNet,
          insured: match.insured_name || match.d_insured_name,
          policy: match.policy_number || match.d_policy_number
        });
      }
    } else {
      missing.push(entry);
    }
  }

  console.log(`\n========================================`);
  console.log(`SUMMARY:`);
  console.log(`Total in Excel: ${excelEntries.length}`);
  console.log(`Found in CRM DB: ${found.length}`);
  console.log(`Missing from CRM DB: ${missing.length}`);
  console.log(`Premium Mismatches (within found): ${premiumMismatches.length}`);

  console.log(`\n========================================`);
  console.log(`MISSING VEHICLES (${missing.length}):`);
  console.log(JSON.stringify(missing, null, 2));

  console.log(`\n========================================`);
  console.log(`PREMIUM MISMATCHES (${premiumMismatches.length}):`);
  console.log(JSON.stringify(premiumMismatches, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
