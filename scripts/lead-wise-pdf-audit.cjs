require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');
const { extractPolicyFromText } = require('../src/lib/policies/pdf/extractor.cjs');

const prisma = new PrismaClient();

const fullExcelData = [
  { sno: 67, date: "20-08-2026", insured: "KAMAL KUMAR SACHDEVA", veh: "MP04GA4552", net: 16781, gross: 17715, insurer: "NEW INDIA", type: "PRIVATE CAR" },
  { sno: 6, date: "04-08-2026", insured: "Ms Siddharth Indane", veh: "MP04ZJ0844", net: 16049, gross: 16969, insurer: "BAJAJ", type: "COMMERCIAL - TP" },
  { sno: 49, date: "14-08-2026", insured: "ABDUL WAZID", veh: "MP04YA7511", net: 644, gross: 760, insurer: "NEW INDIA", type: "TW- OD" },
  { sno: 98, date: "31-08-2026", insured: "ABHISHEK CHAUDA", veh: "MP04CB0912", net: 4095, gross: 4832, insurer: "IFFCO TOKIO", type: "PVT - PACKAGE" },
  { sno: 1, date: "01-08-2026", insured: "ABHISHEK PATIDAR", veh: "MP04ZL6963", net: 24022, gross: 28345, insurer: "IFFCO TOKIO", type: "PVT - PACKAGE" },
  { sno: 82, date: "25-08-2026", insured: "ABHISHEKH KUMAR MISHRA", veh: "MP04EB7507", net: 8473, gross: 9998, insurer: "IFFCO TOKIO", type: "PVT- PACKAGE" },
  { sno: 100, date: "31-08-2026", insured: "AJAY SHRIVASTAVA", veh: "MP04CN1508", net: 4802, gross: 5666.36, insurer: "IFFCO TOKIO", type: "PVT- PACKAGE" },
  { sno: 96, date: "29-08-2026", insured: "ALLAN ERIC VALLES", veh: "GA07L9228", net: 38588, gross: 45534, insurer: "ICICI LOMBARD", type: "PRIVATE CAR" },
  { sno: 70, date: "21-08-2026", insured: "AMARPREET KAUR", veh: "MP04CJ2645", net: 2144, gross: 2530, insurer: "NEW INDIA", type: "PVT - TP" },
  { sno: 7, date: "04-08-2026", insured: "AMRIT LAL PARWANI", veh: "MP04CT2032", net: 9488, gross: 11196, insurer: "BAJAJ", type: "PVT - PACKAGE" },
  { sno: 86, date: "25-08-2026", insured: "ANKIT SHINDE", veh: "MP09DS4073", net: 6512, gross: 7648, insurer: "ICICI LOMBARD", type: "PVT - OD POLICY" },
  { sno: 23, date: "07-08-2026", insured: "ARJUN SONI", veh: "MP04CU8801", net: 8472, gross: 9996, insurer: "NEW INDIA", type: "PVT - TP" },
  { sno: 40, date: "13-08-2026", insured: "ASHISH PATIDAR", veh: "MP04CP6963", net: 9791, gross: 11553, insurer: "NEW INDIA", type: "PVT - PACKAGE" },
  { sno: 88, date: "26-08-2026", insured: "CHANDAN KEER", veh: "MP04QN4304", net: 1934, gross: 2282, insurer: "IFFCO TOKIO", type: "TW - PACKAGE" },
  { sno: 64, date: "19-08-2026", insured: "DEEPAK KOTHARI", veh: "MP04CX5642", net: 7152, gross: 8439, insurer: "GO DIGIT", type: "PVT - PACKAGE" },
  { sno: 51, date: "14-08-2026", insured: "DILIP KUMAR BHILALA", veh: "MP04VF6074", net: 583, gross: 687, insurer: "IFFCO TOKIO", type: "TW - PACKAGE" },
  { sno: 22, date: "07-08-2026", insured: "DILPREET SALUJA", veh: "MP04SF1726", net: 1087, gross: 1282, insurer: "IFFCO TOKIO", type: "TW - PACKAGE" },
  { sno: 66, date: "20-08-2026", insured: "DINESH DUBEY", veh: "MP04YB2059", net: 435, gross: 513, insurer: "ICICI LOMBARD", type: "TWO - WHEELER" },
  { sno: 56, date: "17-08-2026", insured: "DINESH KUMAR RAI", veh: "MP04CN1498", net: 4432, gross: 5230, insurer: "ICICI LOMBARD", type: "PVT- PACKAGE" },
  { sno: 65, date: "19-08-2026", insured: "GAURAV RAGHUWANSHI", veh: "MP04ZK2023", net: 13218, gross: 15597, insurer: "BAJAJ", type: "PVT - PACKAGE" },
  { sno: 39, date: "12-08-2026", insured: "HARMINDER SINGH", veh: "MP04UG1132", net: 1202, gross: 1418, insurer: "NEW INDIA", type: "TW - PACKAGE" },
  { sno: 33, date: "10-08-2026", insured: "HEMENDRA LONARE", veh: "MP04KG0802", net: 3958, gross: 4670, insurer: "ICICI LOMBARD", type: "PVT -PACKAGE" },
  { sno: 92, date: "27-08-2026", insured: "KAMAL KISHORE KUSHWAHA", veh: "MP04CN4513", net: 3791, gross: 4473, insurer: "NEW INDIA", type: "PVT - TP" },
  { sno: 81, date: "24-08-2026", insured: "KAMAL SINGH", veh: "MP09KD6546", net: 44250, gross: 46502, insurer: "NEW INDIA", type: "COMMERCIAL - TP" },
  { sno: 85, date: "25-08-2026", insured: "KEDAR PANWAR", veh: "MP07P1734", net: 40113, gross: 47333, insurer: "NEW INDIA", type: "COMMERCIAL" },
  { sno: 31, date: "10-08-2026", insured: "LAXMI ENGINEERING", veh: "MP04CL5420", net: 4516, gross: 5329, insurer: "ICICI LOMBARD", type: "PVT - PACKAGE" },
  { sno: 29, date: "10-08-2026", insured: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED", veh: "MP04ZF4664", net: 583, gross: 687, insurer: "IFFCO TOKIO", type: "TW - PACKAGE" },
  { sno: 38, date: "12-08-2026", insured: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED", veh: "MP04EC5499", net: 12791, gross: 15093, insurer: "TATA AIG", type: "PVT - PACKAGE" },
  { sno: 42, date: "13-08-2026", insured: "LION ENGINEERING CONSULTANTS PRIVATE LIMITED", veh: "MP07ZC1277", net: 9722, gross: 11472, insurer: "HDFC ERGO", type: "PVT -PACKAGE" },
  { sno: 87, date: "26-08-2026", insured: "M/S ADITYAEVENT", veh: "MP04ZL4271", net: 16851, gross: 18111, insurer: "BAJAJ", type: "COMMERCIAL" },
  { sno: 57, date: "18-08-2026", insured: "M/S G SAGENCIES", veh: "MP04KG2833", net: 4947, gross: 5837, insurer: "BAJAJ", type: "PVT - PACKAGE" },
  { sno: 12, date: "06-08-2026", insured: "M/S M.P. AGROTONICS LIMITED", veh: "PB39M9839", net: 33119, gross: 39079, insurer: "BAJAJ", type: "PVT - OD POLICY" },
  { sno: 74, date: "21-08-2026", insured: "M/S PRIMEONE WORK FORCE PVT LTD", veh: "MP04CX5307", net: 9483, gross: 11191, insurer: "TATA AIG", type: "PVT - PACKAGE" },
  { sno: 97, date: "31-08-2026", insured: "M/s.RONITFUELPOINT", veh: "MP48ZH8598", net: 41454, gross: 44325, insurer: "ROYAL SUNDARAM", type: "COMMERCIAL - PACKAGE" },
  { sno: 25, date: "07-08-2026", insured: "M/s.SHREEBAHORACONSTRUCTIONSPRIVATELIMITED", veh: "UP85CT2063", net: 49112, gross: 52238, insurer: "ROYAL SUNDARAM", type: "COMMERCIAL - PACKAGE" },
  { sno: 43, date: "14-08-2026", insured: "M/s.SHUKLA AGRITECH PRIVATE LIMITED", veh: "UP70FT3435", net: 47642, gross: 50466, insurer: "ROYAL SUNDARAM", type: "COMMERCIAL - PACKAGE" },
  { sno: 44, date: "14-08-2026", insured: "M/s.SHUKLA AGRITECH PRIVATE LIMITED", veh: "UP70FT3437", net: 48242, gross: 51174, insurer: "ROYAL SUNDARAM", type: "COMMERCIAL - PACKAGE" },
  { sno: 13, date: "06-08-2026", insured: "MAHAKAL TRANSPORT AND CO", veh: "RJ05GB2635", net: 44392, gross: 46632, insurer: "NEW INDIA", type: "COMMERCIAL - TP" },
  { sno: 73, date: "21-08-2026", insured: "MAHENDRA SINGH PARIHAR", veh: "MP09SU7659", net: 1111, gross: 1311, insurer: "GO DIGIT", type: "TW -OD" },
  { sno: 95, date: "27-08-2026", insured: "Mr Ankita Goswami", veh: "MP09ZS9904", net: 18389, gross: 21699, insurer: "TATA AIG", type: "PVT - PACKAGE" },
  { sno: 76, date: "21-08-2026", insured: "Mr ANRUDH TIWARI", veh: "MP04CR3198", net: 10124, gross: 11946, insurer: "ROYAL SUNDARAM", type: "PVT - PACKAGE" },
  { sno: 20, date: "06-08-2026", insured: "MR ANUBHAV GUPTA", veh: "MP04ZA1437", net: 18293, gross: 21586, insurer: "HDFC ERGO", type: "PVT - PACKAGE" },
  { sno: 27, date: "08-08-2026", insured: "MR DILIP KHANDELWAL", veh: "MP04BA4360", net: 2469, gross: 2913, insurer: "NEW INDIA", type: "TW - PACKAGE" },
  { sno: 83, date: "25-08-2026", insured: "MR PARTHO CHAKRABORTY", veh: "MP04CT2003", net: 32562, gross: 38423, insurer: "HDFC ERGO", type: "PVT- PACKAGE" },
  { sno: 30, date: "10-08-2026", insured: "MR SANJAY SHRIVASTAVA", veh: "MP04CV2880", net: 5045, gross: 5953, insurer: "HDFC ERGO", type: "PVT - PACAKGE" },
  { sno: 48, date: "14-08-2026", insured: "MR SHUBHAM KUSHWAHA", veh: "MP04YA8427", net: 6491, gross: 7656, insurer: "HDFC ERGO", type: "PVT - PACKAGE" },
  { sno: 46, date: "14-08-2026", insured: "Mr Siddharth Nahar", veh: "NEW", net: 96454, gross: 113816, insurer: "TATA AIG", type: "TWO - WHEELER" },
  { sno: 28, date: "10-08-2026", insured: "MR. DHARMENDRA RAI", veh: "MP09HG5538", net: 45544, gross: 48028, insurer: "ROYAL SUNDARAM", type: "COMMERCIAL - PACKAGE" },
  { sno: 34, date: "10-08-2026", insured: "MR. JAGENDRA RATHORE", veh: "MP04UC1162", net: 733, gross: 865, insurer: "TATA AIG", type: "TW- PACKAGE" },
  { sno: 32, date: "10-08-2026", insured: "MR. VISHAL AGRAWAL", veh: "MP04YR9981", net: 19437, gross: 22836, insurer: "HDFC ERGO", type: "PVT - OD POLICY" },
  { sno: 77, date: "22-08-2026", insured: "Mr.DHARMENDRARAI", veh: "MP09HG2942", net: 47386, gross: 50201, insurer: "ROYAL SUNDARAM", type: "COMMERCIAL - PACKAGE" },
  { sno: 35, date: "10-08-2026", insured: "MRS Pushpa Sharma", veh: "MP04CX5416", net: 8469, gross: 9994, insurer: "GENERALI CENTRAL", type: "PVT - PACKAGE" },
  { sno: 26, date: "08-08-2026", insured: "MRS. HANDEL PALAK", veh: "MH12NR9208", net: 748, gross: 882, insurer: "TATA AIG", type: "TW- PACKAGE" },
  { sno: 14, date: "06-08-2026", insured: "MS JAI SHRIRAM TRADING CO RAM SEWAK", veh: "MP36C1257", net: 3616, gross: 4266, insurer: "NEW INDIA", type: "PVT - TP" },
  { sno: 37, date: "11-08-2026", insured: "MS YASHI SHRIVASTAV", veh: "MP38S1667", net: 1114, gross: 1314, insurer: "NEW INDIA", type: "TW-TP" },
  { sno: 69, date: "21-08-2026", insured: "NARENDRA SINGH BAGGA", veh: "MP04CJ9537", net: 2962, gross: 3495, insurer: "ICICI LOMBARD", type: "PVT - PACKAGE" },
  { sno: 21, date: "07-08-2026", insured: "NITIN SINGH RAJPUT", veh: "MP04YR9052", net: 1230, gross: 1452, insurer: "NEW INDIA", type: "TW - OD" },
  { sno: 36, date: "11-08-2026", insured: "PANJAB SINGH YADAV", veh: "MP04CL3716", net: 5986, gross: 7063, insurer: "ICICI LOMBARD", type: "PVT- PACKAGE" },
  { sno: 45, date: "14-08-2026", insured: "PIYUSH SAHU", veh: "MP04SQ6933", net: 1175, gross: 1387, insurer: "NEW INDIA", type: "TWO - WHEELER" },
  { sno: 89, date: "26-08-2026", insured: "PRABHJOT SINGH DEVGUN", veh: "MP04YA5899", net: 10034, gross: 11840, insurer: "ICICI LOMBARD", type: "PVT- PACKAGE" },
  { sno: 47, date: "14-08-2026", insured: "PRAGATI FOODS", veh: "NEW9", net: 70851, gross: 83605, insurer: "TATA AIG", type: "PVT - PACKAGE" },
  { sno: 62, date: "19-08-2026", insured: "PRAKASH KUMAR PANDEY", veh: "MP05MJ3270", net: 714, gross: 842, insurer: "NEW INDIA", type: "TW - TP" },
  { sno: 24, date: "07-08-2026", insured: "PRAMOD BHAISARE", veh: "MP04UF3275", net: 1207, gross: 1425, insurer: "NEW INDIA", type: "TW - PACKAGE" },
  { sno: 50, date: "14-08-2026", insured: "PRANAV KUMAR SHARMA", veh: "MP37MR8483", net: 1193, gross: 1407, insurer: "NEW INDIA", type: "TW - PACKAGE" },
  { sno: 54, date: "17-08-2026", insured: "RACHANA PETROLEUM", veh: "MP04ZH1919", net: 41097, gross: 48494, insurer: "ICICI LOMBARD", type: "PVT - PACKAGE" },
  { sno: 52, date: "17-08-2026", insured: "RAJENDRA GUPTA", veh: "MP04CL5566", net: 8833, gross: 10423, insurer: "NEW INDIA", type: "PVT - PACKAGE" },
  { sno: 41, date: "13-08-2026", insured: "RAKESH TIWARI", veh: "MP04SV5837", net: 1198, gross: 1414, insurer: "NEW INDIA", type: "TW- PACKAGE" },
  { sno: 68, date: "21-08-2026", insured: "RAKESH TIWARI", veh: "MP05ZB6573", net: 1746, gross: 2060, insurer: "BAJAJ", type: "TW -OD" },
  { sno: 99, date: "31-08-2026", insured: "RAMSWRUP SINGH RAGHUWANSHI", veh: "MP04ZN4097", net: 7631, gross: 9005, insurer: "ICICI LOMBARD", type: "PVT - OD POLICY" },
  { sno: 2, date: "01-08-2026", insured: "RAVI SHANKAR IYER", veh: "MP04CG6654", net: 3741, gross: 4415, insurer: "NEW INDIA", type: "PVT - TP" },
  { sno: 80, date: "24-08-2026", insured: "ROUNAK GARG", veh: "MP47ZE9160", net: 10041, gross: 11848, insurer: "IFFCO TOKIO", type: "PVT - PACKAGE" },
  { sno: 90, date: "26-08-2026", insured: "SADHNA RAI", veh: "MP37C1668", net: 12428, gross: 14665, insurer: "ICICI LOMBARD", type: "PVT- PACKAGE" },
  { sno: 75, date: "21-08-2026", insured: "SAMEER KHAN", veh: "MP04ZL8631", net: 775, gross: 915, insurer: "NEW INDIA", type: "TW - OD" },
  { sno: 3, date: "03-08-2026", insured: "SANJAY KUMAR SONI", veh: "MP37C5791", net: 5854, gross: 6908, insurer: "ICICI LOMBARD", type: "PVT - PACKAGE" },
  { sno: 93, date: "27-08-2026", insured: "SANJEEV PRASAD SHUKLA", veh: "UP70GT4941", net: 48479, gross: 51453, insurer: "ROYAL SUNDARAM", type: "COMMERCIAL - PACKAGE" },
  { sno: 84, date: "25-08-2026", insured: "SANJEEV SINGHAI", veh: "MP04YB2437", net: 10100, gross: 11918, insurer: "ICICI LOMBARD", type: "PVT - OD POLICY" },
  { sno: 15, date: "06-08-2026", insured: "SANKET AGRAWAL", veh: "MP20CE9904", net: 5018, gross: 5921, insurer: "IFFCO TOKIO", type: "PVT - PACKAGE" },
  { sno: 63, date: "19-08-2026", insured: "SHAREEF KHAN", veh: "MP09HF1612", net: 44050, gross: 46266, insurer: "NEW INDIA", type: "COMMERCIAL - TP" },
  { sno: 18, date: "06-08-2026", insured: "SHEETALNATH BUILDERS PVT LTD", veh: "MP04ZY0123", net: 20123, gross: 23745, insurer: "BAJAJ", type: "PVT- OD" },
  { sno: 91, date: "27-08-2026", insured: "SHREENATHJI INFRASTRUCTURE", veh: "MP04EC1080", net: 8829, gross: 10418, insurer: "GENERALI CENTRAL", type: "PVT- PACKAGE" },
  { sno: 94, date: "27-08-2026", insured: "SHRI SATGURU AGROMILLS PRIVATE LTD", veh: "MP05MJ3964", net: 714, gross: 842, insurer: "NEW INDIA", type: "TW- TP" },
  { sno: 53, date: "17-08-2026", insured: "SUDEEP NIMBALKAR", veh: "HR26CM8372", net: 13526, gross: 15960, insurer: "NEW INDIA", type: "PVT - PACKAGE" },
  { sno: 5, date: "03-08-2026", insured: "SULAKSHNA TIWARI", veh: "MP04CS8451", net: 2912, gross: 3436, insurer: "ICICI LOMBARD", type: "PVT - PACKAGE" },
  { sno: 4, date: "03-08-2026", insured: "SUNIL CHAUDHARY", veh: "MP04CA2453", net: 2469, gross: 2913, insurer: "NEW INDIA", type: "PVT - TP" },
  { sno: 19, date: "06-08-2026", insured: "SUNIL CHAUDHARY", veh: "MP04CV3258", net: 11248, gross: 13272, insurer: "BAJAJ", type: "PVT - PACKAGE" },
  { sno: 55, date: "17-08-2026", insured: "SUNIL MAHESHWARI", veh: "MP04LD2492", net: 4655, gross: 4909, insurer: "NEW INDIA", type: "COMMERCIAL - PACKAGE" },
  { sno: 58, date: "18-08-2026", insured: "T U LANJEWAR", veh: "MP04CH4265", net: 3753, gross: 4429, insurer: "ICICI LOMBARD", type: "PVT - PACKAGE" },
  { sno: 16, date: "06-08-2026", insured: "VIJAY KUMAR MISHRA CONSTRUCTION PVT. LTD", veh: "MP17ZD6923", net: 65251, gross: 71283, insurer: "NEW INDIA", type: "COMMERCIAL - PACKAGE" },
  { sno: 17, date: "06-08-2026", insured: "VIJAY KUMAR MISHRA CONSTRUCTION PVT. LTD", veh: "MP17ZD6944", net: 65251, gross: 71283, insurer: "NEW INDIA", type: "COMMERCIAL - PACKAGE" },
  { sno: 78, date: "24-08-2026", insured: "VIJAY KUMAR MISHRA CONSTRUCTION PVT. LTD", veh: "MP04YR6085", net: 23357, gross: 27561, insurer: "IFFCO TOKIO", type: "COMMERCIAL - PACKAGE" },
  { sno: 79, date: "24-08-2026", insured: "VIJAY KUMAR MISHRA CONSTRUCTION PVT. LTD", veh: "MP04YR6027", net: 23357, gross: 27561, insurer: "IFFCO TOKIO", type: "COMMERCIAL - PACKAGE" },
  { sno: 8, date: "04-08-2026", insured: "VIJAY KUMAR MISHRA PVT", veh: "NEW1", net: 8098, gross: 9556, insurer: "NEW INDIA", type: "COMMERCIAL - BUNDLE" },
  { sno: 9, date: "04-08-2026", insured: "VIJAY KUMAR MISHRA PVT", veh: "NEW2", net: 8098, gross: 9556, insurer: "NEW INDIA", type: "COMMERCIAL - BUNDLE" },
  { sno: 10, date: "04-08-2026", insured: "VIJAY KUMAR MISHRA PVT", veh: "NEW3", net: 8098, gross: 9556, insurer: "NEW INDIA", type: "COMMERCIAL - BUNDLE" },
  { sno: 11, date: "05-08-2026", insured: "Vosmi sharma", veh: "MP04CV2483", net: 8349, gross: 9852, insurer: "IFFCO TOKIO", type: "PVT - PACKAGE" },
  { sno: 59, date: "19-08-2026", insured: "World Way International School", veh: "MP04YR7672", net: 49666, gross: 58606, insurer: "TATA AIG", type: "COMMERCIAL - PACKAGE" },
  { sno: 60, date: "19-08-2026", insured: "World Way International School", veh: "MP04YR7640", net: 49666, gross: 58606, insurer: "TATA AIG", type: "COMMERCIAL - PACKAGE" },
  { sno: 61, date: "19-08-2026", insured: "World Way International School", veh: "MP04YR7606", net: 49666, gross: 58606, insurer: "TATA AIG", type: "COMMERCIAL - PACKAGE" },
  { sno: 0, date: "01-08-2026", insured: "YUNUS HUSSIAN", veh: "MP04CN0553", net: 4206, gross: 4963, insurer: "ICICI LOMBARD", type: "PVT- PACKAGE" }
];

async function runLeadWisePdfAudit() {
  const filesInStorage = fs.readdirSync('storage').filter(f => f.toLowerCase().endsWith('.pdf'));

  // Get uploaded_files from DB
  const uploadedFiles = await prisma.uploadedFile.findMany();
  const dbRecords = await prisma.policyRecord.findMany({ where: { deletedAt: null } });

  console.log(`Checking ${fullExcelData.length} leads against PDFs in storage & database...`);

  const report = [];

  for (const item of fullExcelData) {
    const veh = item.veh.replace(/\s+/g, '').toUpperCase();
    const expectedNet = item.net;

    // 1. Find PDF file in storage/
    let matchedFile = null;
    if (veh.startsWith('NEW')) {
      // match by name / number
      matchedFile = filesInStorage.find(f => f.toUpperCase().includes(item.insured.toUpperCase().split(' ')[0]));
    } else {
      matchedFile = filesInStorage.find(f => {
        const cleanF = f.replace(/[\s-_()]+/g, '').toUpperCase();
        return cleanF.includes(veh);
      });
    }

    // 2. Find DB record
    const dbMatch = dbRecords.find(r => {
      const rReg = String(r.reviewedData?.registrationNumber || r.reviewedData?.vehicleNumber || r.data?.registrationNumber || r.data?.vehicleNumber || '').replace(/\s+/g, '').toUpperCase();
      if (veh.startsWith('NEW')) {
        const dbNet = parseFloat(String(r.reviewedData?.netPremium || r.data?.netPremium || '0').replace(/,/g, ''));
        return Math.abs(dbNet - expectedNet) < 2;
      }
      return rReg === veh || (veh.length > 4 && rReg.includes(veh));
    });

    let pdfExtractedNet = null;
    let pdfExtractedGross = null;
    let pdfFileName = matchedFile || (dbMatch?.uploadedFileId ? `[Linked File ID: ${dbMatch.uploadedFileId}]` : 'Not in storage');

    if (matchedFile) {
      try {
        const buf = fs.readFileSync(path.join('storage', matchedFile));
        const parsed = await pdf(buf);
        const extracted = extractPolicyFromText(parsed.text, matchedFile);
        pdfExtractedNet = extracted.netPremium ? parseFloat(String(extracted.netPremium).replace(/,/g, '')) : null;
        pdfExtractedGross = extracted.totalPremium ? parseFloat(String(extracted.totalPremium).replace(/,/g, '')) : null;
      } catch (err) {
        pdfFileName += ` (Parse Error: ${err.message})`;
      }
    }

    const rawDbNet = dbMatch?.reviewedData?.netPremium || dbMatch?.data?.netPremium;
    const dbNet = rawDbNet ? parseFloat(String(rawDbNet).replace(/,/g, '')) : null;
    const dbGross = dbMatch ? parseFloat(String(dbMatch.reviewedData?.totalPremium || dbMatch.data?.totalPremium || '0').replace(/,/g, '')) : null;

    report.push({
      sno: item.sno,
      date: item.date,
      insured: item.insured,
      veh: item.veh,
      excelNet: item.net,
      excelGross: item.gross,
      pdfFile: matchedFile || '-',
      pdfNet: pdfExtractedNet !== null ? `₹${pdfExtractedNet}` : '-',
      dbNet: dbNet !== null ? `₹${dbNet}` : '(empty)',
      dbGross: dbGross !== null ? `₹${dbGross}` : '-',
      status: (pdfExtractedNet !== null && Math.abs(pdfExtractedNet - expectedNet) < 2)
        ? 'EXACT_PDF_MATCH'
        : (dbNet !== null && Math.abs(dbNet - expectedNet) < 2)
        ? 'EXACT_DB_MATCH'
        : (pdfExtractedNet === null && dbNet === null)
        ? 'NO_NET_VALUE'
        : 'NET_DIFF'
    });
  }

  console.log('\n========================================');
  console.log(`TOTAL LEADS CHECKED: ${report.length}`);
  console.log(`EXACT PDF MATCHES: ${report.filter(r => r.status === 'EXACT_PDF_MATCH').length}`);
  console.log(`EXACT DB MATCHES: ${report.filter(r => r.status === 'EXACT_DB_MATCH').length}`);
  console.log(`NET VALUE DIFFERENCES: ${report.filter(r => r.status === 'NET_DIFF').length}`);
  console.log(`NO NET VALUE EXTRACTED/SAVED: ${report.filter(r => r.status === 'NO_NET_VALUE').length}`);
  console.log('========================================\n');

  console.log('--- DETAILED LEAD-WISE REPORT ---');
  console.log(JSON.stringify(report, null, 2));
}

runLeadWisePdfAudit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
