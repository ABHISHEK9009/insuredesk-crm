import { SERVICES } from "@/content/services";
import { BUSINESS_DETAILS, SITE_URL } from "@/lib/seo/site";

const SERVICE_HERO_IMAGES = {
  "commercial-insurance": "/brand/services/commercial.jpg",
  "fire-insurance": "/brand/services/fire.jpg",
  "warehouse-insurance": "/brand/services/warehouse.jpg",
  "marine-insurance": "/brand/services/marine.jpg",
  "risk-advisory": "/brand/services/risk-advisory.jpg",
  "health-insurance": "/brand/services/health.jpg",
  "motor-insurance": "/brand/services/motor.jpg",
  "life-insurance": "/brand/services/life.jpg",
  "home-insurance": "/brand/services/home.jpg",
  "travel-insurance": "/brand/services/travel.jpg",
  "claims-assistance": "/brand/services/claims.jpg",
  "policy-renewals": "/brand/services/renewal.jpg",
  "general-insurance": "/brand/services/general.jpg",
};

export const SERVICE_POLICY_ARCHITECTURE = {
  "commercial-insurance": {
    quickFacts: {
      regulatory: "IRDAI Regulated IMF Framework",
      valuationBasis: "Reinstatement Value (RVC) / Gross Profit (FLOP)",
      policyStructure: "Industrial All Risk (IAR) / SFSP / Package",
      advisoryScope: "Bhopal Central Hub • Pan-India Execution",
    },
    coverageDimensions: [
      {
        icon: "factory",
        title: "Industrial Assets & Plant Machinery",
        desc: "Covers factory buildings, heavy plant machinery, tooling, and electrical installations against catastrophic fire, explosion, and mechanical breakdown.",
      },
      {
        icon: "trending_up",
        title: "Business Interruption & Fixed Costs",
        desc: "Protects gross profit, ongoing salaries, loan EMIs, and standing overheads when operational loss forces temporary manufacturing shutdown.",
      },
      {
        icon: "shield_person",
        title: "Third-Party & Public Liability",
        desc: "Insures against statutory liabilities, legal claims, property damages, or personal injuries sustained by visitors or third parties on commercial premises.",
      },
      {
        icon: "devices",
        title: "Electronic Equipment & Inventory",
        desc: "Covers corporate servers, automation controllers, finished goods inventory, raw materials, and warehouse stock under single or floater structures.",
      },
    ],
    inclusions: [
      "Fire, lightning, explosion, aircraft damage, and riot strike malicious damage (RSMD)",
      "Storm, tempest, flood, inundation (STFI) and natural calamity extensions",
      "Machinery breakdown (MBD) and electronic equipment insurance (EEI)",
      "Business interruption loss of profits following an indemnified physical loss",
      "Burglary, housebreaking, and armed robbery of inventory and capital tools",
      "Public liability and statutory employee compensation / workmen's liability",
    ],
    exclusions: [
      "Willful act, gross negligence, or intentional violation of factory safety codes",
      "Normal wear and tear, gradual deterioration, erosion, and atmospheric weathering",
      "Consequential financial loss unless explicit Fire Loss of Profit (FLOP) cover is endorsed",
      "War, civil commotion, radiation, nuclear perils, and government confiscation",
      "Unrecorded inventory discrepancies or mysterious disappearances during audit",
    ],
    geoScope: {
      hub: "Bhopal Central Advisory Desk (InsureDesk IMF Headquarters)",
      corridors: "Mandideep, Govindpura, Pithampur, Dewas, Pune-Chakan, Sanand-Ahmedabad & NCR Belts",
      logistics: "Dedicated coverage for multimodal dispatches via Western & Eastern Freight Corridors",
      surveyors: "Pan-India IRDAI licensed surveyor coordination across all 28 Indian States & UTs",
    },
    claimsProtocol: [
      { step: "01", title: "Immediate Loss Intimation", desc: "Notify Bima Headquarter & insurer within 24 hours of incident with timestamped visual documentation." },
      { step: "02", title: "Surveyor On-Site Inspection", desc: "Independent IRDAI surveyor inspects premises, notes point of origin, and prepares preliminary loss assessment." },
      { step: "03", title: "Substantiating Dossier", desc: "Collate equipment purchase invoices, repair estimates, stock registers, and official incident/FIR logs." },
      { step: "04", title: "Settlement Advocacy", desc: "Bima Headquarter actively interprets policy wording and depreciation clauses to optimize final payout." },
    ],
  },
  "marine-insurance": {
    quickFacts: {
      regulatory: "Marine Insurance Act, 1963 & IRDAI Guidelines",
      valuationBasis: "CIF + 10% (Cost, Insurance, Freight + Profit) / Invoice Value",
      policyStructure: "Marine Cargo Open Policy / Specific Voyage / Inland Transit (ITC)",
      advisoryScope: "Bhopal IMF Operations • Nationwide Gateway Support",
    },
    coverageDimensions: [
      {
        icon: "directions_boat",
        title: "Ocean Cargo & Port Shipments",
        desc: "Covers international export-import cargo under Institute Cargo Clauses (ICC A/B/C) against vessel stranding, sinking, fire, collision, and general average.",
      },
      {
        icon: "local_shipping",
        title: "Inland Multimodal Transit (Road & Rail)",
        desc: "Protects goods moving between factory gates, warehouses, and distributor hubs via road, rail, and domestic air under Inland Transit Clauses (ITC A/B).",
      },
      {
        icon: "warehouse",
        title: "Warehouse-to-Warehouse Protection",
        desc: "Provides continuous transit risk cover starting from original packaging dispatch, intermediate loading/unloading, through to final receiver unloading.",
      },
      {
        icon: "payments",
        title: "Duty, Freight & High-Sea Sales",
        desc: "Specialized endorsements covering customs duty exposure, forward freight charges, and intermediate transshipment ownership transfers.",
      },
    ],
    inclusions: [
      "Physical loss or damage caused by fire, explosion, overturning, derailment, or collision",
      "Jettison, washing overboard, general average sacrifices, and salvage expenditure",
      "Total loss of package during loading, transshipment, or unloading operations",
      "All Risks transit protection under Institute Cargo Clauses (A) or Inland Transit (A)",
      "Strike, Riots, and Civil Commotion (SRCC) extensions along transit routes",
      "Theft, pilferage, non-delivery (TPND) clauses when specifically endorsed",
    ],
    exclusions: [
      "Inherent vice, natural perishability, or quality degradation of perishable cargo",
      "Improper, defective, or insufficient packing/preparation of the insured cargo",
      "Ordinary leakage, natural loss in weight or volume, and ordinary wear and tear",
      "Deliberate misconduct or intentional cargo abandonment by the insured",
      "Insolvency or financial default of owners, managers, or operators of the carrying vessel",
    ],
    geoScope: {
      hub: "Bhopal IMF Marine Desk (Centralized Advisory & Policy Issuance)",
      corridors: "National Expressways NH-44, NH-46, NH-48 & Major Industrial Freight Lines",
      logistics: "Inland Container Depots (Dhannad, Mandideep, Dadri) & ICD transshipment corridors",
      surveyors: "Port-side survey coordination at JNPT Mumbai, Mundra, Kandla, Chennai, Hazira & Kolkata",
    },
    claimsProtocol: [
      { step: "01", title: "Delivery Receipt Endorsement", desc: "Endorse damage or shortage remarks directly on the Consignment Note / Lorry Receipt (LR) before signing." },
      { step: "02", title: "Damage Notice to Carrier", desc: "Serve a formal monetary claim notice on the transport carrier within statutory time limits to protect recovery rights." },
      { step: "03", title: "Surveyor Appointment", desc: "IRDAI-accredited marine surveyor inspects damaged goods at the receiving warehouse or port warehouse." },
      { step: "04", title: "Claim Dossier & Settlement", desc: "Submit LR copy, commercial invoice, packing list, damage certificate, and letter of subrogation for rapid settlement." },
    ],
  },
  "fire-insurance": {
    quickFacts: {
      regulatory: "IRDAI Bharat Sookshma / Laghu / Griha Udyam Suraksha",
      valuationBasis: "Reinstatement Value Clause (RVC) for Fixed Assets; Market Value for Stocks",
      policyStructure: "Named Perils / Floater Declaration / Industrial SFSP",
      advisoryScope: "Bhopal Central Desk • Pan-India Commercial Support",
    },
    coverageDimensions: [
      {
        icon: "local_fire_department",
        title: "Standard Fire & Allied Perils",
        desc: "Covers catastrophic losses caused by fire, lightning, explosion, implosion, and aircraft damage to building structures, plant, and raw materials.",
      },
      {
        icon: "water_damage",
        title: "STFI & Natural Inundation",
        desc: "Protects business assets against storms, cyclones, typhoons, tempests, hurricanes, floods, and severe water inundation.",
      },
      {
        icon: "emergency",
        title: "Riot, Strike & Malicious Damage",
        desc: "Covers property destruction arising from public unrest, labor strikes, civil demonstrations, and intentional malicious acts by external parties.",
      },
      {
        icon: "architecture",
        title: "Impact Damage & Subsidence",
        desc: "Protects walls and structures against impact by road vehicles, falling trees, collapse of structures, and ground landslide/rockslide.",
      },
    ],
    inclusions: [
      "Physical damage caused by fire, lightning, explosion, and implosion",
      "Storm, cyclone, typhoon, tempest, hurricane, tornado, and flood (STFI)",
      "Riot, Strike, and Malicious Damage (RSMD) as standard under Bharat Udyam covers",
      "Bursting or overflowing of water tanks, apparatus, and industrial piping",
      "Missile testing operations, impact damage from external vehicles or falling objects",
      "Bush fire, forest fire, and jungle fire spreading to commercial boundaries",
    ],
    exclusions: [
      "Loss caused by spontaneous combustion, fermentation, or natural heating unless endorsed",
      "Theft, burglary, or larceny during or immediately following a fire incident",
      "Earthquake and volcanic eruption unless specifically added via tariff endorsement",
      "Willful destruction, arson, or negligence in maintaining mandatory fire-fighting apparatus",
      "Loss or damage to bullion, precious stones, curios, or work of art without explicit declaration",
    ],
    geoScope: {
      hub: "Bhopal Central Commercial Advisory Desk",
      corridors: "Industrial Estates in Mandideep, Govindpura, Pithampur, Dewas, Sanand & Chakan",
      logistics: "Warehouses, cold storages, and commercial hubs along national highways across India",
      surveyors: "IRDAI licensed fire loss adjusters available across all tier-1, tier-2 & tier-3 districts",
    },
    claimsProtocol: [
      { step: "01", title: "Emergency Response & Intimation", desc: "Call Fire Brigade, mitigate spreading loss, and alert Bima Headquarter & insurer claim desk immediately." },
      { step: "02", title: "Site Preservation & Police Log", desc: "Preserve the affected area unchanged for surveyor inspection; file an immediate Police Station Diary / FIR." },
      { step: "03", title: "Surveyor Joint Inspection", desc: "Accompany the IRDAI surveyor during root-cause inspection, debris evaluation, and salvage estimation." },
      { step: "04", title: "Dossier & Claim Release", desc: "Submit Fire Brigade report, forensic report (if applicable), asset registers, and repair estimates for payout." },
    ],
  },
  "warehouse-insurance": {
    quickFacts: {
      regulatory: "IRDAI Commercial Property & Storage Regulations",
      valuationBasis: "Declaration Policy / Floater Sum Insured / Peak Capacity Value",
      policyStructure: "SFSP + Burglary First Loss + Material Handling Extension",
      advisoryScope: "Bhopal Hub • Pan-India Logistics Parks",
    },
    coverageDimensions: [
      {
        icon: "warehouse",
        title: "Storage Building & Logistics Infrastructure",
        desc: "Covers warehouse sheds, racking systems, automated conveyors, loading docks, and electrical substations against fire, storms, and impact.",
      },
      {
        icon: "inventory_2",
        title: "Fluctuating Inventory & Stock Floater",
        desc: "Accommodates dynamic stock levels with monthly declaration structures so you only pay premium for the actual cargo held in storage.",
      },
      {
        icon: "lock",
        title: "Burglary, Theft & Violent Break-in",
        desc: "Covers armed robbery, forced warehouse break-ins, and theft of stored consumer electronics, FMCG goods, and industrial raw materials.",
      },
      {
        icon: "forklift",
        title: "Handling Equipment & Internal Transit",
        desc: "Insures forklifts, reach trucks, pallet stackers, and cargo handling gear against accidental collisions and operational overturns.",
      },
    ],
    inclusions: [
      "Fire, lightning, explosion, and allied perils affecting storage sheds and cargo",
      "Storm, cyclone, flood, and water inundation affecting ground-level inventory",
      "Burglary and housebreaking involving actual forcible and violent entry/exit",
      "Impact damage caused by heavy transport trucks, trailers, or internal forklifts",
      "Debris removal expenses and professional architect/surveyor fees following a claim",
      "Monthly declaration option for seasonal peak stock variations",
    ],
    exclusions: [
      "Inventory shortages discovered during periodic stock-taking without evidence of break-in",
      "Loss or damage caused by contamination, seepage, dampness, rodents, or termites",
      "Goods stored in open compounds or temporary tarp sheds without prior insurer consent",
      "Employee fidelity theft or embezzlement unless covered under a separate Crime policy",
      "Consequential loss or penalty clauses imposed by third-party cargo owners",
    ],
    geoScope: {
      hub: "Bhopal IMF Logistics & Warehousing Practice",
      corridors: "Central India Distribution Centers (Bhopal-Indore), Bhiwandi, Bilaspur-Gurugram, Chennai Logistics Parks",
      logistics: "Warehouses connected to Multi-Modal Logistics Parks (MMLP) and Inland Container Depots",
      surveyors: "Specialized cargo loss evaluators empaneled across all major Indian storage clusters",
    },
    claimsProtocol: [
      { step: "01", title: "Immediate Incident Recording", desc: "Record CCTV footage, seal affected bays, and notify Bima Headquarter and insurer claims desk." },
      { step: "02", title: "Police Intimation & Spot Survey", desc: "Lodge Police FIR in cases of theft or burglary; independent surveyor appointed for physical verification." },
      { step: "03", title: "Stock Reconciliation Dossier", desc: "Provide inward-outward delivery registers, WMS logs, invoices, and physical stock count sheets." },
      { step: "04", title: "Settlement & Salvage Disposal", desc: "Assist with salvage valuation, carrier recovery coordination, and final insurance claim reimbursement." },
    ],
  },
  "motor-insurance": {
    quickFacts: {
      regulatory: "Motor Vehicles Act, 1988 & IRDAI General Insurance Regulations",
      valuationBasis: "Insured Declared Value (IDV) as per Fixed Depreciation Scale",
      policyStructure: "Comprehensive Package (OD + TP) / Standalone OD / Fleet Policy",
      advisoryScope: "Bhopal Head Office • Pan-India Cashless Garage Network",
    },
    coverageDimensions: [
      {
        icon: "minor_crash",
        title: "Own Damage (OD) Accidental Protection",
        desc: "Covers vehicle repair costs arising from road collisions, overturns, falling objects, external explosions, and transit accidents.",
      },
      {
        icon: "gavel",
        title: "Mandatory Third-Party (TP) Liability",
        desc: "Fulfills statutory requirements under the Motor Vehicles Act, covering unlimited bodily injury liabilities and property damage to third parties.",
      },
      {
        icon: "security",
        title: "Total Loss & Theft Protection",
        desc: "Reimburses the full Insured Declared Value (IDV) of the vehicle in the unfortunate event of vehicle theft or unrepairable total destruction.",
      },
      {
        icon: "extension",
        title: "Customizable Bumper-to-Bumper Add-ons",
        desc: "Options for Zero Depreciation, Engine Protect, Return to Invoice (RTI), Consumables cover, Tyre Secure, and 24x7 Roadside Assistance.",
      },
    ],
    inclusions: [
      "Accidental loss or damage by external collision, fire, explosion, self-ignition, or lightning",
      "Loss caused by natural disasters like earthquake, flood, storm, cyclone, and rockslide",
      "Theft, burglary, housebreaking, and malicious damage to vehicle body and fittings",
      "Damage sustained while vehicle is being transported by road, rail, inland waterway, or lift",
      "Compulsory Personal Accident (CPA) cover for registered owner-driver up to ₹15 Lakhs",
      "Zero Depreciation add-on removing material depreciation on rubber, metal, and fiber parts",
    ],
    exclusions: [
      "Driving without a valid license or under the influence of alcohol, drugs, or toxic substances",
      "Normal wear and tear, mechanical or electrical breakdown, failure, or breakage",
      "Consequential damage such as engine seizure caused by driving through flooded water without Engine Protect",
      "Use of private vehicle for commercial hire/reward without appropriate commercial permit endorsement",
      "Damage to tyres and tubes unless the vehicle is damaged at the same time in an accident",
    ],
    geoScope: {
      hub: "Bhopal IMF Motor Desk (Fast-track endorsements & renewal service)",
      corridors: "Personal cars, commercial fleets, and logistics trucks operating across all Indian National Highways",
      logistics: "10,000+ cashless garage tie-ups across Tier-1, Tier-2, and Tier-3 Indian cities",
      surveyors: "Instant digital spot survey and IRDAI surveyor dispatch nationwide",
    },
    claimsProtocol: [
      { step: "01", title: "Spot Verification & Intimation", desc: "Take clear photos of the accident scene, vehicle damage, and vehicle registration before moving the vehicle." },
      { step: "02", title: "Cashless Network Garage Drop", desc: "Tow or drive vehicle to an empaneled cashless garage; file claim form with vehicle RC and driving license." },
      { step: "03", title: "Digital or On-Site Survey", desc: "Insurance surveyor inspects damaged parts, approves estimate, and authorizes repair commencement." },
      { step: "04", title: "Direct Insurer Settlement", desc: "Insurer settles approved repair invoice directly with network garage minus deductible and non-covered parts." },
    ],
  },
  "health-insurance": {
    quickFacts: {
      regulatory: "IRDAI Health Insurance Regulations (Cashless Everywhere Framework)",
      valuationBasis: "Sum Insured + Cumulative No Claim Bonus + Super Top-up Buffer",
      policyStructure: "Individual Plan / Family Floater / Group Medical Cover (GMC)",
      advisoryScope: "Bhopal Central Desk • 10,000+ Network Hospitals Nationwide",
    },
    coverageDimensions: [
      {
        icon: "local_hospital",
        title: "Inpatient Hospitalization & ICU Cover",
        desc: "Covers room rent, ICU charges, surgeon fees, nursing charges, diagnostics, and operation theatre fees for hospitalizations exceeding 24 hours.",
      },
      {
        icon: "medication",
        title: "Pre & Post Hospitalization Medical Bills",
        desc: "Reimburses diagnostic tests, medical consults, and medicines incurred 60 days before hospital admission and up to 180 days post discharge.",
      },
      {
        icon: "medical_services",
        title: "Daycare Treatments & Modern Surgeries",
        desc: "Covers advanced medical procedures (cataract, dialysis, chemotherapy, robotic surgeries) that do not require 24-hour hospitalization due to technology.",
      },
      {
        icon: "volunteer_activism",
        title: "Annual Health Checkups & Restore Benefit",
        desc: "Automatic restoration of sum insured when exhausted, complimentary annual health checkups, and cumulative no-claim bonus multipliers.",
      },
    ],
    inclusions: [
      "Cashless hospitalization across 10,000+ empaneled hospitals across India",
      "Emergency ambulance expenses for conveyance to hospital",
      "Pre-existing disease coverage after mandatory waiting period (as per IRDAI guidelines)",
      "Modern treatment methods including robotic surgeries, balloon sinuplasty, and stem cell therapy",
      "Domiciliary hospitalization when patient cannot be moved or hospital beds are unavailable",
      "Organ donor medical expenses incurred during organ harvesting",
    ],
    exclusions: [
      "Treatment of illnesses during initial 30-day waiting period (except accidental injury)",
      "Specific illnesses (hernia, cataract, joint replacement) subject to 24-month waiting period",
      "Cosmetic, aesthetic, obesity, gender change, or unproven experimental treatments",
      "Hospitalization purely for investigation, diagnostic evaluation, or observation without active medical treatment",
      "Expenses related to alcohol abuse, self-inflicted injury, or participation in hazardous sports",
    ],
    geoScope: {
      hub: "Bhopal Central Health Advisory & Claims Helpdesk",
      corridors: "Healthcare coverage across all Indian metropolitan, Tier-2, and Tier-3 district medical centers",
      logistics: "Cashless Everywhere support enabling cashless treatment at non-network hospitals under IRDAI norms",
      surveyors: "Direct coordination with Third Party Administrators (TPAs) and hospital insurance desks nationwide",
    },
    claimsProtocol: [
      { step: "01", title: "Pre-Authorization / Intimation", desc: "For planned admission notify 48 hours prior; for emergency admission intimate TPA within 24 hours." },
      { step: "02", title: "Cashless Card Submission", desc: "Present digital health e-card, government ID, and doctor's admission note at hospital TPA desk." },
      { step: "03", title: "Initial Approval & Treatment", desc: "TPA grants initial authorization letter covering hospital stay, procedures, and medications." },
      { step: "04", title: "Discharge & Settlement", desc: "Final hospital bill submitted to insurer; cashless settlement cleared; patient only pays non-medical consumables." },
    ],
  },
  "life-insurance": {
    quickFacts: {
      regulatory: "Insurance Act 1938 & IRDAI Protection Guidelines",
      valuationBasis: "Human Life Value (HLV) Formula (15x to 25x Annual Income)",
      policyStructure: "Pure Term Life / Return of Premium (TROP) / Keyman / MWP Act",
      advisoryScope: "Bhopal IMF Central Office • Pan-India Personal Protection",
    },
    coverageDimensions: [
      {
        icon: "family_restroom",
        title: "Pure Term Life Family Income Protection",
        desc: "Provides an uncompromising financial safety net, delivering a tax-free lump sum payout to nominated dependents in the event of untimely demise.",
      },
      {
        icon: "heart_check",
        title: "Critical Illness & Terminal Illness Rider",
        desc: "Accelerated lump sum payout upon diagnosis of covered life-threatening critical illnesses (heart attack, cancer, stroke, renal failure).",
      },
      {
        icon: "accessible",
        title: "Accidental Disability & Premium Waiver",
        desc: "Waives all future premiums while keeping life cover active if the insured suffers permanent total disability due to an accident.",
      },
      {
        icon: "business_center",
        title: "Keyman Insurance & Corporate Business Continuity",
        desc: "Protects enterprise cashflow and equity valuation against the unexpected loss of key executive directors, partners, or founders.",
      },
    ],
    inclusions: [
      "Tax-free death benefit payable to nominee under Section 10(10D) of the Income Tax Act",
      "Protection covered worldwide 24 hours a day, 365 days a year",
      "Claims protection under Section 45 of the Insurance Act (incontestable after 3 years)",
      "Choice of payout options: one-time lump sum, monthly regular income, or staggered payout",
      "Married Women's Property Act (MWPA) endorsement shielding policy proceeds from creditors",
      "Income tax deductions under Section 80C on premium payments up to statutory limits",
    ],
    exclusions: [
      "Death due to suicide during the first 12 months from policy inception date",
      "Willful non-disclosure or fraudulent misstatement of critical pre-existing medical conditions",
      "Death resulting from active involvement in criminal acts or military combat operations",
      "Hazardous adventure sports or commercial aviation piloting unless specifically underwritten",
      "Lapse of policy due to non-payment of renewal premium within the statutory grace period",
    ],
    geoScope: {
      hub: "Bhopal IMF Life & Wealth Planning Desk",
      corridors: "Serving salaried professionals, business founders, and families across all 28 Indian States",
      logistics: "Digital medical underwriting and home doorstep medical health checks across 500+ Indian cities",
      surveyors: "Direct death claim facilitation desk ensuring fast-track settlement within IRDAI timelines",
    },
    claimsProtocol: [
      { step: "01", title: "Claim Intimation Notice", desc: "Nominee contacts Bima Headquarter with policy number, date, and cause of demise." },
      { step: "02", title: "Dossier Submission", desc: "Submit original policy bond, death certificate issued by municipal corporation, nominee ID, and cancelled cheque." },
      { step: "03", title: "Underwriting Verification", desc: "Insurer validates claim records under IRDAI fast-track norms (mandated settlement within 30 days of doc receipt)." },
      { step: "04", title: "Tax-Free Payout Transfer", desc: "Approved claim amount transferred directly into nominee's bank account via NEFT/RTGS." },
    ],
  },
  "risk-advisory": {
    quickFacts: {
      regulatory: "IRDAI Corporate Risk Framework & Commercial Auditing",
      valuationBasis: "Maximum Foreseeable Loss (MFL) & Probable Maximum Loss (PML)",
      policyStructure: "Risk Assessment / Clause Alignment / Portfolio Consolidation",
      advisoryScope: "Bhopal Central Operations • Pan-India Enterprise Audits",
    },
    coverageDimensions: [
      {
        icon: "rule",
        title: "Policy Wording & Clause Audits",
        desc: "Detailed forensic review of existing insurance policies to uncover hidden sub-limits, onerous warranty traps, and restrictive exclusions.",
      },
      {
        icon: "balance",
        title: "Adequacy of Sum Insured & Valuation",
        desc: "Calculates realistic Reinstatement Values (RVC) across machinery and civil infrastructure to prevent underinsurance penalties during claims.",
      },
      {
        icon: "fact_check",
        title: "Deductible & Retention Optimization",
        desc: "Balances risk retention with premium costs, designing customized deductible structures that lower premiums without compromising protection.",
      },
      {
        icon: "gavel",
        title: "Corporate Contractual Risk Structuring",
        desc: "Drafts insurance tender specifications, indemnification clauses, and vendor insurance covenants for supply chain contracts and bank loans.",
      },
    ],
    inclusions: [
      "Complete cross-insurer gap analysis across all commercial, casualty, and health lines",
      "Benchmark comparison against industry-standard wording across 25+ licensed insurers",
      "Identification of duplicate covers, missing add-ons, and unneeded premium expenditures",
      "Preparation of underwriting information dossiers for competitive market placement",
      "Structured claims advisory and technical representation during surveyor negotiations",
      "Annual enterprise risk review and renewal alignment with corporate growth",
    ],
    exclusions: [
      "Direct underwriting authority (final binding authority rests with licensed insurance companies)",
      "Unnotified operational changes or undeclared factory extensions outside audit scope",
      "Retrospective coverage for existing historical claims repudiated under previous policies",
      "Fines, regulatory penalties, or punitive damages levied by government authorities",
      "Losses arising from intentional non-compliance with statutory safety or environmental laws",
    ],
    geoScope: {
      hub: "Bhopal Risk Engineering & Corporate Advisory Headquarters",
      corridors: "Industrial manufacturing plants in Mandideep, Govindpura, Pithampur, Sanand, Chakan, and NCR",
      logistics: "Supply chain risk modeling for warehouse operators, logistics fleets, and infrastructure EPCs",
      surveyors: "Technical liaison with senior IRDAI independent loss adjusters across India",
    },
    claimsProtocol: [
      { step: "01", title: "Preliminary Exposure Mapping", desc: "Comprehensive audit of business balance sheet, fixed asset registers, and current policy binders." },
      { step: "02", title: "Gap & Clause Identification", desc: "Deliver a technical Risk Audit Matrix highlighting underinsured assets and dangerous warranty clauses." },
      { step: "03", title: "Placement Restructuring", desc: "Coordinate with insurers to replace restrictive wording with expansive endorsements and optimized deductibles." },
      { step: "04", title: "Annual Governance Review", desc: "Continuous monitoring of capital expenditures and operational shifts to maintain airtight coverage." },
    ],
  },
  "claims-assistance": {
    quickFacts: {
      regulatory: "IRDAI Protection of Policyholders' Interests Regulations, 2017",
      valuationBasis: "Policy Contract Terms, Surveyor Adjustments & Actual Loss Incurred",
      policyStructure: "Pre-Claim Strategy / Survey Coordination / Repudiation Review",
      advisoryScope: "Bhopal Central Desk • Nationwide Claim Intervention",
    },
    coverageDimensions: [
      {
        icon: "support_agent",
        title: "Immediate Claim Intimation & Guidance",
        desc: "Guiding businesses and individuals on exact timeline requirements, proper loss mitigation, and immediate surveyor appointment.",
      },
      {
        icon: "description",
        title: "Evidentiary Documentation & Vetting",
        desc: "Thorough review of claim dossiers, asset bills, repair estimates, FIRs, and forensic reports before submission to eliminate query delays.",
      },
      {
        icon: "find_in_page",
        title: "Surveyor Interaction & Clause Advocacy",
        desc: "Engaging technically with IRDAI surveyors to ensure reasonable interpretation of depreciation, salvage, and policy clauses.",
      },
      {
        icon: "gavel",
        title: "Repudiation Review & Grievance Redressal",
        desc: "Re-evaluating rejected claims, drafting formal technical rebuttals, and guiding escalation to Insurer Grievance Cells and Insurance Ombudsman.",
      },
    ],
    inclusions: [
      "Guidance across personal (motor, health, life, home) and commercial (fire, marine, liability) claims",
      "Analysis of surveyor queries, loss calculation spreadsheets, and proposed salvage deductions",
      "Intervention in delayed settlements exceeding IRDAI statutory processing timelines",
      "Identification of unfair depreciation charges and arbitrary deduction categories",
      "Drafting legal and technical rejoinders against premature claim closure notices",
      "Assistance with Insurance Ombudsman filings and consumer grievance representations",
    ],
    exclusions: [
      "Guaranteeing settlement of fraudulent, inflated, or staged accident claims",
      "Overriding fundamental policy breaches such as drunk driving or driving without license",
      "Reversing lawful repudiations caused by intentional concealment of material facts",
      "Filing claims on policies that had lapsed or were inactive at the time of loss",
      "Covering legal fees for court litigation beyond administrative grievance channels",
    ],
    geoScope: {
      hub: "Bhopal Central Claims Operations (InsureDesk IMF Pvt. Ltd.)",
      corridors: "Active claim tracking across all 28 States and 8 Union Territories in India",
      logistics: "Direct coordination with surveyor offices across major commercial and industrial centers",
      surveyors: "Licensed liaison with surveyor panels of leading public and private general insurers",
    },
    claimsProtocol: [
      { step: "01", title: "Claim Audit & Incident Analysis", desc: "Examine incident details against original policy schedule, terms, conditions, and exclusions." },
      { step: "02", title: "Documentation File Assembly", desc: "Build an airtight evidentiary dossier addressing every standard requirement of the insurer's surveyor." },
      { step: "03", title: "Surveyor Negotiation", desc: "Advocate for fair salvage rates, correct depreciation schedules, and accurate assessment of covered loss." },
      { step: "04", title: "Settlement & Discharge Voucher", desc: "Verify final claim voucher calculations before the insured executes signoff and receives bank payout." },
    ],
  },
  "policy-renewals": {
    quickFacts: {
      regulatory: "IRDAI Continuity Guidelines & Seamless Rollover Rules",
      valuationBasis: "Updated Asset Values, Current IDV & NCB Preservation",
      policyStructure: "Automated Expiry Tracking / Multi-Insurer Comparison",
      advisoryScope: "Bhopal Central Desk • Pan-India Renewals Support",
    },
    coverageDimensions: [
      {
        icon: "sync",
        title: "Seamless Policy Rollover & No Gap Cover",
        desc: "Proactive tracking ensures policies renew before midnight on expiry date, avoiding legal penalties, break-in inspections, and coverage voids.",
      },
      {
        icon: "percent",
        title: "No Claim Bonus (NCB) Preservation",
        desc: "Protects and transfers hard-earned NCB discounts (up to 50%) when switching insurers, ensuring you pay the absolute lowest fair premium.",
      },
      {
        icon: "compare_arrows",
        title: "Cross-Insurer Rate & Clause Comparison",
        desc: "Compares quotations across 25+ licensed insurers to secure enhanced terms, lower deductibles, and modern coverage endorsements.",
      },
      {
        icon: "update",
        title: "Sum Insured & Inflation Calibration",
        desc: "Reviews inflation in replacement costs of buildings, machinery, and vehicles, updating Sum Insured to eliminate underinsurance penalties.",
      },
    ],
    inclusions: [
      "Timely renewal notices 30 to 45 days ahead of policy expiration date",
      "Seamless transfer of waiting period credits in health insurance (portability under IRDAI rules)",
      "Preservation of No Claim Bonus in motor insurance across all registered insurers in India",
      "Modernization of outdated policy wordings to current Bharat Udyam / All Risks structures",
      "Multi-insurer price discovery and competitive quote comparison at zero advisory cost",
      "Single centralized renewal tracker for corporate clients with multiple vehicles or locations",
    ],
    exclusions: [
      "Coverage for accidents or damages occurring during an unrenewed policy lapse window",
      "Automatic preservation of NCB if a motor policy remains lapsed beyond 90 days from expiry",
      "Guaranteed portability if the insured has an active ongoing high-risk claim in review",
      "Backdated policy issuance (strictly prohibited under Indian insurance regulations)",
      "Unapproved policy alterations requested without formal underwriter endorsement",
    ],
    geoScope: {
      hub: "Bhopal Central Renewals Helpdesk",
      corridors: "Supporting retail vehicle owners, commercial fleets, and industrial enterprises across India",
      logistics: "Instant digital policy delivery and payment reconciliation directly with insurer portals",
      surveyors: "Instant break-in vehicle inspection coordination across all Indian cities if policy lapsed",
    },
    claimsProtocol: [
      { step: "01", title: "Expiry Audit & Portfolio Review", desc: "Audit existing coverage 30 days prior to expiry, noting claim history, asset updates, and current NCB." },
      { step: "02", title: "Market Quotation Discovery", desc: "Source competitive renewal proposals across top public and private general insurers." },
      { step: "03", title: "Comparative Recommendation", desc: "Deliver a clean comparison highlighting pricing differences, deductible variations, and add-on benefits." },
      { step: "04", title: "Direct Issuance & Archival", desc: "Facilitate direct insurer premium settlement and archive new policy schedule in client portal." },
    ],
  },
  "home-insurance": {
    quickFacts: {
      regulatory: "IRDAI Bharat Griha Raksha Framework",
      valuationBasis: "Reinstatement Cost (Structure); New Replacement Cost (Contents)",
      policyStructure: "Standard Homeowners Comprehensive Package",
      advisoryScope: "Bhopal Central Desk • Residential Coverage Across India",
    },
    coverageDimensions: [
      {
        icon: "home",
        title: "Residential Structure & Civil Construction",
        desc: "Covers foundation, walls, flooring, roof, domestic piping, and boundary walls against catastrophic fire, earthquake, and flooding.",
      },
      {
        icon: "chair",
        title: "Home Contents, Furniture & Appliances",
        desc: "Insures furniture, luxury fixtures, air conditioners, televisions, refrigerators, and modular kitchen installations against perils and damage.",
      },
      {
        icon: "lock",
        title: "Burglary, Theft & Armed Intrusion",
        desc: "Protects against theft and housebreaking, covering stolen household articles, valuable gadgets, and repair of doors damaged during break-ins.",
      },
      {
        icon: "diamond",
        title: "Jewelry, Valuables & Domestic Staff Cover",
        desc: "Specialized extensions for precious jewelry kept in bank lockers or home safes, plus accidental liability for domestic house help.",
      },
    ],
    inclusions: [
      "Physical loss or damage caused by fire, lightning, explosion, or implosion",
      "Natural disasters including earthquake, storm, cyclone, typhoon, tempest, hurricane, and flood",
      "Riot, strike, malicious damage, and impact damage by external road vehicles or animals",
      "Bursting or overflowing of domestic water tanks, apparatus, and sanitary pipes",
      "Alternative accommodation rent expenses if the home becomes uninhabitable after a loss",
      "Public liability coverage for accidental injury to visitors on residential premises",
    ],
    exclusions: [
      "Loss, damage, or theft if the home remains unoccupied for more than 30 consecutive days without notice",
      "Normal wear and tear, gradual deterioration, rust, corrosion, and dampness/termite attack",
      "Mysterious disappearance or unexplained loss of jewelry and cash",
      "Willful destruction or intentional negligence by the homeowner or family members",
      "War, foreign enemy hostility, nuclear perils, and government demolition orders",
    ],
    geoScope: {
      hub: "Bhopal IMF Retail Property Desk",
      corridors: "Residential apartments, gated communities, and independent villas across urban India",
      logistics: "Digital self-survey and instant valuation tools for homeowners across all Indian states",
      surveyors: "IRDAI certified property surveyors available in all district headquarters nationwide",
    },
    claimsProtocol: [
      { step: "01", title: "Safety & Loss Mitigation", desc: "Ensure family safety, turn off main electrical/gas lines, and alert Bima Headquarter & insurer." },
      { step: "02", title: "Police & Fire Logs", desc: "Obtain local police diary report (for burglary) or Fire Brigade report (for fire incidents)." },
      { step: "03", title: "Damage Survey Inspection", desc: "Surveyor conducts on-site assessment of damaged structural elements and itemized contents." },
      { step: "04", title: "Settlement & Reconstruction", desc: "Submit repair quotations, purchase bills, and claim form for rapid bank payout." },
    ],
  },
  "travel-insurance": {
    quickFacts: {
      regulatory: "IRDAI International & Domestic Travel Guidelines",
      valuationBasis: "USD / EUR Sum Insured for International; INR for Domestic",
      policyStructure: "Single Trip / Multi-Trip Annual / Student / Schengen Compliant",
      advisoryScope: "Bhopal Central Office • 24x7 Worldwide Assistance",
    },
    coverageDimensions: [
      {
        icon: "flight_takeoff",
        title: "Emergency Medical & Hospitalization Abroad",
        desc: "Covers emergency inpatient and outpatient medical treatment, physician fees, diagnostic tests, and ICU charges incurred overseas.",
      },
      {
        icon: "luggage",
        title: "Baggage Loss, Delay & Personal Belongings",
        desc: "Reimburses essential emergency items during checked baggage delay and compensates for total loss of baggage checked with an airline.",
      },
      {
        icon: "event_busy",
        title: "Trip Cancellation, Interruption & Delay",
        desc: "Reimburses non-refundable flight tickets, hotel reservations, and tour deposits when trips are cancelled due to unforeseen emergencies.",
      },
      {
        icon: "badge",
        title: "Passport Loss & Legal Assistance",
        desc: "Covers reasonable expenses for obtaining duplicate passports overseas, emergency cash advance, and legal liability fees abroad.",
      },
    ],
    inclusions: [
      "Cashless overseas emergency hospitalization across international healthcare providers",
      "Medical evacuation to nearest hospital and medical repatriation to India",
      "Schengen visa compliant policies with minimum €30,000 medical emergency coverage",
      "Compensation for flight delays exceeding statutory thresholds (food and stay allowance)",
      "Personal accident cover providing accidental death or permanent disablement payout abroad",
      "Repatriation of mortal remains back to home city in India in case of unfortunate demise",
    ],
    exclusions: [
      "Medical expenses for pre-existing diseases unless life-threatening emergency relief is endorsed",
      "Travelling specifically to obtain medical treatment overseas (medical tourism exclusion)",
      "Participation in hazardous winter sports or adventure activities without specialized rider",
      "Losses incurred due to intoxication, illegal drug consumption, or criminal activity abroad",
      "Travel to countries or territories under active international embargo or civil war sanction",
    ],
    geoScope: {
      hub: "Bhopal IMF Travel Desk",
      corridors: "Worldwide coverage including Schengen Area, USA, Canada, UK, Australia, UAE & Southeast Asia",
      logistics: "Instant digital policy generation with mandatory embassy-ready visa certificates",
      surveyors: "24x7 international emergency toll-free hotline with global Third-Party Administrators",
    },
    claimsProtocol: [
      { step: "01", title: "Emergency Hotline Contact", desc: "Call the 24x7 international assistance number printed on your policy card before admission." },
      { step: "02", title: "Hospital Cashless Coordination", desc: "Overseas TPA contacts international hospital directly to issue cashless payment guarantee." },
      { step: "03", title: "Airline / Police Property Report", desc: "For lost baggage, obtain Property Irregularity Report (PIR) from airline; for passport, file police report." },
      { step: "04", title: "Online Reimbursement Clearance", desc: "Upload hospital bills, discharge summary, passport stamps, and boarding passes for quick reimbursement." },
    ],
  },
  "general-insurance": {
    quickFacts: {
      regulatory: "IRDAI General Insurance Regulations & Tariff Wording",
      valuationBasis: "Asset Specific (Reinstatement / Agreed / Market / Indemnity)",
      policyStructure: "Comprehensive Commercial & Retail Portfolios",
      advisoryScope: "Bhopal IMF Headquarters • Pan-India Execution",
    },
    coverageDimensions: [
      {
        icon: "apartment",
        title: "Commercial Property & Industrial Fire",
        desc: "Structured policies covering factory buildings, office premises, warehouses, plant machinery, and finished goods against catastrophic hazards.",
      },
      {
        icon: "directions_boat",
        title: "Marine Cargo & Logistics Transit",
        desc: "Comprehensive transit risk insurance covering ocean freight, air cargo, and domestic rail/road dispatches under Institute Cargo Clauses.",
      },
      {
        icon: "directions_car",
        title: "Motor & Commercial Fleet Solutions",
        desc: "Fleet-wide protection for passenger vehicles, delivery vans, construction equipment, and logistics trucks with pan-India cashless repairs.",
      },
      {
        icon: "gavel",
        title: "Corporate Liabilities & Cyber Risk",
        desc: "Protection against public liability, product liability, Directors & Officers (D&O) exposures, Workmen's Compensation, and digital cyber breaches.",
      },
    ],
    inclusions: [
      "Multi-line insurance comparison across 25+ licensed public and private insurers",
      "Independent coverage gap analysis ensuring statutory and bank covenant compliance",
      "Standard and customized endorsements protecting against natural disasters (STFI, EQ)",
      "Business continuity, machinery breakdown, and electronic equipment protections",
      "Employer liability and employee compensation protections under Indian labor statutes",
      "Full advisory support from quotation, underwriting to claims documentation",
    ],
    exclusions: [
      "Willful, fraudulent, or illegal acts committed by the insured enterprise or individuals",
      "Normal wear and tear, gradual deterioration, rust, erosion, and unmaintained equipment",
      "War, civil commotion, foreign enemy invasion, and nuclear radiation hazards",
      "Fines, liquidated damages, or punitive penalties imposed by judicial tribunals",
      "Unreported material alterations in business activity or risk location without insurer approval",
    ],
    geoScope: {
      hub: "Bhopal IMF Corporate Headquarters (InsureDesk IMF Pvt. Ltd.)",
      corridors: "Industrial hubs across Madhya Pradesh, Maharashtra, Gujarat, Rajasthan, Tamil Nadu, and NCR",
      logistics: "Full transit and warehouse risk coverage along national freight networks and port gateways",
      surveyors: "Direct coordination with IRDAI-empanelled surveyors across all 28 Indian States & UTs",
    },
    claimsProtocol: [
      { step: "01", title: "Centralized Claim Intimation", desc: "Contact Bima Headquarter's dedicated claims desk with policy schedule and preliminary incident facts." },
      { step: "02", title: "Loss Mitigation & Preservation", desc: "Take urgent actions to prevent secondary damage; preserve affected property for surveyor inspection." },
      { step: "03", title: "Technical Surveyor Engagement", desc: "Bima Headquarter coordinates with the appointed IRDAI surveyor to ensure proper inspection scope." },
      { step: "04", title: "Documentation & Settlement", desc: "Submit complete substantiating dossier, resolve technical queries, and secure prompt claim disbursement." },
    ],
  },
};

