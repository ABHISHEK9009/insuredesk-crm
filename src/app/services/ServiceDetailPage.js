import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import PublicHeader from "@/app/components/public/PublicHeader";
import LandingEffects from "@/app/components/LandingEffects";
import PublicFooter from "@/app/components/public/PublicFooter";
import { BUSINESS_DETAILS, SITE_NAME } from "@/lib/seo/site";
import { entityFaqs, getRelatedServices, getServicePageSchema } from "./servicePageData";

export default function ServiceDetailPage({ service }) {
  if (!service) return null;

  const pageSchema = getServicePageSchema(service);
  const relatedServices = getRelatedServices(service);
  const arch = service.architecture;

  return (
    <>
      <LandingEffects />
      <Script
        id={`${service.slug}-schema`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <div className="landing-shell service-detail-shell bg-background text-on-background font-body-md overflow-x-hidden min-h-screen">
        <PublicHeader />

        {/* =========================================================================
            1. Hero Section
            ========================================================================= */}
        {/* =========================================================================
            1. Hero Section (Executive Redesign)
            ========================================================================= */}
        <header
          className="service-detail-hero"
          style={{ "--service-hero-bg": `url("${service.heroImage}")` }}
        >
          <div className="service-detail-hero-inner service-detail-container">
            <div className="service-detail-hero-copy reveal">
              {/* Breadcrumb Navigation */}
              <nav className="service-detail-breadcrumb" aria-label="Breadcrumb">
                <Link href="/" className="service-breadcrumb-link">
                  <span className="material-symbols-outlined breadcrumb-home-icon">home</span>
                  <span>Home</span>
                </Link>
                <span className="material-symbols-outlined service-breadcrumb-sep">chevron_right</span>
                <Link href="/services" className="service-breadcrumb-link">Services</Link>
                <span className="material-symbols-outlined service-breadcrumb-sep">chevron_right</span>
                <span className="service-breadcrumb-current">{service.title}</span>
              </nav>

              {/* Category Pill & Status Badge Group */}
              <div className="service-hero-badge-group">
                <span className="service-hero-category-badge">
                  <span className="material-symbols-outlined category-icon">{service.icon}</span>
                  <span>{service.eyebrow}</span>
                </span>
                <span className="service-hero-status-tag">
                  <span className="service-status-pulse" />
                  <span>Licensed IRDAI Advisory</span>
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="service-hero-title">{service.title}</h1>

              <p className="service-detail-lead">{service.description}</p>

              {/* Unified Trust Bar */}
              <div className="service-hero-trust-bar">
                <div className="service-trust-bar-item">
                  <span className="material-symbols-outlined">verified</span>
                  <span>IRDAI Registered IMF</span>
                </div>
                <div className="service-trust-bar-item">
                  <span className="material-symbols-outlined">balance</span>
                  <span>25+ Insurers Compared</span>
                </div>
                <div className="service-trust-bar-item">
                  <span className="material-symbols-outlined">support_agent</span>
                  <span>Dedicated Claims Desk</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="service-hero-action-suite">
                <Link href="/contact" className="service-hero-btn-primary">
                  <span>Get Free Consultation</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>

                <a href={`tel:${BUSINESS_DETAILS.phoneHref}`} className="service-hero-btn-secondary">
                  <span className="material-symbols-outlined">phone_in_talk</span>
                  <span>Call {BUSINESS_DETAILS.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================================
            2. Structured Content Layout (Balanced Aligned Rows)
            ========================================================================= */}
        <main className="service-detail-main">
          {/* Row 1: Policy Overview + Advisor Connect Card */}
          <section className="service-detail-row service-row-overview service-detail-container reveal">
            <div className="service-overview-card">
              <div className="service-section-header">
                <span className="service-detail-section-kicker">POLICY OVERVIEW</span>
                <h2>Built for real-world insurance decisions</h2>
              </div>

              <div className="service-overview-highlight-banner">
                <div className="service-overview-highlight-icon">
                  <span className="material-symbols-outlined">policy</span>
                </div>
                <div className="service-overview-highlight-body">
                  <strong>Tailored Policy Architecture</strong>
                  <p>
                    {SITE_NAME} evaluates wording, deductible clauses, sub-limits, and exclusions across 25+ insurers to ensure you receive genuine risk protection rather than superficial paper compliance.
                  </p>
                </div>
              </div>

              <div className="service-detail-prose">
                <p>
                  {SITE_NAME} provides {service.title.toLowerCase()} consultancy for clients across India.{" "}
                  {BUSINESS_DETAILS.entityStatement}
                </p>
                {service.overview.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>

              {/* AEO Quick Facts Matrix */}
              {arch?.quickFacts && (
                <div className="service-quickfacts-grid">
                  <div className="service-quickfact-item">
                    <span className="service-quickfact-label">Regulatory Framework</span>
                    <strong className="service-quickfact-val">{arch.quickFacts.regulatory}</strong>
                  </div>
                  <div className="service-quickfact-item">
                    <span className="service-quickfact-label">Sum Insured Basis</span>
                    <strong className="service-quickfact-val">{arch.quickFacts.valuationBasis}</strong>
                  </div>
                  <div className="service-quickfact-item">
                    <span className="service-quickfact-label">Policy Structure</span>
                    <strong className="service-quickfact-val">{arch.quickFacts.policyStructure}</strong>
                  </div>
                  <div className="service-quickfact-item">
                    <span className="service-quickfact-label">Advisory Operations</span>
                    <strong className="service-quickfact-val">{arch.quickFacts.advisoryScope}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Advisor Connect Card (Aligned alongside Overview) */}
            <div className="service-advisor-card">
              <div className="service-advisor-top-brand">
                <Image
                  src="/brand/main-logo-wide.webp"
                  alt="Bima Headquarter Logo"
                  width={160}
                  height={38}
                  className="service-advisor-logo"
                  unoptimized
                />
                <div className="service-advisor-status-pill">
                  <span className="service-status-pulse" />
                  <span>Desk Active</span>
                </div>
              </div>

              <div className="service-advisor-body">
                <h3>Speak to a Licensed Advisor</h3>
                <p className="service-advisor-lead">
                  Direct policy guidance, comparative quotes across 25+ insurers, and claims advocacy from licensed specialists.
                </p>

                <div className="service-advisor-perks-list">
                  <div className="service-advisor-perk-item">
                    <span className="material-symbols-outlined perk-check">verified</span>
                    <span>IRDAI Registered IMF Advisory</span>
                  </div>
                  <div className="service-advisor-perk-item">
                    <span className="material-symbols-outlined perk-check">balance</span>
                    <span>100% Unbiased Market Comparison</span>
                  </div>
                  <div className="service-advisor-perk-item">
                    <span className="material-symbols-outlined perk-check">support_agent</span>
                    <span>Dedicated Claims Assistance Desk</span>
                  </div>
                  <div className="service-advisor-perk-item">
                    <span className="material-symbols-outlined perk-check">timer</span>
                    <span>Fast Response (Avg. Under 15 Mins)</span>
                  </div>
                </div>
              </div>

              <div className="service-advisor-bottom">
                <div className="service-advisor-actions">
                  <a href={`tel:${BUSINESS_DETAILS.phoneHref}`} className="service-advisor-btn-call">
                    <span className="material-symbols-outlined">call</span>
                    <span>Call {BUSINESS_DETAILS.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${BUSINESS_DETAILS.phone.replace(/[^0-9]/g, "")}?text=Hi%20Bima%20Headquarter,%20I%20need%20assistance%20with%20${encodeURIComponent(service.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="service-advisor-btn-whatsapp"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    <span>Chat on WhatsApp</span>
                  </a>
                  <Link href="/contact" className="service-advisor-btn-callback">
                    <span>Request Free Callback</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>

                <div className="service-advisor-guarantee">
                  <span className="material-symbols-outlined">verified</span>
                  <span>100% Free Consultation • Pan-India Support</span>
                </div>
              </div>
            </div>
          </section>

          {/* Row 2: Comprehensive Coverage Architecture & Perils (SEO Focus) */}
          {arch?.coverageDimensions && (
            <section className="service-detail-row service-row-coverage service-detail-container reveal">
              <div className="service-full-section-card">
                <div className="service-section-header">
                  <span className="service-detail-section-kicker">COVERAGE SCOPE & PERILS</span>
                  <h2>Comprehensive Risk Protection & Policy Dimensions</h2>
                </div>
                <div className="service-coverage-grid">
                  {arch.coverageDimensions.map((dim, dIdx) => (
                    <div key={dIdx} className="service-coverage-card">
                      <div className="service-coverage-icon-wrap">
                        <span className="material-symbols-outlined">{dim.icon}</span>
                      </div>
                      <div className="service-coverage-content">
                        <h3>{dim.title}</h3>
                        <p>{dim.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Row 3: Inclusions vs Exclusions Comparison Matrix (SEO & AEO) */}
          {(arch?.inclusions || arch?.exclusions) && (
            <section className="service-detail-row service-row-matrix service-detail-container reveal">
              <div className="service-full-section-card">
                <div className="service-section-header">
                  <span className="service-detail-section-kicker">CLAUSE SPECIFICATIONS</span>
                  <h2>Standard Covered Inclusions vs Policy Exclusions</h2>
                </div>
                <div className="service-matrix-grid">
                  <div className="service-matrix-col service-inclusions-col">
                    <div className="service-matrix-header">
                      <span className="material-symbols-outlined service-matrix-col-icon check">check_circle</span>
                      <div>
                        <h3>Standard Covered Inclusions</h3>
                        <p>Core perils and protections under standard policy terms</p>
                      </div>
                    </div>
                    <ul className="service-matrix-list">
                      {arch.inclusions.map((inc, iIdx) => (
                        <li key={iIdx}>
                          <span className="material-symbols-outlined matrix-item-icon check">check</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="service-matrix-col service-exclusions-col">
                    <div className="service-matrix-header">
                      <span className="material-symbols-outlined service-matrix-col-icon block">remove_moderator</span>
                      <div>
                        <h3>Critical Exclusions & Policy Warranties</h3>
                        <p>Standard exclusions to be aware of to prevent claim rejection</p>
                      </div>
                    </div>
                    <ul className="service-matrix-list">
                      {arch.exclusions.map((exc, eIdx) => (
                        <li key={eIdx}>
                          <span className="material-symbols-outlined matrix-item-icon block">close</span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Row 4: Pan-India Geographic Footprint & Industrial Corridors (GEO Focus) */}
          {arch?.geoScope && (
            <section className="service-detail-row service-row-geo service-detail-container reveal">
              <div className="service-full-section-card">
                <div className="service-section-header">
                  <span className="service-detail-section-kicker">GEOGRAPHIC & REGIONAL FOOTPRINT</span>
                  <h2>Pan-India Commercial Jurisdiction & Regional Advisory</h2>
                </div>
                <div className="service-geo-grid">
                  <div className="service-geo-card">
                    <div className="service-geo-icon-wrap">
                      <span className="material-symbols-outlined">corporate_fare</span>
                    </div>
                    <h3>Central Operations & IMF Desk</h3>
                    <p>{arch.geoScope.hub}</p>
                    <span className="service-geo-badge">Regulated IMF Hub</span>
                  </div>

                  <div className="service-geo-card">
                    <div className="service-geo-icon-wrap">
                      <span className="material-symbols-outlined">precision_manufacturing</span>
                    </div>
                    <h3>Manufacturing & Industrial Belts</h3>
                    <p>{arch.geoScope.corridors}</p>
                    <span className="service-geo-badge">Industrial Clusters</span>
                  </div>

                  <div className="service-geo-card">
                    <div className="service-geo-icon-wrap">
                      <span className="material-symbols-outlined">alt_route</span>
                    </div>
                    <h3>Freight Corridors & Logistics Gateways</h3>
                    <p>{arch.geoScope.logistics}</p>
                    <span className="service-geo-badge">Multimodal Transit</span>
                  </div>

                  <div className="service-geo-card">
                    <div className="service-geo-icon-wrap">
                      <span className="material-symbols-outlined">assignment_turned_in</span>
                    </div>
                    <h3>Nationwide Surveyor Network</h3>
                    <p>{arch.geoScope.surveyors}</p>
                    <span className="service-geo-badge">28 States & UTs</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Row 5: Claims Settlement & Surveyor Protocol (AEO Step-by-Step) */}
          {arch?.claimsProtocol && (
            <section className="service-detail-row service-row-protocol service-detail-container reveal">
              <div className="service-full-section-card">
                <div className="service-section-header">
                  <span className="service-detail-section-kicker">CLAIMS ROADMAP & SURVEYOR PROTOCOL</span>
                  <h2>Step-by-step claims intimation and settlement procedure</h2>
                </div>
                <div className="service-protocol-steps-grid">
                  {arch.claimsProtocol.map((proto, pIdx) => (
                    <div key={pIdx} className="service-protocol-step-card">
                      <div className="service-protocol-step-header">
                        <span className="service-protocol-step-num">{proto.step}</span>
                        <span className="service-protocol-step-badge">Step</span>
                      </div>
                      <h3>{proto.title}</h3>
                      <p>{proto.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Row 4: FAQs + Related Services & Trust */}
          <section className="service-detail-row service-row-faqs service-detail-container reveal">
            <div className="service-faqs-card">
              <div className="service-section-header">
                <span className="service-detail-section-kicker">CLARITY & TRANSPARENCY</span>
                <h2>Frequently asked questions</h2>
              </div>
              <div className="service-detail-faqs">
                {[...service.faqs, ...entityFaqs].map(([question, answer], fIdx) => (
                  <details key={fIdx} className="service-faq-item">
                    <summary className="service-faq-summary">
                      <span className="service-faq-question">{question}</span>
                      <span className="material-symbols-outlined service-faq-chevron">add</span>
                    </summary>
                    <div className="service-faq-answer">
                      {typeof answer === "string" ? (
                        answer.split("\n\n").map((block, bIdx) => {
                          const trimmed = block.trim();
                          if (trimmed.startsWith("• ") || trimmed.includes("\n• ")) {
                            const bulletItems = trimmed
                              .split("\n")
                              .map((line) => line.replace(/^•\s*/, "").trim())
                              .filter(Boolean);
                            return (
                              <ul key={bIdx} className="service-faq-list">
                                {bulletItems.map((item, iIdx) => (
                                  <li key={iIdx}>{item}</li>
                                ))}
                              </ul>
                            );
                          }
                          return <p key={bIdx}>{trimmed}</p>;
                        })
                      ) : (
                        <p>{answer}</p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Related Services & Trust Stack */}
            <div className="service-side-stack">
              {/* Related Services */}
              <div className="service-related-card">
                <div className="service-related-header">
                  <span className="material-symbols-outlined">grid_view</span>
                  <h3>Related Services</h3>
                </div>
                <ul className="service-related-list">
                  {relatedServices.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/services/${item.slug}`} className="service-related-link">
                        <span className="service-related-icon-wrap">
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </span>
                        <span className="service-related-name">{item.title}</span>
                        <span className="material-symbols-outlined service-related-arrow">arrow_forward</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust / IRDAI Card */}
              <div className="service-trust-card">
                <div className="service-trust-shield">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <strong className="service-trust-brand">{SITE_NAME}</strong>
                <p className="service-trust-desc">{BUSINESS_DETAILS.entityStatement}</p>
                <div className="service-trust-badge">
                  <span>IRDAI Registered Insurance Marketing Firm</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* =========================================================================
            3. Bottom Executive CTA Banner
            ========================================================================= */}
        <section className="service-detail-bottom-cta">
          <div className="service-detail-container">
            <div className="service-bottom-cta-inner">
              <div className="service-bottom-cta-kicker">
                <span className="material-symbols-outlined">verified_user</span>
                <span>{service.eyebrow} ADVISORY</span>
              </div>
              <h2>{service.ctaTitle}</h2>
              <p>{service.ctaText}</p>
              <div className="service-bottom-cta-actions">
                <Link href="/contact" className="service-bottom-btn-primary">
                  <span>Start Free Consultation</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a href={`tel:${BUSINESS_DETAILS.phoneHref}`} className="service-bottom-btn-secondary">
                  <span className="material-symbols-outlined">phone_in_talk</span>
                  <span>Call Our Advisory Desk</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}
