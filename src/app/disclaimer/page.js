import Link from "next/link";
import Script from "next/script";
import PublicHeader from "@/app/components/public/PublicHeader";
import LandingEffects from "@/app/components/LandingEffects";
import PublicFooter from "@/app/components/public/PublicFooter";
import { BUSINESS_DETAILS, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export const metadata = {
  title: "Insurance Consultancy & Regulatory Disclaimer",
  description:
    "Read the official Bima Headquarter disclaimer covering insurance consultancy, intermediary advisory scope, insurer underwriting independence, and claims assistance boundaries.",
  alternates: {
    canonical: "/disclaimer",
  },
  openGraph: {
    title: `Insurance Consultancy Disclaimer | ${SITE_NAME}`,
    description:
      "Statutory disclosures and regulatory disclaimer for Bima Headquarter (InsureDesk IMF Pvt. Ltd.). Clarifying intermediary advisory scope, insurer underwriting, and claim boundaries.",
    url: `${SITE_URL}/disclaimer`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Insurance Consultancy Disclaimer | ${SITE_NAME}`,
    description:
      "Official disclaimer and regulatory disclosure for Bima Headquarter (InsureDesk IMF Pvt. Ltd.). Intermediary scope and underwriting boundaries.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/disclaimer#webpage`,
      url: `${SITE_URL}/disclaimer`,
      name: `Insurance Consultancy & Regulatory Disclaimer | ${SITE_NAME}`,
      headline: "Insurance Consultancy & Regulatory Disclaimer",
      description:
        "Comprehensive regulatory disclaimer and statutory disclosures for Bima Headquarter and InsureDesk IMF Pvt. Ltd., establishing intermediary boundaries and underwriting independence.",
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
      "@id": `${SITE_URL}/disclaimer#breadcrumb`,
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
          name: "Disclaimer",
          item: `${SITE_URL}/disclaimer`,
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
  { id: "corporate-identity", label: "01. Corporate Identity & Scope", icon: "domain" },
  { id: "solicitation-underwriting", label: "02. Solicitation & Underwriting", icon: "policy" },
  { id: "claims-boundaries", label: "03. Claims Assistance Boundaries", icon: "assignment_late" },
  { id: "client-disclosures", label: "04. Material Fact Disclosures", icon: "fact_check" },
  { id: "premium-remittance", label: "05. Direct Premium Remittance", icon: "payments" },
  { id: "rebate-prohibition", label: "06. Section 41 Rebate Prohibition", icon: "gavel" },
  { id: "tax-investment-disclaimer", label: "07. Tax & Investment Disclaimers", icon: "calculate" },
  { id: "third-party-links", label: "08. Third-Party Portals & Links", icon: "open_in_new" },
  { id: "grievance-ombudsman", label: "09. Grievance & Ombudsman", icon: "balance" },
];

export default function DisclaimerPage() {
  return (
    <div className="landing-shell min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <LandingEffects />
      <Script
        id="disclaimer-structured-data"
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
          
          .disclaimer-hero-gradient {
            background: 
              radial-gradient(circle at 85% 15%, rgba(217, 119, 6, 0.08), transparent 42%),
              radial-gradient(circle at 10% 40%, rgba(3, 22, 56, 0.06), transparent 48%),
              linear-gradient(180deg, #edf4ff 0%, #f8f9ff 100%);
          }

          .disclaimer-card {
            background: #ffffff;
            border: 1px solid rgba(8, 27, 55, 0.08);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(3, 22, 56, 0.04);
            transition: all 0.25s ease;
          }

          .disclaimer-card:hover {
            border-color: rgba(217, 119, 6, 0.25);
            box-shadow: 0 16px 40px rgba(3, 22, 56, 0.07);
          }

          .disclaimer-sidebar-link {
            transition: all 0.2s ease;
            position: relative;
          }

          .disclaimer-sidebar-link:hover {
            color: #d97706;
            background: rgba(217, 119, 6, 0.06);
            transform: translateX(4px);
          }

          .amber-statutory-callout {
            background: linear-gradient(135deg, rgba(217, 119, 6, 0.06) 0%, rgba(3, 22, 56, 0.03) 100%);
            border: 1px solid rgba(217, 119, 6, 0.28);
            border-radius: 16px;
          }

          .disclaimer-section-target {
            scroll-margin-top: 100px;
          }
        `,
        }}
      />

      <main className="w-full">
        {/* Hero Section */}
        <section className="disclaimer-hero-gradient pt-10 pb-16 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
              <span className="material-symbols-outlined text-[17px] text-amber-700">policy</span>
              <span>IRDAI Statutory Disclosures & Regulatory Disclaimer</span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031638] tracking-tight font-display leading-[1.12]">
                Insurance Consultancy & Regulatory Disclaimer
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                Statutory disclosures, underwriting boundaries, intermediary advisory status, and liability
                limitations governing Bima Headquarter (a brand of InsureDesk IMF Pvt. Ltd.).
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
                <span className="material-symbols-outlined text-amber-600 text-base">verified</span>
                <span className="text-amber-900 font-medium">IRDAI (IMF Regulations) & Insurance Act 1938</span>
              </div>
            </div>

            {/* 4 Core Disclaimer Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">handshake</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">Intermediary Status</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We operate as an Insurance Marketing Firm (IMF); we do not act as an insurance risk underwriter.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">campaign</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">Solicitation Rules</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Insurance is the subject matter of solicitation. Policy terms, exclusions, and rates belong to insurers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">Claims Boundaries</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We provide documentation advocacy; claim approvals and settlements are determined solely by insurers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">payments</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">Direct Premium Remittance</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  All premiums are payable directly to the insurer under Section 64VB; we never accept personal cash.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Layout: Sticky Sidebar + Structured Disclaimer Cards */}
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
                      className="disclaimer-sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-amber-800"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-amber-600">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Need Compliance Support Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#031638] to-[#102a55] text-white shadow-md">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-3 text-amber-300">
                  <span className="material-symbols-outlined text-xl">support_agent</span>
                </div>
                <h4 className="font-bold text-base mb-1.5">Compliance Desk</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Questions regarding our regulatory disclosures, underwriting boundaries, or policy terms?
                </p>
                <div className="space-y-2 text-xs">
                  <a
                    href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                    className="flex items-center gap-2 text-slate-200 hover:text-amber-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-amber-400">call</span>
                    <span>{BUSINESS_DETAILS.phone}</span>
                  </a>
                  <a
                    href={`mailto:${BUSINESS_DETAILS.email}`}
                    className="flex items-center gap-2 text-slate-200 hover:text-amber-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-amber-400">mail</span>
                    <span>{BUSINESS_DETAILS.email}</span>
                  </a>
                </div>
              </div>
            </aside>

            {/* Main Disclaimer Sections Column */}
            <div className="lg:col-span-8 space-y-10 min-w-0">
              {/* Section 1: Corporate Identity */}
              <article id="corporate-identity" className="disclaimer-card p-6 sm:p-8 disclaimer-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Corporate Identity & Intermediary Scope
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    <strong>Bima Headquarter</strong> is a brand owned and operated by{" "}
                    <strong>{BUSINESS_DETAILS.legalName}</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;,
                    &ldquo;us&rdquo;, or &ldquo;our&rdquo;). We operate as an authorized Insurance Marketing Firm (IMF)
                    regulated under the regulations framed by the Insurance Regulatory and Development Authority of India
                    (IRDAI).
                  </p>
                  <p>
                    Bima Headquarter functions strictly as an intermediary advisory consultant and client advocate. We
                    are <strong>not an insurance risk-carrying company</strong>. We do not underwrite insurance risk,
                    issue balance sheet guarantees, or maintain reserves for insurance claims. All insurance products
                    offered or analyzed are underwritten by IRDAI-registered general, health, life, and specialized
                    insurance carriers.
                  </p>
                </div>
              </article>

              {/* Section 2: Solicitation & Underwriting Independence */}
              <article id="solicitation-underwriting" className="disclaimer-card p-6 sm:p-8 disclaimer-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Solicitation & Underwriting Independence
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-xs sm:text-sm text-amber-900 font-medium">
                    Statutory Notice: Insurance is the subject matter of solicitation. Policy terms, exclusions,
                    conditions, deductibles, and premium rates are governed strictly by the respective insurance
                    company&rsquo;s prospectus and filed underwriting rules approved by IRDAI.
                  </div>
                  <p>
                    All policy comparisons, premium calculators, coverage matrices, and recommendations provided across
                    our website or by our risk consultants are intended solely for educational, analytical, and
                    inter-market comparison purposes:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-sm text-slate-600">
                    <li>
                      <strong>Non-Binding Quotations:</strong> Any premium estimate or indicative benefit shown prior to
                      formal proposal submission is non-binding and subject to insurer underwriting acceptance and tax
                      computations.
                    </li>
                    <li>
                      <strong>Policy Schedule Supremacy:</strong> In the event of any contradiction or ambiguity between
                      consultant summaries and the insurance policy schedule issued by the insurance carrier, the
                      terms, conditions, exclusions, and endorsements stated in the official policy schedule shall
                      supersede and prevail in all instances.
                    </li>
                    <li>
                      <strong>Client Review Obligation:</strong> Clients must carefully read the final policy wording,
                      schedule of insurance, waiting period clauses, and exclusion schedules upon receipt of the policy
                      document.
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 3: Claims Assistance Boundaries */}
              <article id="claims-boundaries" className="disclaimer-card p-6 sm:p-8 disclaimer-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Claims Assistance & Settlement Boundaries
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    Bima Headquarter provides dedicated, professional claims assistance to represent policyholders in
                    document assembly, surveyor follow-up, query clarification, and technical representation before
                    insurer grievance desks.
                  </p>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                    <strong className="text-[#031638] block mb-1">No Guarantee of Settlement:</strong>
                    Claims assistance does not constitute a guarantee of claim admission, cashless sanction, or
                    disbursement amount. The final decision to admit, assess, discount, or repudiate any insurance
                    claim rests exclusively and authoritatively with the underwriting insurance company and its
                    empaneled Third-Party Administrators (TPAs) under the applicable policy wordings.
                  </div>
                  <p>
                    Bima Headquarter does not hold liability for claims repudiated due to non-disclosure, pre-existing
                    ailment waiting periods, policy exclusions, late intimation beyond statutory deadlines, or surveyor
                    assessments conducted in accordance with insurer mandates.
                  </p>
                </div>
              </article>

              {/* Section 4: Material Fact Disclosures */}
              <article id="client-disclosures" className="disclaimer-card p-6 sm:p-8 disclaimer-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Reliance on Client Disclosures (Uberrima Fides)
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    All guidance, quotations, and policy placements formulated by Bima Headquarter depend strictly on
                    the completeness, accuracy, and truthfulness of the disclosures supplied by the client:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-sm text-slate-600">
                    <li>
                      <strong>Doctrine of Utmost Good Faith:</strong> Under the doctrine of <em>Uberrimae Fidei</em>, the
                      policyholder bears the sole legal obligation to declare all material facts, including medical
                      history, previous claim experience, accurate vehicle IDV, and commercial risk features.
                    </li>
                    <li>
                      <strong>Consequence of Misrepresentation:</strong> Concealment, inadvertent omissions, or fraudulent
                      statements made during proposal completion entitle the insurer to void coverage and repudiate claims
                      under Section 45 of the Insurance Act 1938. Bima Headquarter expressly disclaims any liability
                      arising from client omissions or inaccurate declarations.
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 5: Direct Premium Remittance */}
              <article id="premium-remittance" className="disclaimer-card p-6 sm:p-8 disclaimer-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    05
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Direct Premium Remittance & Anti-Cash Policy
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    In strict compliance with <strong>Section 64VB of the Insurance Act 1938</strong> and IRDAI
                    solicitation regulations:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5">verified_user</span>
                      <div>
                        <strong>Direct Payment to Insurer:</strong> All premium payments must be remitted directly to the
                        respective insurance company through authorized digital payment gateways, insurer web portals, or
                        crossed account payee cheques drawn strictly in favor of the insurance company.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-600 text-lg mt-0.5">block</span>
                      <div>
                        <strong>Zero Cash Collection Policy:</strong> Bima Headquarter, its directors, and its field
                        consultants are strictly prohibited from accepting cash or personal bank transfers for insurance
                        premiums. We disclaim all liability for any cash payments made to unauthorized individuals.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">timer</span>
                      <div>
                        <strong>Risk Inception Timing:</strong> No insurance policy commences risk coverage until the
                        underwriting insurance company successfully receives and realizes the premium payment.
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 6: Section 41 Rebate Prohibition */}
              <article id="rebate-prohibition" className="disclaimer-card p-6 sm:p-8 disclaimer-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    06
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Statutory Notice: Prohibition of Rebates (Section 41)
                  </h2>
                </div>

                {/* Amber Statutory Callout Box */}
                <div className="amber-statutory-callout p-5 sm:p-6 mb-6">
                  <div className="flex items-center gap-3 text-amber-900 font-bold text-base mb-2">
                    <span className="material-symbols-outlined text-2xl text-amber-700">gavel</span>
                    <span>Section 41 of the Insurance Act, 1938</span>
                  </div>
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <p>
                      <strong>(1)</strong> No person shall allow or offer to allow, either directly or indirectly, as an
                      inducement to any person to take out or renew or continue an insurance in respect of any kind of
                      risk relating to lives or property in India, any rebate of the whole or part of the commission
                      payable or any rebate of the premium shown on the policy, nor shall any person taking out or
                      renewing or continuing a policy accept any rebate, except such rebate as may be allowed in
                      accordance with the published prospectuses or tables of the insurer.
                    </p>
                    <p>
                      <strong>(2)</strong> Any person making default in complying with the provisions of this section shall
                      be liable for a penalty which may extend to <strong>ten lakh rupees (₹10,00,000)</strong>.
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Bima Headquarter operates with zero compromise on regulatory compliance. We neither offer nor entertain
                  demands for illegal premium rebates, kickbacks, or commercial inducements under any circumstances.
                </p>
              </article>

              {/* Section 7: Tax & Investment Disclaimers */}
              <article id="tax-investment-disclaimer" className="disclaimer-card p-6 sm:p-8 disclaimer-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    07
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Tax Benefits & Investment Advisory Disclaimers
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    Tax benefits cited in connection with health insurance (Section 80D), life insurance (Section 80C),
                    and maturity proceeds (Section 10(10D)) are based on prevailing provisions of the Indian Income Tax
                    Act 1961:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-sm text-slate-600">
                    <li>
                      <strong>Subject to Tax Law Amendments:</strong> Tax rules and exemptions are subject to periodic
                      amendments in annual Finance Acts and vary according to the individual taxpayer&rsquo;s choice of
                      tax regime (Old vs. New Tax Regime).
                    </li>
                    <li>
                      <strong>Independent Tax Advice:</strong> Bima Headquarter provides insurance consulting and does
                      not offer certified chartered accountancy or formal tax planning services. Clients must consult
                      their qualified Chartered Accountant or legal tax advisor regarding specific tax eligibility.
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 8: Third-Party Portals & Hyperlinks */}
              <article id="third-party-links" className="disclaimer-card p-6 sm:p-8 disclaimer-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    08
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Third-Party Portals, Insurer Portals & Hyperlinks
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    Our website may contain hyperlinks leading to external web resources, including insurer payment
                    gateways, network hospital locators, network cashless garage directories, and regulatory authority
                    portals (IRDAI, Bima Bharosa, Ombudsman).
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    These links are provided solely for client convenience. Bima Headquarter exercises no administrative
                    control over external websites and accepts no responsibility for their content, uptime, cybersecurity
                    protocols, or transaction reliability.
                  </p>
                </div>
              </article>

              {/* Section 9: Grievance Redressal & Ombudsman Oversight */}
              <article id="grievance-ombudsman" className="disclaimer-card p-6 sm:p-8 disclaimer-section-target border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                    09
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Statutory Grievance Redressal & Ombudsman Oversight
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    Bima Headquarter maintains an open, transparent dispute escalation protocol for all intermediary
                    servicing matters:
                  </p>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white mt-4 shadow-xs">
                    <table className="min-w-full text-left text-xs sm:text-sm">
                      <tbody className="divide-y divide-slate-100">
                        <tr className="bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-500 w-1/3">Compliance Officer</td>
                          <td className="px-4 py-3 font-bold text-[#031638]">Anand Soni (Founder Director)</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-500">Operating Entity</td>
                          <td className="px-4 py-3 text-slate-800">{BUSINESS_DETAILS.legalName}</td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-500">Compliance Email</td>
                          <td className="px-4 py-3">
                            <a
                              href={`mailto:${BUSINESS_DETAILS.email}`}
                              className="text-amber-800 font-medium hover:underline"
                            >
                              {BUSINESS_DETAILS.email}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-500">Helpline</td>
                          <td className="px-4 py-3">
                            <a
                              href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                              className="text-amber-800 font-medium hover:underline"
                            >
                              {BUSINESS_DETAILS.phone}
                            </a>
                          </td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-500">Registered Office</td>
                          <td className="px-4 py-3 text-slate-800">{BUSINESS_DETAILS.fullAddress}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-500">Statutory Ombudsman</td>
                          <td className="px-4 py-3 text-slate-800">
                            Office of the Insurance Ombudsman, Janakpuri, Bhopal (Bhopal Jurisdiction).
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-slate-500 pt-2">
                    <strong>Statutory Insurance Ombudsman:</strong> If an insurance policyholder is not satisfied with
                    the resolution of an insurer regarding claim repudiation, delay, or dispute, they have the statutory
                    right to approach the Insurance Ombudsman (Office of the Insurance Ombudsman, Janakpuri, Bhopal).
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Bottom Consultation & Support Banner */}
        <section className="bg-gradient-to-r from-[#031638] via-[#082255] to-[#031638] text-white py-14 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm">policy</span>
              <span>Regulatory Fiduciary Mandate</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white mb-4">
              Have Questions About Our Regulatory Disclosures?
            </h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
              Our compliance and corporate risk desk is readily available to answer any questions about our intermediary
              charter, underwriting boundaries, or IRDAI regulatory procedures.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
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