export const SERVICE_SEO_AEO_GEO_FAQS = {
  "warehouse-insurance": [
    [
      "If my warehouse or godown is on rent, who should buy insurance — the owner or the tenant?",
      "Both the building owner and the tenant require insurance, but for completely different assets: the property owner must insure the civil building structure, while the tenant or warehouse operator must insure their own stock, machinery, and customer inventory.\n\nKey Insurable Responsibilities:\n• Building Owner / Landlord: Must purchase fire and special perils insurance (such as Bharat Sookshma or Laghu Udyam Suraksha) covering the warehouse civil structure, boundary walls, roofing, and permanent electrical fixtures on a Reinstatement Value basis.\n• Tenant / Warehouse Operator: Must insure internal storage racks, forklifts, WMS computer systems, and goods. If storing third-party client goods, the operator must obtain a Bailee's Legal Liability endorsement because standard property insurance only covers goods directly owned by the insured.\n\nBima Headquarter structures paired landlord-tenant risk programs across major warehousing and logistics corridors, including Inland Container Depots (ICD Mandideep, ICD Pithampur), Bhiwandi (Mumbai), Chakan (Pune), and the Western Dedicated Freight Corridor.",
    ],
    [
      "Does warehouse insurance cover goods owned by my clients stored in my godown?",
      "Standard warehouse fire insurance does not automatically cover client goods unless an explicit Bailee's Legal Liability or Warehouseman's Liability endorsement is attached to the policy.\n\nWhy Client Goods Need Special Endorsements:\n• Lack of Direct Ownership: Under Indian insurance law, you must have an insurable interest in the property. A standard policy only covers goods owned by you.\n• Bailee Responsibility: Under the Indian Contract Act (Bailment sections) and the Warehousing (Development and Regulation) Act, 2007, a warehouse keeper is legally liable if client goods are damaged due to failure in exercising reasonable care.\n• Bailee Endorsement Solution: Attaching Bailee's Liability ensures that if a fire, flood, or roof collapse damages client inventory, the insurer covers your legal liability and reimburses the client directly.\n\nBima Headquarter helps 3PL logistics operators and cold chain facilities across Central and Western India structure complete bailee liability programs.",
    ],
    [
      "How do I insure warehouse stock when inventory levels go up and down every month?",
      "You should take an IRDAI-regulated Declaration Policy or Floater Declaration Policy with monthly stock statements so you only pay premium on the actual average stock stored.\n\nHow a Declaration Policy Saves Money:\n• Provisional Sum Insured: You fix a provisional sum insured based on your estimated peak seasonal inventory level.\n• Monthly Reporting: By the specified cut-off date each month (usually the last day of the succeeding month), you submit your average stock value certified by a Chartered Accountant or ERP ledger.\n• Year-End Premium Refund: At policy expiry, the actual earned premium is calculated on the 12-month average stock. If your declarations were lower than the peak provisional sum, up to 50% of your provisional premium is refunded.\n\nThis format is essential for agricultural commodity warehouses across Malwa and Nimar (wheat, soybean, pulses), cold storages in Indore, and FMCG distributor hubs.",
    ],
    [
      "Will warehouse insurance pay if goods are stolen or looted from the godown?",
      "Yes, provided your policy includes Burglary and Housebreaking cover, which specifically covers theft of stock involving violent or forcible entry or exit from the premises.\n\nKey Burglary Coverage Conditions:\n• Forcible Entry Requirement: The theft must involve physical force (broken locks, damaged shutters, or breached boundary walls). Normal disappearance or inventory shrinkage discovered during routine stock-taking is excluded.\n• First Loss Option: To save premium, warehouse operators can insure inventory on a 'First Loss' basis (e.g. 25% or 50% of total stock) assuming a burglar cannot steal an entire godown in a single incident.\n• Safety Warranties: Insurers require 24/7 security guards with verified patrol logs, functional CCTV recording, and compliance with National Building Code clear stacking guidelines.\n\nBima Headquarter's risk team in Bhopal reviews warehouse security setups prior to policy binding to ensure claims admissibility.",
    ],
  ],
  "fire-insurance": [
    [
      "Can I claim fire insurance if the fire was caused by an electric short circuit?",
      "Yes; fire damage resulting from an electrical short circuit is fully covered under all standard fire insurance policies in India, provided the policyholder holds a valid Fire Safety NOC and complies with basic electrical safety codes.\n\nImportant Claims Distinction:\n• Resulting Fire Damage (Covered): All fire, heat, and smoke destruction to factory buildings, plant machinery, raw materials, and finished goods caused by the fire is 100% compensable under Bharat Sookshma Udyam Suraksha, Bharat Laghu Udyam Suraksha, and SFSP.\n• Originating Machine (Excluded unless endorsed): The specific electrical switchboard, motor, or cable where the short circuit originated may be excluded under standard fire wordings unless you have Machinery Breakdown (MBD) or Electronic Equipment Insurance (EEI) attached.\n\nImmediate intimation within 24 hours, filing a Fire Brigade report, and preserving burnt debris undisturbed for IRDAI surveyor inspection are mandatory steps managed by Bima Headquarter.",
    ],
    [
      "How much fire insurance cover do I actually need for my factory, shop, or stock?",
      "Your sum insured must equal the current cost of replacing the building and machinery with brand-new equipment of the same capacity (Reinstatement Value), plus the procurement cost of maximum inventory at risk.\n\nDanger of Underinsurance (Average Clause):\n• If your factory machinery has a replacement value of ₹10 Crores but you declare only ₹6 Crores to save premium (40% underinsured), any loss assessment will be slashed by 40%.\n• Example: On an assessed fire loss of ₹1 Crore, the insurer will pay only ₹60 Lakhs (minus deductibles).\n• Under current IRDAI Bharat Sookshma and Laghu guidelines, underinsurance up to 15% is waived, but larger shortfalls trigger severe proportional deductions.\n\nBima Headquarter helps industrial clients in Govindpura, Mandideep, and Pithampur audit Fixed Asset Registers (FAR) to avoid underinsurance penalties.",
    ],
    [
      "Why do insurance companies deduct money or reject industrial fire claims?",
      "Common reasons for fire claim deductions or rejections include underinsurance penalties, breach of safety warranties (such as missing fire hydrant NOCs or non-functional sprinklers), delayed claim intimation, and inadequate stock records.\n\nKey Areas Insurers Scrutinize:\n• Electrical Safety Compliance: Non-compliant wiring or lack of annual electrical audit certificates.\n• Unreported Alterations: Adding new machinery or storing hazardous flammable chemicals without notifying the insurer.\n• Inadequate Stock Ledgers: Inability to prove destroyed stock through GST purchase invoices, audited balance sheets, and bank stock hypothecation statements.\n• Standard Deductions: Compulsory policy deductibles, salvage recovery deductions, and depreciation if not insured on Reinstatement Value Clause (RVC).\n\nBima Headquarter's claims desk in Bhopal reviews repudiation memos, resolves surveyor queries, and files appeals before the Insurance Ombudsman.",
    ],
    [
      "Does fire insurance cover water damage from fire brigade hoses or heavy flood rains?",
      "Yes; water damage caused by fire brigade hoses while extinguishing a fire is fully covered as consequential fire loss, and natural calamities like flood, storm (STFI), and earthquake are built into standard IRDAI fire policies.\n\nCoverage Inclusions:\n• Firefighting Water Damage: Even if goods were soaked rather than burned, the damage caused by water hoses used to fight the fire is treated as an admissible fire loss.\n• STFI (Storm, Tempest, Flood, Inundation): Covers localized flooding, overflowing rivers, cyclone roof damage, and monsoon rainwater ingress.\n• Built-in Natural Perils: Under Bharat Sookshma Udyam Suraksha (up to ₹5 Cr) and Bharat Laghu Udyam Suraksha (₹5 Cr to ₹50 Cr), flood and earthquake covers are automatically included.\n\nBima Headquarter ensures policy schedules are issued with zero restrictive STFI warranties.",
    ],
  ],
  "commercial-insurance": [
    [
      "Can one commercial insurance policy cover my factory building, machinery, stock, and staff?",
      "Yes; an Industrial All Risk (IAR) or Commercial Package Policy combines property damage, machinery breakdown, business interruption, and employee liabilities under a single comprehensive contract.\n\nCore Covers Under One Commercial Package:\n• Property & Assets (SFSP / IAR): Covers factory buildings, plant machinery, furniture, raw materials, and finished goods against fire, explosion, and natural calamities.\n• Machinery Breakdown (MBD): Protects running equipment against sudden mechanical or electrical failures.\n• Business Interruption (FLOP): Reimburses lost gross profit and standing charges while production is halted.\n• Employee Liability: Fulfills statutory obligations under the Employees' Compensation Act, 1923 for workplace injuries or fatalities.\n\nBima Headquarter structures unified commercial packages for manufacturing units in Mandideep, Govindpura, Pithampur, Sanand, and Chakan-Pune.",
    ],
    [
      "Does commercial insurance pay for staff salaries and bank loan EMIs if my factory is forced to shut down after an accident?",
      "Yes; a Fire Loss of Profits (FLOP) or Business Interruption policy specifically pays for net lost profit and continuing fixed standing charges like bank loan EMIs, staff salaries, rent, and taxes during an operational shutdown.\n\nHow Business Interruption Works:\n• Standing Charges Covered: Bank interest, permanent staff salaries, building lease rent, municipal taxes, and director remuneration that continue even when manufacturing stops.\n• Increased Cost of Working (ICOW): Reimburses additional expenses incurred to resume partial production at an alternative leased facility or through third-party job work.\n• Indemnity Period: You choose a recovery window (typically 3, 6, 9, or 12 months) during which claims are payable until normal turnover is restored.\n\nBima Headquarter models realistic indemnity windows and gross profit sums insured for industrial clients across India.",
    ],
    [
      "Do I get full new replacement cost for damaged plant machinery or will depreciation be deducted?",
      "You receive full new replacement cost without depreciation if your policy includes the Reinstatement Value Clause (RVC), whereas standard market value policies deduct heavy depreciation for age, wear, and tear.\n\nReinstatement Value (RVC) Rules:\n• Brand-New Replacement: The insurer pays the cost of buying and installing brand-new machinery of equal capacity without cutting depreciation for age.\n• Rebuilding Condition: You must actually replace or repair the machinery within 12 months (or surveyor-approved extension) to claim the full new-for-old benefit. If you do not rebuild, settlement defaults to depreciated market value.\n• Stock Exclusion: Stocks and raw materials can never be insured on RVC; they are settled on landed purchase cost or market value.\n\nBima Headquarter ensures commercial policies carry explicit RVC endorsements across all capital machinery and civil assets.",
    ],
    [
      "What documents do I need to submit to get my commercial claim approved quickly?",
      "A fast commercial claim approval requires the formal claim form, Fire Brigade / Police Panchnama, repair estimates, purchase invoices, Fixed Asset Register (FAR), and audited stock statements.\n\nEssential Claim Dossier Checklist:\n• Step 1: Claim Intimation Form submitted within 24 hours to generate the official claim number.\n• Step 2: Fire incident report or police FIR/Panchnama confirming accidental cause.\n• Step 3: Equipment purchase bills, capital asset register, and manufacturer replacement quotations.\n• Step 4: For inventory losses: GST inward-outward registers, physical stock verification sheets, and bank stock hypothecation statements.\n• Step 5: For business interruption: Audited Profit & Loss accounts and monthly sales tax/GST returns.\n\nBima Headquarter coordinates on-site IRDAI surveyor inspections within 24 to 48 hours nationwide to accelerate settlement.",
    ],
  ],
  "marine-insurance": [
    [
      "Who is responsible if goods are damaged during truck transport — the transporter or insurance?",
      "Under the Carriage by Road Act, 2007, the transport carrier has statutory common carrier liability, but recovering money from transporters is difficult and slow, making transit insurance essential for immediate financial reimbursement.\n\nHow Transit Claims Work Between Transporter & Insurer:\n• Transporter Duty: The truck driver or transport agency must issue a Damage/Shortage Certificate endorsing the Lorry Receipt (LR) with exact loss details upon delivery.\n• Immediate Insurer Payout: Your marine transit insurer settles your claim directly based on an IRDAI surveyor's loss assessment.\n• Subrogation Recovery: You sign a Letter of Subrogation transferring recovery rights to the insurer, who then pursues legal recovery against the transporter.\n• Statutory Requirement: You must serve a formal Notice of Monetary Claim on the carrier within 6 months of dispatch to protect recovery rights.\n\nBima Headquarter assists manufacturers and logistics operators across India in issuing carrier notices and completing surveyor documentation.",
    ],
    [
      "Does transit insurance cover goods during loading, unloading, and highway accidents?",
      "Yes, provided your policy includes Inland Transit Clause (A) / ICC(A) along with explicit loading and unloading endorsements.\n\nTransit Coverage Tiers:\n• ITC(A) All Risks: Covers all accidental loss or damage, including drop damage while loading, crane snapping, highway overturning, collision, and rainwater damage.\n• ITC(B) Named Perils: Covers only catastrophic accidents like truck overturning, collision, fire, and bridge collapse, but excludes loading drop damage or ordinary water ingress.\n• Warehouse-to-Warehouse Transit: Attaches cover the moment goods leave the factory dispatch bay and continues until arrival at the buyer's destination godown.\n\nBima Headquarter mandates ITC(A) with loading/unloading extensions for freight moving across major national highway corridors (NH-44, NH-46, NH-48).",
    ],
    [
      "What should I do immediately if goods arrive damaged at my warehouse or shop?",
      "Endorse the damage remarks directly on the transporter's copy of the Lorry Receipt (LR) before signing delivery, take geotagged photos/videos, and intimate Bima Headquarter immediately before unloading the remaining cargo.\n\nImmediate Action Steps:\n• Do Not Sign Clean LR: Never sign a clean delivery receipt if boxes are crushed, wet, torn, or broken. Clearly write 'Received in Damaged Condition — Subject to Survey' on the driver's copy.\n• Demand Damage Certificate: Require the local transport branch manager to issue an official Damage/Shortage Certificate.\n• Preserve Packaging: Keep damaged boxes and seals intact for the appointed IRDAI surveyor's joint physical inspection.\n• Intimate Claim: Notify Bima Headquarter within 24 hours to assign an independent surveyor to inspect the cargo at your unloading bay.\n\nOur central desk in Bhopal mobilizes surveyors within 24 hours across all 28 states and union territories.",
    ],
    [
      "Is it cheaper to take an annual open transit policy instead of insuring each trip separately?",
      "Yes; an annual Marine Open Policy is 30% to 50% cheaper, eliminates per-trip paperwork, and automatically covers all inward and outward shipments up to your declared annual turnover limit.\n\nAdvantages of an Annual Open Policy:\n• Automatic Cover: Every consignment dispatched by truck, rail, or air is automatically insured the moment a consignment note / LR is generated.\n• Discounted Premium: Premium rates are negotiated on aggregate annual turnover rather than high per-trip retail rates.\n• Monthly Declaration: You simply submit a monthly statement of total dispatches, and premiums are debited against your advance deposit account.\n\nWidely utilized by automotive suppliers in Pithampur, transformer fabricators in Mandideep, and exporters shipping via Mundra and JNPT ports.",
    ],
  ],
  "motor-insurance": [
    [
      "Is Zero Depreciation (Bumper-to-Bumper) really worth the extra premium?",
      "Yes, absolutely; without Zero Depreciation, you must pay 50% of the cost of all replaced plastic, rubber, and nylon parts, plus 30% on fiberglass out of your own pocket during accident repairs.\n\nDepreciation Deductions Without Zero Dep:\n• Rubber, Nylon, Plastic Parts: 50% deduction (bumpers, headlights, dashboard, air intake pipes).\n• Fiberglass Components: 30% deduction.\n• Glass Parts: 0% deduction.\n• Metal Parts: 0% to 50% deduction depending on vehicle age.\n\nWith a Zero Depreciation add-on, the insurer pays 100% of part replacement costs minus only the compulsory excess (₹1,000–₹2,000). Highly recommended for all private cars and commercial vehicles up to 5 to 7 years old across Bhopal, Indore, and nationwide.",
    ],
    [
      "What happens to my 50% No Claim Bonus (NCB) if I sell my car or change insurance companies?",
      "Your No Claim Bonus belongs to you as a vehicle owner, not to the car, and can be transferred to a newly purchased vehicle or a new insurance company by obtaining an NCB Reserving Letter (valid for 3 years).\n\nHow to Retain Your NCB:\n• NCB Scale: Starts at 20% after 1 claim-free year and increases up to 50% after 5 consecutive claim-free years on your Own Damage (OD) premium.\n• Sale of Old Vehicle: When selling your car, provide the sale deed / Form 29 & 30 to your insurer to obtain an official NCB Reserving Certificate.\n• Applying to New Car: Present this certificate when insuring your replacement vehicle to instantly slash your new policy's Own Damage premium by up to 50%.\n\nBima Headquarter facilitates seamless NCB retention, transfer, and NCB protection riders for vehicle owners across India.",
    ],
    [
      "Why did the insurance company payout less than my car repair bill at the garage?",
      "Deductions happen due to compulsory deductibles, part depreciation (if you don't have Zero Dep), salvage deduction, and consumable items used during repair.\n\nCommon Garage Bill Deductions:\n• Compulsory Deductible: Statutory fee of ₹1,000 for cars up to 1500cc and ₹2,000 for larger cars.\n• Consumables: Engine oil, coolant, AC gas, nuts, bolts, and brake fluid are excluded unless you have a Consumables Cover add-on.\n• Depreciation: Applied on older parts if Zero Dep cover has expired or was not chosen.\n• Salvage Deduction: Scrap value estimated for replaced metal or plastic components.\n\nBima Headquarter reviews repair estimates before work begins to ensure maximum cashless reimbursement at authorized dealer workshops.",
    ],
    [
      "Can I claim insurance if my vehicle engine seizes due to waterlogging in monsoon rains?",
      "Standard comprehensive motor insurance excludes hydrostatic lock caused by cranking an engine in water, but adding an Engine and Gearbox Protection cover pays for full engine repair or replacement.\n\nMonsoon Engine Protection Rules:\n• What is Hydrostatic Lock? When a vehicle is driven through waterlogged roads, water can be sucked into the engine combustion chamber, bending connecting rods and seizing the engine.\n• Why Base Policies Reject: Insurers treat cranking an engine in standing water as 'consequential damage' and gross negligence.\n• The Solution: The Engine Protect add-on specifically covers water ingress and lubricating oil leakage repairs, which can cost ₹1 Lakh to ₹4 Lakhs for modern cars.\n\nAn indispensable add-on for vehicles operating during heavy monsoons across Central and Western India.",
    ],
  ],
  "health-insurance": [
    [
      "Will health insurance pay 100% of my hospital bill or are there hidden deductions?",
      "Health insurance pays eligible medical expenses, but standard policies deduct non-medical consumables (gloves, syringes, PPE kits) and enforce major cuts if your policy has Room Rent Capping or Co-payment clauses.\n\nMajor Deductions to Avoid:\n• Room Rent Proportionate Deduction: If your policy caps room rent at 1% of Sum Insured (e.g. ₹5,000/day on a ₹5 Lakh policy) and you choose an ₹8,000/day room, the insurer cuts doctor consultation fees, OT charges, and surgery costs proportionately by 37.5%.\n• Co-payment Clause: A mandatory 10% to 20% cut that you must pay out of pocket on every bill.\n• Non-Medical Items: Consumables like admission fees, sanitizers, and gloves (usually 5%–10% of the bill) unless you have a Consumables Rider.\n\nBima Headquarter recommends policies with zero room rent capping, zero co-payments, and consumable protection across top hospital networks (Apollo, Fortis, Bansal Hospital Bhopal, Medanta Indore).",
    ],
    [
      "Can I get cashless treatment immediately for pre-existing diseases like diabetes or blood pressure?",
      "Pre-existing diseases (PED) carry a mandatory waiting period of 12 to 36 months under IRDAI guidelines, during which hospitalizations related to those conditions are not covered unless you have corporate Group Mediclaim (GMC) with day-1 cover.\n\nIRDAI Pre-Existing Disease Rules:\n• Waiting Period: 1 to 3 years depending on the policy. Once this period passes, all hospitalization expenses for diabetes, hypertension, or heart conditions are covered 100%.\n• Importance of Honest Disclosure: You must declare all pre-existing medications and conditions on the proposal form. Hiding a condition leads to permanent claim rejection under non-disclosure clauses.\n• Moratorium Period: After 60 continuous months of policy renewals, IRDAI regulations prevent insurers from questioning or rejecting claims on grounds of non-disclosure.\n\nBima Headquarter assists clients with transparent medical underwriting to ensure guaranteed claim settlements.",
    ],
    [
      "What is the difference between a Family Floater and separate health policies for parents?",
      "A Family Floater shares a single sum insured pool among young spouses and children at economical rates, while elderly parents should always have separate individual policies so their age-based premiums and claims do not exhaust the family pool.\n\nWhy Separate Policies for Parents Are Better:\n• Premium Calculation: A family floater's premium is based on the oldest member's age. Adding 60+ parents to your floater drastically inflates your premium.\n• Pool Exhaustion: A single hospitalization for an elderly parent could consume the entire ₹5 Lakh or ₹10 Lakh sum insured, leaving spouse and children uncovered for the rest of the year.\n• No Claim Bonus Protection: Having separate policies ensures that a parent's claim does not reset the cumulative bonus on your family plan.\n\nBima Headquarter designs balanced family portfolios with corporate GMC top-ups and standalone parent health plans.",
    ],
    [
      "Can I transfer my existing health insurance policy to a new company without losing waiting period credits?",
      "Yes; under IRDAI Health Insurance Portability rules, you can port to any insurer while preserving all accrued waiting period credits for pre-existing diseases, provided you apply at least 45 days before renewal.\n\nHealth Insurance Portability Benefits:\n• Retain Waiting Credits: If you have completed 2 years in your current policy, those 2 years are credited towards the new insurer's waiting period.\n• Transfer Cumulative Bonus: You can port your accrued bonus or convert it into an enhanced base sum insured.\n• Application Timeline: You must submit the portability application to the new insurer at least 45 days prior to your policy renewal date.\n\nBima Headquarter guides individuals and families across Madhya Pradesh and nationwide through smooth, zero-break health portability.",
    ],
  ],
  "life-insurance": [
    [
      "Why is a pure Term Life Plan better than traditional LIC money-back or endowment policies?",
      "Pure term insurance gives 10 to 20 times higher life cover for the same premium, allowing an earning breadwinner to secure ₹1 Crore to ₹2 Crore cover for just ₹800 to ₹1,200 per month, while traditional plans yield low returns (4%–6%) and inadequate life cover.\n\nComparison:\n• Pure Term Insurance: Pure risk protection. If the insured passes away during the term, the entire ₹1 Crore–₹2 Crore death benefit is paid tax-free to the nominee under Section 10(10D). If you survive, no money is returned, but your family was fully protected at minimal cost.\n• Traditional Endowment / Money-Back: Combines low insurance with poor investments. For the same ₹1,000/month premium, you might get only ₹2 Lakh to ₹3 Lakh life cover, which is completely insufficient to support a family in today's economy.\n\nBima Headquarter advises salaried professionals and business founders on sizing adequate pure term protection.",
    ],
    [
      "How much term insurance cover is actually enough for my family if something happens to me?",
      "You should maintain life cover equal to at least 15 to 20 times your annual take-home income, plus the full value of outstanding home loans and expected future costs for children's college education.\n\nSimple Need Analysis Formula:\n`Target Life Cover = (Annual Income × 15) + Outstanding Mortgages/Loans + Children's Higher Education/Marriage Goals - Existing Liquid Savings`\n\nExample: An individual earning ₹10 Lakhs/year with an outstanding home loan of ₹35 Lakhs and two school-going children should maintain a term life policy of at least ₹2 Crores to ₹2.5 Crores.\n\nBima Headquarter provides objective need analysis calculations calibrated against Indian urban inflation rates and long-term family living expenses.",
    ],
    [
      "Can business creditors or banks attach my life insurance claim money if I have unpaid debts?",
      "Not if your policy is taken under Section 6 of the Married Women's Property (MWP) Act, 1874, which creates an irrevocable trust for your wife and children that no court, bank, or business creditor can ever attach.\n\nMWP Act Legal Protection:\n• Irrevocable Trust: Once registered at proposal inception, the policy operates outside the policyholder's general estate. The policyholder cannot surrender the policy, take a loan, or alter beneficiaries without the trustee's explicit consent.\n• Complete Creditor Shield: In the event of business bankruptcy, corporate debt default, or court attachment proceedings, lenders and creditors cannot claim or attach the policy proceeds.\n\nBima Headquarter structures MWP Act-endorsed policies for industrialists, business owners, and real estate developers across India to guarantee irrevocable family financial protection.",
    ],
    [
      "Will my family get the term insurance claim payout if death occurs outside India?",
      "Yes; standard Indian term life policies provide worldwide 24/7 coverage. Death occurring in any foreign country is fully payable to the nominee upon submitting the death certificate, embassy verification, and hospital records.\n\nKey International Death Claim Requirements:\n• Global Cover: Whether death happens while traveling on vacation, on an international business trip, or living as an NRI, claim proceeds are paid in Indian Rupees.\n• Documents Required: Local death certificate authenticated by the Indian Embassy/Consulate, post-mortem report (if accidental), and certified medical records.\n• Tax-Free Benefit: The entire claim payout is disbursed 100% tax-free to the nominee under Section 10(10D) of the Income Tax Act, 1961.\n\nBima Headquarter assists families with complete claim documentation across all life insurance companies in India.",
    ],
  ],
  "risk-advisory": [
    [
      "How can my factory or commercial facility reduce insurance premiums without cutting coverage?",
      "By implementing institutional risk mitigation—such as certified fire hydrant systems, automated sprinklers, electrical thermography audits, and formal business continuity plans—which qualify your plant for up to 30% to 60% insurer tariff discounts.\n\nCost-Saving Risk Improvements:\n• Fire Protection Discounts: Installing dedicated water storage tanks, diesel fire pumps, and certified hydrant rings lowers fire tariff rates.\n• Electrical Thermography Audits: Annual infrared scanning of electrical switchboards detects loose connections and hot spots before they cause short circuits.\n• Voluntary Deductibles: Opting for a slightly higher deductible on non-critical assets reduces your annual baseline premium outlay.\n\nBima Headquarter helps manufacturing plants in Mandideep, Pithampur, Dewas, Sanand, and Chakan complete insurer-approved risk improvement audits.",
    ],
    [
      "What hidden gaps exist in standard business policies that lead to unexpected claim rejections?",
      "The most common hidden traps are underinsurance penalties (Average Clause), unendorsed client-owned inventory in warehouses, missing business interruption (FLOP) coverage, and restrictive electrical maintenance warranties.\n\nCritical Policy Gaps We Regularly Uncover:\n• Outdated Asset Values: Machinery and civil structures insured on historical purchase cost rather than current replacement values, triggering 30%–50% average clause penalties.\n• Missing Business Interruption: Having fire insurance for building damage but zero cover for continuing staff salaries and bank loan EMIs while the plant is closed.\n• Sub-Limits: Unannounced caps on flood (STFI) or machinery breakdown claims buried in policy endorsements.\n\nBima Headquarter provides comprehensive portfolio audits to eliminate these gaps before disaster strikes.",
    ],
    [
      "What is the difference between an insurance agent and an independent risk consultant like Bima Headquarter?",
      "An agent represents a single insurance company, whereas Bima Headquarter (operated by InsureDesk IMF Pvt. Ltd.) is an IRDAI-licensed consulting firm comparing policies across 25+ insurers, auditing risks pre-underwriting, and advocating for you during claims.\n\nConsultancy vs Agent Comparison:\n• Objective Market Comparison: We solicit competitive quotes across leading public and private insurers to secure the best rates and terms.\n• Pre-Underwriting Risk Engineering: We inspect your facility, evaluate fire loads, and draft custom policy wordings rather than selling off-the-shelf policies.\n• Claims Advocacy: If an insurer repudiates or deducts your claim unfairly, our legal and claims desk represents your case before surveyor panels, Grievance Cells, and the Insurance Ombudsman.\n\nHeadquartered in Bhopal, serving corporate enterprises and MSMEs nationwide.",
    ],
    [
      "Can Bima Headquarter audit our company's existing insurance policies for free?",
      "Yes; our corporate risk advisory desk in Bhopal provides a comprehensive 360-degree portfolio gap analysis for MSMEs, factories, and commercial enterprises across India at zero cost.\n\nWhat the Free Policy Audit Delivers:\n• Asset Valuation Review: Comparing Fixed Asset Registers (FAR) against declared building and machinery values to identify underinsurance.\n• Warranty Analysis: Identifying restrictive conditions (such as unfulfilled sprinkler warranties) that could void a claim.\n• Premium Benchmarking: Comparing your current premium rates against prevailing industry market discounts across 25+ insurers.\n\nRequest your free portfolio audit via phone, email, or by scheduling an in-person consultation at our Bhopal office.",
    ],
  ],
  "home-insurance": [
    [
      "Does home insurance cover damage from water leakage, seepage, or heavy rainfall?",
      "Home insurance covers sudden water damage from heavy monsoon flooding, inundation (STFI), and overflowing water tanks or burst pipes, but excludes gradual seepage or dampness caused by unmaintained building walls.\n\nWater Damage Coverage Scope:\n• Covered Perils: Flash floods, overflowing drains, cyclone damage, and accidental bursting or overflowing of overhead water apparatus.\n• Excluded Conditions: Gradual dampness, paint peeling, or wall seepage resulting from lack of waterproofing or normal wear and tear.\n• Bharat Griha Raksha Guidelines: The standard IRDAI home policy automatically includes STFI and earthquake covers with zero deductible for individual homeowners.\n\nBima Headquarter assists homeowners across Bhopal (Arera Colony, Kolar, Hoshangabad Road), Indore, and urban residential communities nationwide with tailored property protection.",
    ],
    [
      "Can I insure my flat or household belongings if I live as a tenant on rent?",
      "Yes; tenants can buy a Home Contents Insurance policy covering furniture, electronics, home appliances, and personal valuables against fire, burglary, and accidental damage, while the landlord insures the civil building structure.\n\nTenant Policy Highlights:\n• Contents Covered: TV, refrigerator, laptops, washing machine, modular furniture, clothing, and kitchen appliances.\n• Burglary & Theft: Covers stolen electronics and belongings if theft involves violent or forced entry.\n• Tenant's Liability: Covers accidental damage you may unintentionally cause to the landlord's property (such as an accidental fire or water tap overflow).\n\nBima Headquarter structures customized contents packages for residential tenants across Central India and metro rental markets.",
    ],
    [
      "How is the value of a house calculated for insurance — does it include land cost?",
      "Home insurance is calculated solely on civil construction cost (Reinstatement Value, typically ₹1,800 to ₹3,500 per sq. ft. depending on quality) and excludes land value because land cannot be destroyed by fire or natural disasters.\n\nValuation Formula:\n`Building Sum Insured = Built-Up Carpet Area (sq. ft.) × Current Local Construction Rate (per sq. ft.)`\n\nExample: A 2,000 sq. ft. home in Bhopal with a construction cost of ₹2,200 per sq. ft. should be insured for ₹44 Lakhs. Adding market land value is an error that needlessly inflates your premium without providing any additional claim payout.\n\nBima Headquarter advises homeowners on proper square footage valuation benchmarks.",
    ],
    [
      "What proof do I need to submit if electronics or jewelry are stolen during a home burglary?",
      "You need to file an immediate police FIR, provide purchase invoices or warranty cards for electronics, and submit valuation certificates or photographs for jewelry, along with evidence of forcible entry (broken locks or forced doors).\n\nBurglary Claim Checklist:\n• Police FIR: Lodged immediately upon discovering the break-in; a final police investigation report is mandatory for claim disbursement.\n• Proof of Forcible Entry: Photographs of broken locks, jimmied window grills, or damaged doors.\n• Proof of Ownership: Original purchase bills, warranty cards, credit card statements, or jeweler appraisal certificates.\n• Immediate Notification: Intimate Bima Headquarter and the insurer within 24 hours so an IRDAI surveyor can inspect the crime scene.\n\nWe coordinate prompt surveyor inspections across all major cities and districts in India.",
    ],
  ],
  "travel-insurance": [
    [
      "Is travel insurance mandatory for Schengen visa, USA, or UK travel?",
      "Yes, travel insurance is legally compulsory for Schengen visas (minimum €30,000 medical cover including repatriation), and highly essential for the USA and UK where a single emergency hospital stay can easily exceed $30,000 to $50,000.\n\nVisa & Travel Requirements:\n• Schengen Countries (Europe): Consulates mandate proof of travel health insurance with zero deductible and minimum €30,000 medical coverage before issuing visas.\n• USA & Canada: Highly recommended due to astronomical private healthcare costs (an emergency appendix surgery or broken bone treatment can cost $40,000 to $80,000).\n• Instant Digital Certificates: Bima Headquarter issues instant embassy-approved travel insurance certificates accepted by VFS Global and foreign embassies.\n\nAvailable for departures from Bhopal, Indore, Delhi, Mumbai, and all Indian international airports.",
    ],
    [
      "Does international travel insurance cover doctor visits and hospital bills if I fall sick abroad?",
      "Yes; it covers emergency outpatient doctor consultations, diagnostic tests, prescription medications, emergency surgeries, and hospital stays up to your policy limit ($50,000 to $500,000).\n\nMedical Benefits Abroad:\n• Emergency Inpatient & Outpatient: Cashless hospitalization at network hospitals or fast reimbursement for approved medical treatments.\n• Emergency Medical Evacuation: Coordinates air ambulance or medical escort back to India if specialized treatment is required.\n• Dental Emergency: Covers acute relief of sudden dental pain or dental injury resulting from an accident.\n\nSupported by 24/7 global emergency assistance desks operating worldwide.",
    ],
    [
      "Will travel insurance refund my money if my flight is cancelled or luggage is lost?",
      "Yes; policies compensate for non-refundable hotel and flight bookings if trips are cancelled due to medical emergencies or severe weather, and pay per-bag compensation if luggage is lost by the airline.\n\nTrip Disruption Benefits:\n• Trip Cancellation / Interruption: Reimburses non-refundable air tickets, visa fees, and hotel bookings if severe illness or death in the immediate family forces you to cancel your trip.\n• Flight Delay: Reimburses meals and hotel stays if flights are delayed beyond 6 to 12 hours.\n• Baggage Delay & Loss: Pays compensation for emergency clothes and toiletries if checked baggage is delayed beyond 12 hours, and full compensation up to policy limits for total baggage loss.\n\nEssential protection for long-haul connecting flights via transit hubs like Dubai, Doha, Singapore, and European gateways.",
    ],
    [
      "Can Indian students buy student travel insurance to waive expensive US university health insurance?",
      "Yes; specialized Indian student travel insurance policies meet US/European university waiver requirements at 60% to 75% lower cost than campus health plans, with university-compliant waiver certificates issued directly.\n\nSpecialized Student Benefits:\n• University Waiver Compliance: Meets all university health criteria (inpatient/outpatient expenses, mental health, pre-existing conditions, intercollegiate sports).\n• Compassionate Visit: Covers round-trip airfare for a parent if the student is hospitalized for more than 7 days abroad.\n• Sponsor Protection: Pays remaining tuition fees if the student's fee-paying parent or sponsor suffers accidental death or permanent disability.\n\nBima Headquarter facilitates university health waiver reviews for Indian students heading to the US, UK, Germany, Canada, and Australia.",
    ],
  ],
  "claims-assistance": [
    [
      "Why did the insurance company reject or deduct my claim, and can I challenge their decision?",
      "Claims are frequently rejected or slashed due to alleged delayed intimation, pre-existing condition exclusions, lack of surveyor documentation, or aggressive depreciation; yes, every rejection can be formally appealed before the Insurer Grievance Cell and the Insurance Ombudsman.\n\nHow Bima Headquarter Reverses Unfair Decisions:\n• Technical Policy Review: We audit the rejection memo against original proposal forms, policy schedules, and surveyor reports to find legal and procedural flaws.\n• Enforcing IRDAI Circulars: We invoke established IRDAI regulations preventing insurers from rejecting genuine claims solely on technical notification delays.\n• Formal Legal Representation: We draft structured appeals to the Insurer's Grievance Redressal Officer (GRO).\n• Ombudsman Escalation: If unresolved, we file representations before the Insurance Ombudsman for binding settlements up to ₹50 Lakhs without expensive lawyer fees.\n\nDirect experience with regional Ombudsman benches in Bhopal (covering MP & Chhattisgarh), Mumbai, Ahmedabad, Delhi, and Lucknow.",
    ],
    [
      "How long can an insurance company legally take to settle my claim in India?",
      "Under IRDAI regulations, an insurer must appoint a surveyor within 48 hours, the surveyor must submit their report within 30 days, and the insurer must disburse payment within 30 days of receiving the report; delays attract penal interest at bank rate plus 2%.\n\nMandatory IRDAI Timelines:\n• Surveyor Appointment: Within 48 hours of claim notification.\n• Surveyor Loss Report: Maximum 30 days from appointment (extendable only for complex industrial cases with special approval).\n• Settlement Offer / Rejection: Within 30 days of receiving the final survey report.\n• Payment Transfer: Within 7 days of policyholder acceptance. Any delay beyond 30 days statutorily obligates the insurer to pay bank rate plus 2% penal interest.\n\nBima Headquarter actively monitors and enforces these statutory timelines on behalf of claimants nationwide.",
    ],
    [
      "Can Bima Headquarter help me if my claim is stuck for a policy bought through another agent or website?",
      "Yes; our Claims Assistance Desk in Bhopal helps individuals and corporate enterprises across India resolve stuck, delayed, or rejected claims regardless of where the policy was originally purchased.\n\nHow We Handle External Stuck Claims:\n• File Audit: We inspect the policy schedule, endorsement clauses, rejection letter, and surveyor notes to determine legal dispute viability.\n• Missing Document Remediation: We help you compile missing technical records, CA certificates, and surveyor query responses.\n• Executive Escalation: We escalate the dispute to the insurer's corporate claims management team and regulatory grievance portals (IRDAI Bima Bharosa).\n\nAvailable to businesses, industrial manufacturers, fleet owners, and individual policyholders across India through our digital desk and in-person Bhopal consultations.",
    ],
    [
      "How do I file a complaint with the Insurance Ombudsman if the insurer refuses to pay?",
      "If the insurer rejects your grievance or fails to reply within 30 days, you can file a complaint with the Insurance Ombudsman having jurisdiction over your region (e.g. Bhopal Ombudsman for MP & Chhattisgarh) for fast, legally binding resolution up to ₹50 Lakhs without lawyer fees.\n\nOmbudsman Filing Protocol:\n• Prerequisites: You must have first lodged a written complaint with the insurer's Grievance Redressal Officer (GRO) and received a rejection or no reply within 30 days.\n• No Legal Fees: The Ombudsman process is completely free of charge for consumers; no advocate or lawyer is permitted.\n• Binding Award: The Ombudsman's ruling is legally binding on the insurance company, but non-binding on you (you retain the right to approach Consumer Courts if unsatisfied).\n\nBima Headquarter prepares complete claim dossiers and representation briefs for hearings before the Insurance Ombudsman.",
    ],
  ],
  "policy-renewals": [
    [
      "What happens if my insurance expires — can I renew without vehicle inspection or penalty?",
      "If renewed within 90 days of expiry, you can still save your accumulated No Claim Bonus (NCB), but comprehensive motor insurance requires a fast self-inspection video/photo check, while commercial fire policies should be renewed immediately to prevent total uninsured exposure.\n\nConsequences of a Lapsed Policy:\n• Motor Policy: After 90 days of expiry, your entire accumulated NCB (up to 50%) is permanently forfeited. Driving with lapsed third-party insurance attracts heavy traffic police fines and vehicle impoundment.\n• Break-in Inspection: Vehicles with lapsed comprehensive cover require a fast digital break-in inspection (via mobile video or photos) approved within 1 to 2 hours.\n• Commercial & Fire: Lapsed factory or warehouse policies leave multi-crore assets completely unprotected against fire or flood with zero retroactive indemnification.\n\nBima Headquarter provides same-day renewal issuance and instant break-in inspection clearance nationwide.",
    ],
    [
      "Should I simply auto-renew with my existing insurance company or compare other insurers first?",
      "You should always compare quotes before renewing because insurers regularly update risk tariffs, and benchmarking across 25+ insurers through Bima Headquarter can lower premiums by 15% to 40% while securing better add-on covers.\n\nWhy Auto-Renewing Wastes Money:\n• Outdated Tariffs: Existing insurers often apply default renewal rates without passing on new market discounts.\n• Missing Add-ons: Auto-renewal notices often drop valuable covers like Zero Depreciation or Consumables without your knowledge.\n• Fleet Loss Ratio Negotiations: For commercial fleets and factories, presenting clean loss histories across multiple insurers creates competitive bidding that slashes premium outlays.\n\nBima Headquarter's renewal desk in Bhopal performs comparative pre-renewal audits across 25+ insurers for clients nationwide.",
    ],
    [
      "Can I increase my sum insured or add new machinery during policy renewal?",
      "Yes; renewal is the best time to adjust building and machinery values for inflation, declare newly acquired plant equipment, and update inventory thresholds without paying mid-term endorsement charges.\n\nRenewal Adjustments to Make:\n• Inflation Adjustment: Increase building construction and machinery replacement sums insured by 5%–10% to prevent underinsurance penalties during future claims.\n• Add New Equipment: Include newly purchased factory machinery, IT servers, or warehouse racking systems.\n• Restructure Deductibles: Opt for higher voluntary deductibles on non-critical machinery to lower your overall renewal premium.\n\nOur advisory team reviews your Fixed Asset Register prior to renewal to ensure all additions are seamlessly incorporated.",
    ],
    [
      "How much discount can a commercial fleet or factory get on renewal premiums?",
      "Industrial facilities and commercial fleets with good claim loss ratios (low ICR) and certified safety systems can negotiate 20% to 50% underwriting discounts on Own Damage and property fire tariffs.\n\nNegotiating Factors We Leverage:\n• Incurred Claims Ratio (ICR): Fleets with claim ratios below 60% qualify for institutional preferred-risk discounts.\n• Safety Certifications: Plants with fire NOCs, automatic sprinkler systems, and ISO safety certifications command substantial tariff reductions.\n• Multi-Line Volume Bundling: Bundling commercial property, marine cargo, and group health policies unlocks enterprise discount rates.\n\nDedicated corporate renewal advisory for industrial units across Mandideep, Govindpura, Pithampur, Sanand, Chakan, and metro commercial hubs.",
    ],
  ],
  "general-insurance": [
    [
      "What is the difference between General Insurance and Life Insurance?",
      "General Insurance protects non-life assets (factories, warehouses, vehicles, goods in transit, personal health, and legal liabilities) on an indemnity basis, whereas Life Insurance provides financial compensation to nominees upon the death of an individual.\n\nKey Differences:\n• General Insurance: Non-life contracts operating on the principle of indemnity—restoring you to the exact financial position enjoyed immediately before the loss. Policies are typically annual (1-year contracts) covering property, transit, motor, health, and liability risks.\n• Life Insurance: Long-term financial security (10 to 40 years) designed to replace the earning capacity of a breadwinner or provide retirement savings.\n\nBima Headquarter provides integrated general insurance advisory, underwriting placement, and claims advocacy for commercial enterprises and personal clients across India.",
    ],
    [
      "Which general insurance policies are legally compulsory for businesses in India?",
      "Statutory compulsory policies include Third-Party Motor Insurance for all commercial vehicles (Motor Vehicles Act), Workmen's Compensation / Employees' Compensation Insurance (Employees' Compensation Act, 1923), and Public Liability Insurance for units handling hazardous chemicals (Public Liability Insurance Act, 1991).\n\nMandatory Business Covers:\n• Third-Party Motor: Compulsory for all trucks, trailers, and company vehicles.\n• Employees' Compensation (WC): Mandatory for manufacturing plants and construction sites to pay statutory compensation for workplace injuries or fatalities.\n• Public Liability Act, 1991: Mandatory for chemical, pharmaceutical, and hazardous manufacturing facilities handling scheduled toxic substances.\n\nBima Headquarter ensures 100% statutory compliance for industrial units across Central India and national manufacturing belts.",
    ],
    [
      "Does general insurance cover money stolen or embezzled by an employee?",
      "Standard fire and burglary policies exclude employee theft, but a Fidelity Guarantee Insurance policy specifically covers direct financial losses caused by employee fraud, dishonesty, embezzlement, or forgery.\n\nFidelity Guarantee Coverage Scope:\n• Embezzlement of Funds: Covers cash, bank transfers, or accounting fraud committed by cashiers, accountants, or sales staff.\n• Stock Theft by Staff: Covers theft or misappropriation of raw materials or warehouse stock by warehouse personnel.\n• Forgery & Fraud: Protects against forged signatures on company cheques or unauthorized procurement orders.\n\nEssential protection for wholesale distributors, jewelry retailers, logistics godowns, and corporate offices across urban commercial hubs in India.",
    ],
    [
      "How does a business protect itself against customer lawsuits or third-party injury claims?",
      "Through a Commercial Public Liability or Commercial General Liability (CGL) policy, which covers legal defense fees, advocate costs, and court-awarded damages if a visitor, customer, or neighbor suffers injury or property damage on your business premises.\n\nLiability Protections:\n• Premises Liability: Protects retail stores, hospitals, hotels, and offices if a customer slips, falls, or is injured on your property.\n• Industrial Public Liability: Protects factories against accidental toxic emissions, structural collapse, or boundary wall damage affecting neighboring plots.\n• Legal Defense Costs: Pays for high court/district court lawyers, forensic investigators, and court-awarded settlements.\n\nBima Headquarter structures tailored liability coverage towers for IT firms, hospitals, manufacturing plants, and educational institutions across Central India and metro corporate hubs.",
    ],
  ],
};

