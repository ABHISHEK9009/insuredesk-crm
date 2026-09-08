import Link from "next/link";
import Script from "next/script";
import PublicHeader from "@/app/components/public/PublicHeader";
import LandingEffects from "@/app/components/LandingEffects";
import PublicFooter from "@/app/components/public/PublicFooter";
import { BUSINESS_DETAILS, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export const metadata = {
  title: "Privacy Policy & Data Protection Charter",
  description:
    "Official Privacy Policy and Client Data Protection Charter for Bima Headquarter (InsureDesk IMF Pvt. Ltd.). Learn our zero-data-selling pledge, IRDAI regulatory compliance, and 256-bit SSL document security standards.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: `Privacy Policy & Data Protection Charter | ${SITE_NAME}`,
    description:
      "Understand how Bima Headquarter (InsureDesk IMF Pvt. Ltd.) safeguards your insurance policies, KYC identifiers, and claim portfolios with strict non-disclosure standards.",
    url: `${SITE_URL}/privacy-policy`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Privacy Policy & Data Protection Charter | ${SITE_NAME}`,
    description:
      "Official Privacy Policy and Data Protection standards of Bima Headquarter. Zero data selling, bank-grade encryption, and IRDAI compliance.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/privacy-policy#webpage`,
      url: `${SITE_URL}/privacy-policy`,
      name: `Privacy Policy & Data Protection Charter | ${SITE_NAME}`,
      headline: "Privacy Policy & Client Data Protection Charter",
      description:
        "Comprehensive privacy policy of Bima Headquarter and InsureDesk IMF Pvt. Ltd., outlining data collection, lawful usage, non-disclosure guarantees, and grievance redressal.",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/privacy-policy#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Privacy Policy",
          item: `${SITE_URL}/privacy-policy`,
        },
      ],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      legalName: BUSINESS_DETAILS.legalName,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/main-logo-wide.webp`,
      email: BUSINESS_DETAILS.email,
      telephone: BUSINESS_DETAILS.phoneHref,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: BUSINESS_DETAILS.phoneHref,
        contactType: "customer service & grievance",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS_DETAILS.address.streetAddress,
        addressLocality: BUSINESS_DETAILS.address.addressLocality,
        addressRegion: BUSINESS_DETAILS.address.addressRegion,
        postalCode: BUSINESS_DETAILS.address.postalCode,
        addressCountry: BUSINESS_DETAILS.address.addressCountry,
      },
    },
  ],
};

const tableOfContents = [
  { id: "corporate-scope", label: "01. Scope & Legal Identity", icon: "domain" },
  { id: "data-collection", label: "02. Information We Collect", icon: "folder_shared" },
  { id: "lawful-processing", label: "03. Lawful Grounds & Purpose", icon: "balance" },
  { id: "zero-selling", label: "04. Zero-Spam & Sharing Pledge", icon: "verified_user" },
  { id: "security-storage", label: "05. Bank-Grade Data Security", icon: "lock" },
  { id: "communication-policy", label: "06. Servicing Communications", icon: "notifications_active" },
  { id: "client-rights", label: "07. Client Rights (DPDP Act)", icon: "shield_person" },
  { id: "data-retention", label: "08. Retention & Archival", icon: "history_toggle_off" },
  { id: "grievance-redressal", label: "09. Grievance Officer & Contact", icon: "gavel" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="landing-shell min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <LandingEffects />
      <Script
        id="privacy-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <PublicHeader />

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
          }
          
          .policy-hero-gradient {
            background: 
              radial-gradient(circle at 85% 15%, rgba(28, 108, 57, 0.08), transparent 42%),
              radial-gradient(circle at 10% 40%, rgba(3, 22, 56, 0.05), transparent 48%),
              linear-gradient(180deg, #edf4ff 0%, #f8f9ff 100%);
          }

          .policy-card {
            background: #ffffff;
            border: 1px solid rgba(8, 27, 55, 0.08);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(3, 22, 56, 0.04);
            transition: all 0.25s ease;
          }

          .policy-card:hover {
            border-color: rgba(28, 108, 57, 0.2);
            box-shadow: 0 16px 40px rgba(3, 22, 56, 0.07);
          }

          .policy-sidebar-link {
            transition: all 0.2s ease;
            position: relative;
          }

          .policy-sidebar-link:hover {
            color: #1c6c39;
            background: rgba(28, 108, 57, 0.06);
            transform: translateX(4px);
          }

          .highlight-callout {
            background: linear-gradient(135deg, rgba(28, 108, 57, 0.06) 0%, rgba(3, 22, 56, 0.03) 100%);
            border: 1px solid rgba(28, 108, 57, 0.22);
            border-radius: 16px;
          }

          .legal-section-target {
            scroll-margin-top: 100px;
          }
        `,
        }}
      />

      <main className="w-full">
        {/* Hero Section */}
        <section className="policy-hero-gradient pt-10 pb-16 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
              <span className="material-symbols-outlined text-[17px] text-emerald-700">verified_user</span>
              <span>IRDAI Compliance & Data Protection Governance</span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031638] tracking-tight font-display leading-[1.12]">
                Privacy Policy & Client Data Charter
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                At Bima Headquarter (a brand of InsureDesk IMF Pvt. Ltd.), we treat your personal records,
                medical disclosures, and corporate insurance portfolios with the highest fiduciary diligence.
                We never monetize or sell client data.
              </p>
            </div>

            {/* Quick Metadata Bar */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-500 pt-6 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-base">calendar_today</span>
                <span>Effective Date: <strong>January 1, 2025</strong></span>
              </div>
              <div className="hidden sm:block text-slate-300">•</div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-base">update</span>
                <span>Last Updated: <strong>September 2026</strong></span>
              </div>
              <div className="hidden sm:block text-slate-300">•</div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-base">corporate_fare</span>
                <span>Operating Entity: <strong>{BUSINESS_DETAILS.legalName}</strong></span>
              </div>
              <div className="hidden sm:block text-slate-300">•</div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">gavel</span>
                <span className="text-emerald-800 font-medium">IRDAI IMF & DPDP Act 2023 Aligned</span>
              </div>
            </div>

            {/* 4 Core Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">block</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">Zero Data Selling</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We never sell, rent, or lease contact details or insurance records to third-party telemarketers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">lock</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">256-Bit SSL Encryption</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  All documents, RC books, and KYC records are encrypted in transit and in isolated cloud repositories.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">policy</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">IRDAI IMF Regulated</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Operated strictly under Insurance Marketing Firm guidelines with legal fiduciary duties.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">support_agent</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">Grievance Redressal</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Direct access to our dedicated Data Grievance Officer with 48-hour acknowledgment SLA.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Layout: Sticky Sidebar + Structured Policy Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Sticky Table of Contents Sidebar (Desktop) */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-500">menu_book</span>
                  Table of Contents
                </h3>
                <nav className="space-y-1">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="policy-sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-emerald-700"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-emerald-600">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Need Compliance Support Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#031638] to-[#102a55] text-white shadow-md">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-3 text-emerald-300">
                  <span className="material-symbols-outlined text-xl">contact_support</span>
                </div>
                <h4 className="font-bold text-base mb-1.5">Compliance Desk</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Questions regarding our data protection standards, policy archives, or KYC processing?
                </p>
                <div className="space-y-2 text-xs">
                  <a
                    href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                    className="flex items-center gap-2 text-slate-200 hover:text-emerald-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-emerald-400">call</span>
                    <span>{BUSINESS_DETAILS.phone}</span>
                  </a>
                  <a
                    href={`mailto:${BUSINESS_DETAILS.email}`}
                    className="flex items-center gap-2 text-slate-200 hover:text-emerald-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-emerald-400">mail</span>
                    <span>{BUSINESS_DETAILS.email}</span>
                  </a>
                </div>
              </div>
            </aside>

            {/* Main Policy Sections Column */}
            <div className="lg:col-span-8 space-y-10 min-w-0">
              {/* Section 1: Corporate Scope */}
              <article id="corporate-scope" className="policy-card p-6 sm:p-8 legal-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Corporate Scope & Legal Identity
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    <strong>Bima Headquarter</strong> is a specialized insurance and risk advisory brand owned and
                    operated by <strong>{BUSINESS_DETAILS.legalName}</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;,
                    &ldquo;us&rdquo;, or &ldquo;our&rdquo;). We operate as an Insurance Marketing Firm (IMF) regulated
                    under the Insurance Regulatory and Development Authority of India (IRDAI) guidelines.
                  </p>
                  <p>
                    This Privacy Policy and Client Data Charter describes our strict practices regarding the
                    collection, storage, protection, and lawful processing of personal identifiers, commercial risk
                    data, health records, and claim documentation submitted through our website (
                    <Link href="/" className="text-emerald-700 hover:underline font-medium">
                      bimaheadquarter.com
                    </Link>
                    ), advisory desks, customer service channels, and physical branch locations.
                  </p>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                    <strong className="text-[#031638] block mb-1">Fiduciary Mandate:</strong>
                    Unlike lead generation aggregators or generic websites whose commercial business model is selling
                    inquiries to competing call centers, Bima Headquarter operates under a strict fiduciary mandate to
                    advocate exclusively for you, the client, across underwriting, policy maintenance, and claim
                    disputes.
                  </div>
                </div>
              </article>

              {/* Section 2: Information We Collect */}
              <article id="data-collection" className="policy-card p-6 sm:p-8 legal-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Categories of Information We Collect
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    To accurately audit your insurance needs, solicit underwriting quotations, issue legally valid
                    policies, and adjudicate insurance claims, we collect only necessary and proportionate data:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2 font-bold text-[#031638] text-sm mb-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">badge</span>
                        Personal & KYC Identifiers
                      </div>
                      <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                        <li>Full legal name, date of birth, gender</li>
                        <li>Residential and communication addresses</li>
                        <li>Mobile number and verified email address</li>
                        <li>PAN card (mandated by IRDAI Master Guidelines)</li>
                        <li>Masked Aadhaar / C-KYC reference number</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2 font-bold text-[#031638] text-sm mb-2">
                        <span className="material-symbols-outlined text-blue-600 text-base">directions_car</span>
                        Asset & Policy Records
                      </div>
                      <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                        <li>Vehicle RC books, engine and chassis numbers</li>
                        <li>Previous policy certificates and claim records</li>
                        <li>No Claim Bonus (NCB) continuity proof</li>
                        <li>Commercial property, factory & warehouse layout details</li>
                        <li>Fire and transit cargo inventory values</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2 font-bold text-[#031638] text-sm mb-2">
                        <span className="material-symbols-outlined text-red-600 text-base">health_and_safety</span>
                        Health & Nominee Disclosures
                      </div>
                      <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                        <li>Pre-existing medical conditions & surgical history</li>
                        <li>Diagnostic laboratory reports (where insurer requires)</li>
                        <li>Designated nominee name, age, and relationship</li>
                        <li>Habits disclosure (e.g., smoking, hazardous vocations)</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2 font-bold text-[#031638] text-sm mb-2">
                        <span className="material-symbols-outlined text-purple-600 text-base">receipt_long</span>
                        Claim Assistance Records
                      </div>
                      <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                        <li>Hospital discharge summaries and pharmacy bills</li>
                        <li>FIR / Police Panchnama (in accidental losses)</li>
                        <li>Independent surveyor preliminary damage estimates</li>
                        <li>Bank passbook / cancelled cheque for NEFT settlement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 3: Lawful Purpose */}
              <article id="lawful-processing" className="policy-card p-6 sm:p-8 legal-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Lawful Grounds & Processing Purposes
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    All client information is collected and processed strictly under lawful contractual and regulatory
                    grounds recognized under the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and
                    IRDAI regulations. Specifically, your data is used for:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5">check_circle</span>
                      <div>
                        <strong>Underwriting Comparison & Proposal Submission:</strong> Evaluating risk profiles across
                        IRDAI-licensed insurance companies to procure the most competitive premiums and comprehensive
                        coverage terms.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5">check_circle</span>
                      <div>
                        <strong>Policy Issuance & Endorsements:</strong> Transmitting authenticated proposal records
                        to your chosen insurer to issue valid policy contracts, rectify typos, update vehicle
                        modifications, or amend nominee details.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5">check_circle</span>
                      <div>
                        <strong>Claim Advocacy & Settlement Tracking:</strong> Coordinating with licensed Third-Party
                        Administrators (TPAs), cashless hospital desks, independent surveyors, and insurer claims teams
                        to expedite legitimate reimbursements.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5">check_circle</span>
                      <div>
                        <strong>Renewal Continuity Alerts:</strong> Calculating renewal dates and reminding clients 45,
                        30, 15, and 7 days prior to expiry to prevent coverage lapses, vehicle impoundment penalties, and
                        loss of accumulated NCB benefits.
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 4: Zero Selling Pledge */}
              <article id="zero-selling" className="policy-card p-6 sm:p-8 legal-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Zero-Spam & Non-Disclosure Pledge
                  </h2>
                </div>

                {/* Highlight Card */}
                <div className="highlight-callout p-5 sm:p-6 mb-6">
                  <div className="flex items-center gap-3 text-emerald-800 font-bold text-base mb-2">
                    <span className="material-symbols-outlined text-2xl text-emerald-700">verified</span>
                    <span>Our Unconditional Zero-Spam Guarantee</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    We despise unwanted sales calls as much as you do. Bima Headquarter will <strong>NEVER</strong> sell,
                    rent, trade, lease, or monetize your contact details, email addresses, or insurance records to
                    third-party telemarketers, unsolicited loan aggregators, or digital advertising networks.
                  </p>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    Data sharing occurs strictly on an authenticated, need-to-know basis with legitimate entities
                    necessary to service your policy:
                  </p>
                  <ul className="space-y-2.5 list-none pl-0">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-slate-400 text-base mt-1">shield</span>
                      <span>
                        <strong>Selected Insurance Companies:</strong> Strictly with the insurer(s) you select (e.g.,
                        Tata AIG, ICICI Lombard, New India Assurance, HDFC ERGO, Bajaj Allianz, Care Health, Star Health,
                        etc.) for policy underwriting and risk approval.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-slate-400 text-base mt-1">shield</span>
                      <span>
                        <strong>IRDAI-Licensed TPAs & Surveyors:</strong> Shared exclusively for loss inspection, cashless
                        hospital approvals, and claim assessment.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-slate-400 text-base mt-1">shield</span>
                      <span>
                        <strong>Statutory Authorities:</strong> Only when strictly compelled by Indian court summons,
                        enforceable judicial warrants, or IRDAI statutory inquiries.
                      </span>
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 5: Bank-Grade Security */}
              <article id="security-storage" className="policy-card p-6 sm:p-8 legal-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    05
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Bank-Grade Data Security & Storage
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    We deploy multi-layered organizational and technical defenses to protect client documents against
                    unauthorized access, accidental loss, alteration, or interception:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-[#031638] text-sm mb-1.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">vpn_key</span>
                        In-Transit & At-Rest Encryption
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        TLS 1.3 protocol with 256-bit SSL encryption secures all web sessions. Stored document vaults use
                        AES-256 cryptographic standards.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-[#031638] text-sm mb-1.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600 text-base">admin_panel_settings</span>
                        Role-Based Access Control (RBAC)
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Internal access is locked down by least-privilege security controls. Only consultants assigned
                        to your policy can inspect your documents.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-[#031638] text-sm mb-1.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600 text-base">cloud_done</span>
                        Geographically Isolated Backups
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Daily encrypted backups stored within MeitY-compliant Indian cloud infrastructure to ensure
                        business continuity and data sovereignty.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-[#031638] text-sm mb-1.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600 text-base">history</span>
                        Immutable Audit Logging
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Every document access, download, or policy update generates an immutable digital audit timestamp
                        with operator identity.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 6: Servicing Communications */}
              <article id="communication-policy" className="policy-card p-6 sm:p-8 legal-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    06
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Servicing Communications & Consent
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    By engaging our consulting services, you grant consent to receive essential policy servicing notices
                    via WhatsApp Business API, SMS, phone call, or email:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-sm text-slate-600">
                    <li>
                      <strong>Statutory & Renewal Alerts:</strong> Critical alerts regarding policy expiry dates, grace
                      periods, premium payment links, and renewal endorsement schedules.
                    </li>
                    <li>
                      <strong>Claim Progress Notifications:</strong> Surveyor appointment confirmations, document
                      deficiency checklists, cashless hospital approvals, and settlement letters.
                    </li>
                    <li>
                      <strong>Policy Document Delivery:</strong> Digital PDF delivery of issued schedules, endorsement
                      copies, premium tax certificates, and renewal receipts.
                    </li>
                  </ul>
                  <p className="text-xs sm:text-sm text-slate-500 pt-2">
                    <strong>Preference Management:</strong> You may opt out of non-essential risk advisories or
                    educational newsletters at any time by emailing{" "}
                    <a href={`mailto:${BUSINESS_DETAILS.email}`} className="text-emerald-700 hover:underline">
                      {BUSINESS_DETAILS.email}
                    </a>{" "}
                    or clicking the unsubscribe link at the footer of advisory emails. Transactional renewal alerts
                    cannot be disabled during an active policy period to prevent accidental loss of insurance coverage.
                  </p>
                </div>
              </article>

              {/* Section 7: Client Rights */}
              <article id="client-rights" className="policy-card p-6 sm:p-8 legal-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    07
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Client Rights (Under DPDP Act 2023)
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    Under the <strong>Digital Personal Data Protection Act, 2023</strong> and IRDAI operational
                    guidelines, you maintain distinct statutory rights over your personal data:
                  </p>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5">visibility</span>
                      <div className="text-xs sm:text-sm">
                        <strong className="text-[#031638] block">Right to Access & Summary:</strong>
                        You may request an executive summary of all active policies, stored documents, and identity
                        records maintained in our CRM database.
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                      <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">edit_note</span>
                      <div className="text-xs sm:text-sm">
                        <strong className="text-[#031638] block">Right to Rectification:</strong>
                        You may request immediate correction of outdated mobile numbers, residential addresses, typo
                        corrections, or updated vehicle details.
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                      <span className="material-symbols-outlined text-purple-600 text-lg mt-0.5">person_add</span>
                      <div className="text-xs sm:text-sm">
                        <strong className="text-[#031638] block">Right to Nominate:</strong>
                        You may nominate an individual who, in the event of death or incapacity, shall exercise your
                        rights regarding claim management and policy records.
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 8: Retention & Archival */}
              <article id="data-retention" className="policy-card p-6 sm:p-8 legal-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    08
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Data Retention & Digital Archival
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    We retain customer records strictly for periods necessary to fulfill contractual obligations and
                    statutory requirements:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-sm text-slate-600">
                    <li>
                      <strong>Active Policies:</strong> Preserved throughout the active policy term plus a minimum of{" "}
                      <strong>5 to 8 years post-expiry</strong> to comply with IRDAI claims arbitration timelines,
                      dispute defense periods, and income tax auditing mandates.
                    </li>
                    <li>
                      <strong>Unconverted Quotations:</strong> Purged or anonymized automatically within 180 days if an
                      insurance proposal is not converted into an issued policy.
                    </li>
                    <li>
                      <strong>Secure Digital Shredding:</strong> Expired digital records are erased using cryptographic
                      shredding protocols preventing data recovery.
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 9: Grievance Redressal */}
              <article id="grievance-redressal" className="policy-card p-6 sm:p-8 legal-section-target border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    09
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Statutory Grievance Redressal & Contact Officer
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    In accordance with the <strong>Digital Personal Data Protection Act 2023</strong> and IRDAI
                    regulations, we have appointed a designated Grievance & Data Protection Officer:
                  </p>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white mt-4 shadow-xs">
                    <table className="min-w-full text-left text-xs sm:text-sm">
                      <tbody className="divide-y divide-slate-100">
                        <tr className="bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-500 w-1/3">Designated Officer</td>
                          <td className="px-4 py-3 font-bold text-[#031638]">Anand Soni (Founder Director)</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-500">Corporate Entity</td>
                          <td className="px-4 py-3 text-slate-800">{BUSINESS_DETAILS.legalName}</td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-500">Email Address</td>
                          <td className="px-4 py-3">
                            <a
                              href={`mailto:${BUSINESS_DETAILS.email}`}
                              className="text-emerald-700 font-medium hover:underline"
                            >
                              {BUSINESS_DETAILS.email}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-500">Grievance Helpline</td>
                          <td className="px-4 py-3">
                            <a
                              href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                              className="text-emerald-700 font-medium hover:underline"
                            >
                              {BUSINESS_DETAILS.phone}
                            </a>
                          </td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-500">Corporate Office</td>
                          <td className="px-4 py-3 text-slate-800">{BUSINESS_DETAILS.fullAddress}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-500">Resolution SLA</td>
                          <td className="px-4 py-3 text-slate-800">
                            Acknowledgment within 24–48 hours; final resolution within 14 business days.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-slate-500 pt-2">
                    <strong>Statutory Escalation:</strong> If any insurance complaint remains unaddressed after 30 days,
                    policyholders retain the statutory right under the Insurance Ombudsman Rules to approach the
                    Insurance Ombudsman (Office of the Insurance Ombudsman, Bhopal Jurisdiction).
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Bottom Consultation & Support Banner */}
        <section className="bg-gradient-to-r from-[#031638] via-[#082255] to-[#031638] text-white py-14 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm">shield</span>
              <span>Client Confidentiality Guaranteed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white mb-4">
              Have Questions About Your Policy Data Privacy?
            </h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
              Our compliance and corporate risk team is readily available to answer any questions about our document
              security, encryption vaults, or IRDAI regulatory procedures.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-base">call</span>
                <span>Call Compliance Desk</span>
              </a>
              <Link
                href="/#cta-banner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition-all"
              >
                <span>Get Free Policy Consultation</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
