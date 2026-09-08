"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Script from "next/script";
import PublicHeader from "@/app/components/public/PublicHeader";
import LandingEffects from "@/app/components/LandingEffects";
import PublicFooter from "@/app/components/public/PublicFooter";
import { BUSINESS_DETAILS, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { FAQ_CATEGORIES } from "@/content/faqData";

/* ── Uniform Executive SVG Icons ── */
function CategoryIcon({ type, className = "w-5 h-5" }) {
  switch (type) {
    case "handshake":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 17a1 1 0 0 0 1.41 0l4.59-4.59a2 2 0 0 0 0-2.82L13.41 6a2 2 0 0 0-2.82 0L6 10.59a2 2 0 0 0 0 2.82L10 17z" />
          <path d="m18 11 3-3a2 2 0 0 0 0-2.82L18.41 2.6a2 2 0 0 0-2.82 0L13 5" />
          <path d="m2 14 3 3a2 2 0 0 0 2.82 0L10 15" />
          <path d="m14 14 2.5 2.5a1.5 1.5 0 0 0 2.12 0l2.5-2.5" />
        </svg>
      );
    case "health_and_safety":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
    case "directions_car":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case "domain":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
          <path d="M12 10h.01" />
          <path d="M12 14h.01" />
          <path d="M16 10h.01" />
          <path d="M16 14h.01" />
          <path d="M8 10h.01" />
          <path d="M8 14h.01" />
          <path d="M10 22v-4h4v4" />
        </svg>
      );
    case "gavel":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m14 13-7.5 7.5c-.8.8-2 .8-2.8 0s-.8-2 0-2.8L11.2 10.2" />
          <path d="m16 16 6-6" />
          <path d="m8 8 6-6" />
          <path d="m9 7 8 8" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
  }
}