export const servicesBySlug = {};
SERVICES.forEach((service) => {
  servicesBySlug[service.slug] = {
    slug: service.slug,
    icon: service.icon,
    eyebrow: service.eyebrow,
    title: service.title,
    seoTitle: service.seoTitle,
    description: service.description,
    heroImage: SERVICE_HERO_IMAGES[service.slug] || service.heroImage,
    overview: service.overview,
    audiences: service.audiences,
    benefits: service.benefits,
    architecture: SERVICE_POLICY_ARCHITECTURE[service.slug] || SERVICE_POLICY_ARCHITECTURE["general-insurance"],
    faqs: SERVICE_SEO_AEO_GEO_FAQS[service.slug] || service.faqs,
    related: service.related,
    ctaTitle: service.ctaTitle,
    ctaText: service.ctaText,
  };
});

export const serviceSlugs = Object.keys(servicesBySlug);

export const entityFaqs = [
  [
    "Who is Bima Headquarter and how are you different from an insurance agent or web portal?",
    "Bima Headquarter is a specialized corporate risk consultancy and claims advisory brand operated by InsureDesk IMF Pvt. Ltd., an Insurance Marketing Firm regulated by the Insurance Regulatory and Development Authority of India (IRDAI).\n\nHow We Are Different:\n• Independent Market Comparison: Unlike tied agents who only sell one insurer's product, we analyze and place coverage across 25+ leading public and private general, health, and life insurance companies in India.\n• Pre-Underwriting Risk Audits: We inspect facilities, calculate proper asset valuations, and draft customized policy endorsements to prevent underinsurance traps before policy issuance.\n• Dedicated Claims Advocacy: Unlike automated online aggregators that abandon you after sale, our dedicated claims desk manages on-site surveyor mobilization, paperwork audits, and Ombudsman appeals.\n\nHeadquartered in Bhopal, Madhya Pradesh, serving businesses and families across all 28 Indian states.",
  ],
  [
    "Where is your office located, and can your team help clients outside Bhopal across India?",
    "Our corporate headquarters is located in Bhopal, Madhya Pradesh (Narmadapuram Road / Danish Nagar), and we actively serve clients nationwide across all 28 states and union territories.\n\nHow We Support Clients Nationwide:\n• Pan-India Digital Desks: Instant policy reviews, quotation comparisons, and endorsement servicing via phone, email, and secure digital portals.\n• Nationwide Surveyor Mobilization: Through our pan-India network of independent IRDAI-licensed surveyors, we coordinate physical loss inspections within 24 to 48 hours in any district or industrial corridor.\n• Active MSME Corridors: Serving key manufacturing and commercial hubs including Indore, Mandideep, Govindpura, Pithampur, Jabalpur, Mumbai, Pune, Ahmedabad, Surat, Delhi-NCR, Bengaluru, Hyderabad, and Chennai.",
  ],
  [
    "Do you charge fees for claim assistance, and how do you help during surveyor inspections?",
    "Initial claim consultations and guidance are 100% free; our dedicated claims desk acts as your technical advocate throughout the entire claims lifecycle.\n\nOur Claim Support Protocol:\n• 24-Hour Surveyor Coordination: Direct coordination with the appointed IRDAI surveyor to ensure proper on-site inspection scope.\n• Dossier Verification: Structuring purchase bills, asset registers, repair quotes, and police/fire reports to satisfy surveyor requisitions without delay.\n• Challenging Unfair Deductions: Reviewing draft survey reports to dispute unjustified depreciation or arbitrary repudiations.\n• Ombudsman Representation: Preparing formal briefs for hearings before the Insurance Ombudsman under the Insurance Ombudsman Rules, 2017.\n\nFinal claim decisions remain with the insurer and are governed by applicable policy terms and IRDAI regulations.",
  ],
];

