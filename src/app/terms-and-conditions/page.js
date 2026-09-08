import Link from "next/link";
import Script from "next/script";
import PublicHeader from "@/app/components/public/PublicHeader";
import LandingEffects from "@/app/components/LandingEffects";
import PublicFooter from "@/app/components/public/PublicFooter";
import { BUSINESS_DETAILS, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export const metadata = {
  title: "Terms and Conditions of Advisory & Service",
  description:
    "Official Terms and Conditions governing insurance advisory, policy review, claims advocacy, and statutory compliance with Bima Headquarter (InsureDesk IMF Pvt. Ltd.).",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: `Terms and Conditions | ${SITE_NAME}`,
    description:
      "Review the legal terms and client engagement charter for insurance consulting, policy audit, and claim assistance services provided by InsureDesk IMF Pvt. Ltd.",
    url: `${SITE_URL}/terms-and-conditions`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Terms and Conditions | ${SITE_NAME}`,
    description:
      "Official Terms and Conditions of service for Bima Headquarter (InsureDesk IMF Pvt. Ltd.). IRDAI compliance, fiduciary advisory, and claim assistance terms.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/terms-and-conditions#webpage`,
      url: `${SITE_URL}/terms-and-conditions`,
      name: `Terms and Conditions of Advisory & Service | ${SITE_NAME}`,
      headline: "Terms and Conditions & Client Engagement Charter",
      description:
        "Comprehensive terms and conditions governing insurance consultation, policy evaluation, and claims advocacy with Bima Headquarter and InsureDesk IMF Pvt. Ltd.",
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
      "@id": `${SITE_URL}/terms-and-conditions#breadcrumb`,
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
          name: "Terms and Conditions",
          item: `${SITE_URL}/terms-and-conditions`,
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
  { id: "corporate-scope", label: "01. Scope & Legal Status", icon: "domain" },
  { id: "advisory-services", label: "02. Scope of Advisory Services", icon: "handshake" },
  { id: "utmost-good-faith", label: "03. Client Obligations & Disclosures", icon: "fact_check" },
  { id: "insurer-underwriting", label: "04. Insurer Underwriting Terms", icon: "policy" },
  { id: "claims-assistance", label: "05. Claim Assistance Terms", icon: "assignment_late" },
  { id: "premium-payments", label: "06. Direct Premium Remittance", icon: "payments" },
  { id: "rebate-prohibition", label: "07. Section 41 Rebate Prohibition", icon: "gavel" },
  { id: "liability-limitation", label: "08. Liability & Disclaimers", icon: "shield" },
  { id: "grievance-jurisdiction", label: "09. Grievance & Jurisdiction", icon: "balance" },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="landing-shell min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <LandingEffects />
      <Script
        id="terms-structured-data"
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
          
          .terms-hero-gradient {
            background: 
              radial-gradient(circle at 85% 15%, rgba(3, 22, 56, 0.08), transparent 42%),
              radial-gradient(circle at 10% 40%, rgba(28, 108, 57, 0.06), transparent 48%),
              linear-gradient(180deg, #edf4ff 0%, #f8f9ff 100%);
          }

          .terms-card {
            background: #ffffff;
            border: 1px solid rgba(8, 27, 55, 0.08);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(3, 22, 56, 0.04);
            transition: all 0.25s ease;
          }

          .terms-card:hover {
            border-color: rgba(3, 22, 56, 0.2);
            box-shadow: 0 16px 40px rgba(3, 22, 56, 0.07);
          }

          .terms-sidebar-link {
            transition: all 0.2s ease;
            position: relative;
          }

          .terms-sidebar-link:hover {
            color: #031638;
            background: rgba(3, 22, 56, 0.06);
            transform: translateX(4px);
          }

          .statutory-callout {
            background: linear-gradient(135deg, rgba(217, 119, 6, 0.06) 0%, rgba(3, 22, 56, 0.03) 100%);
            border: 1px solid rgba(217, 119, 6, 0.28);
            border-radius: 16px;
          }

          .terms-section-target {
            scroll-margin-top: 100px;
          }
        `,
        }}
      />

      <main className="w-full">
        {/* Hero Section */}
        <section className="terms-hero-gradient pt-10 pb-16 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
              <span className="material-symbols-outlined text-[17px] text-blue-700">gavel</span>
              <span>IRDAI Regulatory Terms & Client Engagement Charter</span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#031638] tracking-tight font-display leading-[1.12]">
                Terms and Conditions of Advisory & Service
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                Legal terms and operational conditions governing insurance consultation, policy auditing,
                claims facilitation, and advisory engagements with Bima Headquarter (a brand of InsureDesk IMF Pvt. Ltd.).
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
                <span className="material-symbols-outlined text-blue-600 text-base">verified</span>
                <span className="text-blue-800 font-medium">IRDAI (IMF Regulations) & Insurance Act 1938</span>
              </div>
            </div>

            {/* 4 Core Legal Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">assured_workload</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">IRDAI Licensed IMF</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Authorized Insurance Marketing Firm operating under IRDAI regulations with legal fiduciary duties.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">fact_check</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">Utmost Good Faith</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Coverage validity depends on accurate disclosure of all material health, vehicle, and risk facts.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">balance</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">Insurer Underwriting</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Underwriting, policy terms, premiums, and final claim payments remain the exclusive decision of insurers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">block</span>
                </div>
                <h2 className="font-bold text-[#031638] text-base mb-1">Rebate Prohibition</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Strict compliance with Section 41 of the Insurance Act 1938 prohibiting premium rebates or kickbacks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Layout: Sticky Sidebar + Structured Terms Cards */}
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
                      className="terms-sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-blue-700"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-blue-600">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Need Compliance Support Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#031638] to-[#102a55] text-white shadow-md">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-3 text-blue-300">
                  <span className="material-symbols-outlined text-xl">support_agent</span>
                </div>
                <h4 className="font-bold text-base mb-1.5">Compliance Desk</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Questions regarding our service charter, policy agreements, or intermediary terms?
                </p>
                <div className="space-y-2 text-xs">
                  <a
                    href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                    className="flex items-center gap-2 text-slate-200 hover:text-blue-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-blue-400">call</span>
                    <span>{BUSINESS_DETAILS.phone}</span>
                  </a>
                  <a
                    href={`mailto:${BUSINESS_DETAILS.email}`}
                    className="flex items-center gap-2 text-slate-200 hover:text-blue-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-blue-400">mail</span>
                    <span>{BUSINESS_DETAILS.email}</span>
                  </a>
                </div>
              </div>
            </aside>

            {/* Main Terms Sections Column */}
            <div className="lg:col-span-8 space-y-10 min-w-0">
              {/* Section 1: Corporate Scope */}
              <article id="corporate-scope" className="terms-card p-6 sm:p-8 terms-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Corporate Scope & Legal Status
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    These Terms and Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you
                    (&ldquo;Client&rdquo;, &ldquo;Policyholder&rdquo;, &ldquo;User&rdquo;, or &ldquo;you&rdquo;) and{" "}
                    <strong>{BUSINESS_DETAILS.legalName}</strong>, operating under the flagship brand{" "}
                    <strong>Bima Headquarter</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                    &ldquo;our&rdquo;).
                  </p>
                  <p>
                    InsureDesk IMF Pvt. Ltd. is an authorized Insurance Marketing Firm (IMF) regulated under the
                    regulations framed by the Insurance Regulatory and Development Authority of India (IRDAI). By
                    accessing our website (
                    <Link href="/" className="text-blue-700 hover:underline font-medium">
                      bimaheadquarter.com
                    </Link>
                    ), utilizing our digital consultation tools, or engaging our consultants for insurance advisory,
                    policy renewal management, or claims facilitation, you acknowledge that you have read, understood,
                    and agree to be bound by these Terms.
                  </p>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                    <strong className="text-[#031638] block mb-1">Corporate Headquarters:</strong>
                    {BUSINESS_DETAILS.fullAddress}. All operations are conducted in strict compliance with the Insurance
                    Act 1938, the IRDAI Act 1999, and applicable Indian commercial jurisprudence.
                  </div>
                </div>
              </article>

              {/* Section 2: Scope of Advisory Services */}
              <article id="advisory-services" className="terms-card p-6 sm:p-8 terms-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Scope of Advisory Services
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    Bima Headquarter provides professional insurance consulting, risk analysis, portfolio audits,
                    and claim advocacy. Our role is strictly that of an intermediary and advisory consultant:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2 font-bold text-[#031638] text-sm mb-2">
                        <span className="material-symbols-outlined text-blue-600 text-base">policy</span>
                        Portfolio & Coverage Audit
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Examining existing policies, identifying coverage gaps, under-insurance risks, inadequate
                        deductibles, and suboptimal No Claim Bonus (NCB) tiers.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2 font-bold text-[#031638] text-sm mb-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">compare</span>
                        Comparative Market Quotations
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Sourcing competitive proposal terms and premium quotes across leading IRDAI-licensed general,
                        health, commercial, and life insurance companies.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2 font-bold text-[#031638] text-sm mb-2">
                        <span className="material-symbols-outlined text-purple-600 text-base">notifications_active</span>
                        Renewal Continuity Tracking
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Proactive renewal monitoring to prevent policy lapse, enforcement penalties under the Motor
                        Vehicles Act, and loss of continuity credits in health insurance.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2 font-bold text-[#031638] text-sm mb-2">
                        <span className="material-symbols-outlined text-amber-600 text-base">gavel</span>
                        Claims Facilitation & Advocacy
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Assisting clients with documentation assembly, surveyor coordination, deficiency rectification,
                        and formal dispute escalation before insurer grievance cells.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 3: Client Obligations & Good Faith */}
              <article id="utmost-good-faith" className="terms-card p-6 sm:p-8 terms-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Client Obligations & Principle of Utmost Good Faith
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    Under Indian insurance jurisprudence, all contracts of insurance are governed by the fundamental
                    doctrine of <strong>Uberrimae Fidei</strong> (Utmost Good Faith). By engaging our advisory desk,
                    you affirm the following covenants:
                  </p>
                  <ul className="space-y-3 list-none pl-0">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-600 text-base mt-1">check_circle</span>
                      <span>
                        <strong>Duty of Complete & True Disclosure:</strong> You must disclose all material facts known
                        to you, including pre-existing medical ailments, previous hospitalizations, past insurance claims,
                        vehicle modifications, previous policy cancellations, or hazardous business operations.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-600 text-base mt-1">check_circle</span>
                      <span>
                        <strong>Consequence of Non-Disclosure:</strong> Failure to disclose or misrepresenting material
                        facts entitles the insurance company to void the contract <em>ab initio</em>, repudiate claims,
                        and forfeit all premiums paid under Section 45 of the Insurance Act 1938.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-600 text-base mt-1">check_circle</span>
                      <span>
                        <strong>Document Authenticity:</strong> All registration certificates, invoices, driving licenses,
                        PAN cards, and diagnostic reports submitted to Bima Headquarter must be genuine, unaltered, and
                        legally valid.
                      </span>
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 4: Insurer Underwriting Terms */}
              <article id="insurer-underwriting" className="terms-card p-6 sm:p-8 terms-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Independent Insurer Underwriting & Solicitations
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    <strong>Insurance is the subject matter of solicitation.</strong> Bima Headquarter operates as a
                    licensed intermediary consultant and does not act as an insurance risk underwriter:
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <strong className="text-[#031638] block mb-1">Underwriting Prerogative:</strong>
                      Final risk acceptance, premium quotation, policy issuance, exclusions, copayments, loading, and
                      warranties remain exclusively at the sole discretion of the respective insurance company.
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <strong className="text-[#031638] block mb-1">Non-Binding Quotations:</strong>
                      Any premium indicative figures, comparative tables, or coverage summaries displayed on our
                      platform or shared by consultants represent preliminary estimates based on client-provided data.
                      They do not constitute a binding insurance binder until verified and confirmed by the insurer.
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <strong className="text-[#031638] block mb-1">Policy Schedule Primacy:</strong>
                      Upon policy issuance, the formal policy document, schedule of insurance, policy wordings, and
                      statutory endorsements issued by the insurance company constitute the sole legal contract governing
                      your coverage.
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 5: Claims Assistance Terms */}
              <article id="claims-assistance" className="terms-card p-6 sm:p-8 terms-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    05
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Claims Assistance & No-Settlement-Guarantee Terms
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    Bima Headquarter provides dedicated, professional claims assistance to represent the interests of
                    policyholders. However, the legal conditions governing claim processing must be clearly understood:
                  </p>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-900 leading-relaxed">
                    <strong>No Claim Settlement Guarantee:</strong> Claims assistance does not guarantee claim admission,
                    cashless approval, or settlement amounts. The decision to admit, query, settle, discount, or reject
                    any insurance claim rests strictly and exclusively with the underwriting insurance company and its
                    designated Third-Party Administrators (TPAs) under applicable policy wordings.
                  </div>
                  <p>
                    Our scope of claims assistance is strictly advisory and procedural:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-sm text-slate-600">
                    <li>Intimating the claim to the insurer within statutory deadlines.</li>
                    <li>Guiding clients on document assembly (FIRs, hospital records, repair estimates, discharge summaries).</li>
                    <li>Coordinating with independent IRDAI-licensed surveyors for timely inspection.</li>
                    <li>Formulating technical representations against wrongful deductions or unjustified claim rejections.</li>
                    <li>Assisting in escalation to the Insurer Grievance Officer and the statutory Insurance Ombudsman.</li>
                  </ul>
                </div>
              </article>

              {/* Section 6: Direct Premium Remittance */}
              <article id="premium-payments" className="terms-card p-6 sm:p-8 terms-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    06
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Premium Payments & Direct Insurer Remittance
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    In accordance with <strong>Section 64VB of the Insurance Act 1938</strong> (&ldquo;No risk to be
                    assumed unless premium is received in advance&rdquo;) and IRDAI regulations:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5">verified_user</span>
                      <div>
                        <strong>Direct Insurer Remittance:</strong> All insurance premiums must be remitted directly to the
                        respective insurance company via official payment gateways, direct net-banking links, or
                        crossed account payee cheques drawn in favor of the insurer.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5">verified_user</span>
                      <div>
                        <strong>No Personal Account Cash Collection:</strong> Bima Headquarter and its consultants never
                        accept cash or request transfers into personal bank accounts for insurance premiums. We disclaim
                        all liability for unauthorized cash payments made to any individual.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5">verified_user</span>
                      <div>
                        <strong>Risk Commencement:</strong> Insurance coverage commences only upon successful realization
                        of the premium by the insurance company and issuance of the official policy schedule.
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Section 7: Section 41 Rebate Prohibition */}
              <article id="rebate-prohibition" className="terms-card p-6 sm:p-8 terms-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    07
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Statutory Notice: Prohibition of Rebates (Section 41)
                  </h2>
                </div>

                {/* Statutory Callout Box */}
                <div className="statutory-callout p-5 sm:p-6 mb-6">
                  <div className="flex items-center gap-3 text-amber-900 font-bold text-base mb-2">
                    <span className="material-symbols-outlined text-2xl text-amber-700">gavel</span>
                    <span>Section 41 of the Insurance Act, 1938 (Prohibition of Rebates)</span>
                  </div>
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <p>
                      <strong>(1)</strong> No person shall allow or offer to allow, either directly or indirectly, as an
                      inducement to any person to take out or renew or continue an insurance in respect of any kind of
                      risk relating to lives or property in India, any rebate of the whole or part of the commission payable
                      or any rebate of the premium shown on the policy, nor shall any person taking out or renewing or
                      continuing a policy accept any rebate, except such rebate as may be allowed in accordance with the
                      published prospectuses or tables of the insurer.
                    </p>
                    <p>
                      <strong>(2)</strong> Any person making default in complying with the provisions of this section shall
                      be liable for a penalty which may extend to <strong>ten lakh rupees (₹10,00,000)</strong>.
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Bima Headquarter operates with zero compromise on regulatory ethics. We do not offer or accept illegal
                  cashbacks, rebates, or unauthorized inducements under any circumstances.
                </p>
              </article>

              {/* Section 8: Liability & Disclaimers */}
              <article id="liability-limitation" className="terms-card p-6 sm:p-8 terms-section-target">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    08
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Limitation of Liability & Disclaimers
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    To the maximum extent permitted under applicable Indian laws:
                  </p>
                  <ul className="space-y-2 list-disc list-inside text-sm text-slate-600">
                    <li>
                      <strong>Insurer Insolvency or Delays:</strong> Bima Headquarter is not liable for financial defaults,
                      insolvency, regulatory freezes, or operational delays of any insurance company.
                    </li>
                    <li>
                      <strong>Indirect Damages:</strong> Under no circumstances will Bima Headquarter or its directors,
                      employees, or affiliates be liable for any indirect, punitive, special, incidental, or consequential
                      damages arising from policy repudiation, business interruption, or loss of profits.
                    </li>
                    <li>
                      <strong>Intellectual Property:</strong> All text, algorithms, policy comparison structures, brand
                      logos, graphics, and interface designs on this website are the proprietary property of InsureDesk
                      IMF Pvt. Ltd. and protected under Indian copyright and trademark statutes.
                    </li>
                  </ul>
                </div>
              </article>

              {/* Section 9: Grievance & Jurisdiction */}
              <article id="grievance-jurisdiction" className="terms-card p-6 sm:p-8 terms-section-target border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    09
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#031638] font-display">
                    Grievance Redressal, Governing Law & Jurisdiction
                  </h2>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    These Terms shall be governed by and construed in accordance with the substantive laws of the
                    Republic of India. For any questions, service grievances, or regulatory inquiries:
                  </p>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white mt-4 shadow-xs">
                    <table className="min-w-full text-left text-xs sm:text-sm">
                      <tbody className="divide-y divide-slate-100">
                        <tr className="bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-500 w-1/3">Compliance Officer</td>
                          <td className="px-4 py-3 font-bold text-[#031638]">Anand Soni (Founder Director)</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-500">Corporate Entity</td>
                          <td className="px-4 py-3 text-slate-800">{BUSINESS_DETAILS.legalName}</td>
                        </tr>
                        <tr className="bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-500">Official Email</td>
                          <td className="px-4 py-3">
                            <a
                              href={`mailto:${BUSINESS_DETAILS.email}`}
                              className="text-blue-700 font-medium hover:underline"
                            >
                              {BUSINESS_DETAILS.email}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-500">Compliance Helpline</td>
                          <td className="px-4 py-3">
                            <a
                              href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                              className="text-blue-700 font-medium hover:underline"
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
                          <td className="px-4 py-3 font-semibold text-slate-500">Legal Jurisdiction</td>
                          <td className="px-4 py-3 text-slate-800 font-medium">
                            Courts of competent jurisdiction in Bhopal, Madhya Pradesh, India.
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Transparent Advisory Charter</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white mb-4">
              Have Questions About Our Engagement Terms?
            </h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
              Our compliance and corporate risk team is readily available to answer any questions about our intermediary
              charter, policy auditing standards, or IRDAI regulatory procedures.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
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