/* ── Smooth height accordion panel ─────────────────────── */
function AccordionPanel({ isOpen, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) setHeight(ref.current.scrollHeight);
  }, [isOpen, children]);

  return (
    <div
      style={{
        maxHeight: isOpen ? height + 32 : 0,
        opacity: isOpen ? 1 : 0,
        transition: "max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease",
        overflow: "hidden",
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

export default function FAQCategoryPage() {
  const params = useParams();
  const categorySlug = params?.category;
  const currentCategory = useMemo(() => {
    return FAQ_CATEGORIES.find((c) => c.id === categorySlug);
  }, [categorySlug]);

  const [filterQuery, setFilterQuery] = useState("");
  const [expandedFaqMap, setExpandedFaqMap] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);

  const categoryFaqs = useMemo(() => {
    if (!currentCategory) return [];
    return currentCategory.faqs.map((f, i) => ({
      ...f,
      id: `${currentCategory.id}-${i + 1}`,
      number: i + 1,
    }));
  }, [currentCategory]);

  const filteredFaqs = useMemo(() => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return categoryFaqs;
    return categoryFaqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [categoryFaqs, filterQuery]);

  const toggleFaq = (id) => {
    setExpandedFaqMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleExpandAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const newMap = {};
    if (nextState) {
      filteredFaqs.forEach((f) => {
        newMap[f.id] = true;
      });
    }
    setExpandedFaqMap(newMap);
  };

  const highlightMatch = (text, query) => {
    if (!query?.trim()) return text;
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase().trim() ? (
        <mark key={index} className="bg-emerald-100 text-emerald-950 font-semibold px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const structuredData = useMemo(() => {
    if (!currentCategory) return null;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${SITE_URL}/faq/${categorySlug}#webpage`,
          url: `${SITE_URL}/faq/${categorySlug}`,
          name: `${currentCategory.title} FAQ | ${SITE_NAME}`,
          headline: `${currentCategory.title} Questions & Guidelines`,
          description: currentCategory.description,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          inLanguage: "en-IN",
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${SITE_URL}/faq/${categorySlug}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
            { "@type": "ListItem", position: 3, name: currentCategory.shortTitle, item: `${SITE_URL}/faq/${categorySlug}` },
          ],
        },
        {
          "@type": "FAQPage",
          "@id": `${SITE_URL}/faq/${categorySlug}#faqpage`,
          mainEntity: currentCategory.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        },
      ],
    };
  }, [currentCategory, categorySlug]);

  /* ── 404 Guard ────────────────────────────────────────── */
  if (!currentCategory) {
    return (
      <div className="landing-shell min-h-screen bg-[#fafbfc] text-[#0b1c30]">
        <LandingEffects />
        <PublicHeader />
        <main className="max-w-md mx-auto py-28 px-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#031638] mb-2">Category Not Found</h1>
          <p className="text-sm text-slate-500 mb-6">
            The FAQ category you requested does not exist or may have been moved.
          </p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#031638] text-white text-xs font-semibold"
          >
            <span>Return to All FAQs</span>
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="landing-shell min-h-screen bg-[#fafbfc] text-[#0b1c30]">
      <LandingEffects />
      {structuredData && (
        <Script
          id="faq-category-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <PublicHeader />

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .faq-cat-page-container {
            font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
          }

          /* Category Hero Gradient */
          .cat-hero-gradient {
            background: linear-gradient(180deg, #edf4fc 0%, #fafbfc 100%);
            border-bottom: 1px solid rgba(8, 27, 55, 0.06);
          }

          /* Accordion item card */
          .cat-accordion-item {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            box-shadow: 0 2px 8px -2px rgba(3, 22, 56, 0.03);
            margin-bottom: 12px;
            overflow: hidden;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .cat-accordion-item:hover {
            border-color: #cbd5e1;
            box-shadow: 0 6px 20px -4px rgba(3, 22, 56, 0.06);
          }
          .cat-accordion-item.is-expanded {
            border-color: #0e6245;
            box-shadow: 0 8px 24px -4px rgba(14, 98, 69, 0.08);
          }
        `,
        }}
      />

      <main className="faq-cat-page-container w-full">
        {/* =========================================================================
            1. CATEGORY HERO: Breadcrumb, Badge, Title & Key Highlights
            ========================================================================= */}
        <section className="cat-hero-gradient pt-12 pb-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1360px] mx-auto">
            {/* Breadcrumb Bar */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#031638] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/faq" className="hover:text-[#031638] transition-colors">
                FAQ Hub
              </Link>
              <span>/</span>
              <span className="text-[#031638]">{currentCategory.shortTitle}</span>
            </nav>

            {/* Header Flex: Large Icon + Titles */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-[#031638] border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                <CategoryIcon type={currentCategory.icon} className="w-7 h-7" />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {currentCategory.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {categoryFaqs.length} {categoryFaqs.length === 1 ? "Question" : "Questions"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#031638] tracking-tight">
                  {currentCategory.title}
                </h1>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mb-6">
              {currentCategory.description}
            </p>

            {/* Key Topics & Highlights Covered */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <svg className="w-3.5 h-3.5 text-[#0e6245]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Core Topics &amp; Regulatory Guidelines in this Section</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentCategory.majorHighlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <svg className="w-4 h-4 text-[#0e6245] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. CONTROLS BAR: In-Category Search Filter & Expand All Toggle
            ========================================================================= */}
        <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search within this category */}
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 gap-2.5 shadow-2xs focus-within:border-[#0e6245]">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder={`Search within ${currentCategory.shortTitle}...`}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-[#031638] placeholder-slate-400 outline-none font-medium"
              />
              {filterQuery && (
                <button
                  type="button"
                  onClick={() => setFilterQuery("")}
                  className="p-0.5 text-slate-400 hover:text-slate-700"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Expand / Collapse All Toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
              <span className="text-xs font-semibold text-slate-500">
                {filteredFaqs.length} of {categoryFaqs.length} questions
              </span>
              <button
                type="button"
                onClick={handleToggleExpandAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="7 13 12 18 17 13" />
                  <polyline points="7 6 12 11 17 6" />
                </svg>
                <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. ACCORDION QUESTIONS LIST (Clean & Professional)
            ========================================================================= */}
        <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = allExpanded || !!expandedFaqMap[faq.id];

                return (
                  <article
                    key={faq.id}
                    className={`cat-accordion-item ${isOpen ? "is-expanded" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-5 sm:p-6 flex items-start justify-between gap-4 text-left cursor-pointer select-none"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-start gap-3.5 flex-1 pr-2">
                        <span className="text-xs font-extrabold text-slate-400 bg-slate-100 rounded-md px-2 py-1 flex-shrink-0 mt-0.5">
                          {String(faq.number).padStart(2, "0")}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-[#031638] leading-snug">
                          {highlightMatch(faq.question, filterQuery)}
                        </h3>
                      </div>

                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 mt-0.5 ${
                          isOpen
                            ? "bg-[#0e6245] text-white rotate-180"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </button>

                    <AccordionPanel isOpen={isOpen}>
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100">
                        <p className="pt-2 pl-9">{highlightMatch(faq.answer, filterQuery)}</p>

                        <div className="mt-5 pt-3 pl-9 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#0e6245]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Verified under IRDAI Insurance Intermediary Standards</span>
                          </span>
                          <Link
                            href="/#cta-banner"
                            className="font-bold text-[#0e6245] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Request Policy Audit</span>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </AccordionPanel>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-14 bg-white rounded-xl border border-slate-200">
              <p className="text-sm font-bold text-[#031638] mb-1">No matching questions found</p>
              <p className="text-xs text-slate-500 mb-4">
                No questions matching &ldquo;{filterQuery}&rdquo; in this category.
              </p>
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                className="px-4 py-2 rounded-xl bg-[#031638] text-white text-xs font-semibold"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </section>

        {/* =========================================================================
            4. CROSS-CATEGORY NAVIGATOR: Jump to Other FAQ Groups
            ========================================================================= */}
        <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-200 mt-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Explore Other Insurance Categories:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FAQ_CATEGORIES.filter((c) => c.id !== categorySlug).map((other) => (
              <Link
                key={other.id}
                href={`/faq/${other.id}`}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition-all flex items-center gap-3 text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#031638] border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon type={other.icon} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#031638] truncate">{other.shortTitle}</div>
                  <div className="text-[11px] text-slate-500">{other.faqs.length} Questions</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================================
            5. BOTTOM CALLOUT BANNER: Direct Support
            ========================================================================= */}
        <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#031638] text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Need Specific Guidance on {currentCategory.shortTitle}?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl">
                Our certified advisors evaluate policy wordings, exclusions, deductibles, and claim disputes at zero cost.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
              <a
                href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0e6245] hover:bg-[#094833] text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Call {BUSINESS_DETAILS.phone}</span>
              </a>
              <Link
                href="/#cta-banner"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all"
              >
                <span>Free Audit</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