export function getServicePageSchema(service) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/services/${service.slug}#webpage`,
        url: `${SITE_URL}/services/${service.slug}`,
        name: service.seoTitle,
        description: service.description,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/services/${service.slug}#service`,
        name: service.title,
        description: service.description,
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: {
          "@type": "Country",
          name: BUSINESS_DETAILS.serviceArea,
        },
        serviceType: service.title,
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/services/${service.slug}#faq`,
        mainEntity: [...service.faqs, ...entityFaqs].map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/services/${service.slug}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
          {
            "@type": "ListItem",
            position: 3,
            name: service.title,
            item: `${SITE_URL}/services/${service.slug}`,
          },
        ],
      },
    ],
  };
}

const commonRelated = [
  { title: "General Insurance", slug: "general-insurance", icon: "shield" },
  { title: "Health Insurance", slug: "health-insurance", icon: "medical_services" },
  { title: "Motor Insurance", slug: "motor-insurance", icon: "directions_car" },
  { title: "Commercial Insurance", slug: "commercial-insurance", icon: "apartment" },
  { title: "Claims Assistance", slug: "claims-assistance", icon: "gavel" },
  { title: "Policy Renewals", slug: "policy-renewals", icon: "sync" },
];

export function getRelatedServices(service) {
  const bySlug = new Map(commonRelated.map((item) => [item.slug, item]));
  return service.related.map(
    (slug) =>
      bySlug.get(slug) || {
        title: servicesBySlug[slug].title,
        slug,
        icon: servicesBySlug[slug].icon,
      },
  );
}
