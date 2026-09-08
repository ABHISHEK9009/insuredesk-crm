"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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

const quickSearchSuggestions = [
  "Policy Review",
  "Claim Rejection",
  "Cashless Hospitalization",
  "Warehouse Insurance",
  "Fleet Insurance",
  "No Claim Bonus",
  "Ombudsman Process",
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedFaqMap, setExpandedFaqMap] = useState({});

  // Flatten all FAQs with category link
  const allFaqsList = useMemo(() => {
    return FAQ_CATEGORIES.flatMap((cat) =>
      cat.faqs.map((f, i) => ({
        ...f,
        id: `${cat.id}-${i}`,
        categoryId: cat.id,
        categoryTitle: cat.shortTitle,
      }))
    );
  }, []);

  // Filtered FAQs for search or accordion tab
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allFaqsList.filter((faq) => {
      const matchesTab = activeTab === "all" || faq.categoryId === activeTab;
      const matchesQuery =
        q === "" ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.categoryTitle.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [allFaqsList, activeTab, searchQuery]);

  const toggleFaq = (id) => {
    setExpandedFaqMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${SITE_URL}/faq#webpage`,
          url: `${SITE_URL}/faq`,
          name: `Frequently Asked Questions | ${SITE_NAME}`,
          headline: "Frequently Asked Questions about Insurance & Risk Advisory",
          description:
            "Find authoritative answers to common insurance questions regarding claims support, renewals, commercial risks, and policy auditing in India.",
          isPartOf: { "@id": `${SITE_URL}/#website` },
          inLanguage: "en-IN",
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${SITE_URL}/faq#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
          ],
        },
        {
          "@type": "FAQPage",
          "@id": `${SITE_URL}/faq#faqpage`,
          mainEntity: allFaqsList.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
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
          areaServed: BUSINESS_DETAILS.serviceArea,
        },
      ],
    };
  }, [allFaqsList]);

  return (
    <div className="landing-shell min-h-screen bg-[#fafbfc] text-[#0b1c30]">
      <LandingEffects />
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PublicHeader />

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .faq-root-scope {
            font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
          }

          /* ── Executive Dark Hero ─────────────────────── */
          .faq-corp-hero {
            background: linear-gradient(180deg, #031638 0%, #061d47 100%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          /* Executive Search Input */
          .faq-corp-search {
            background: #ffffff;
            border: 1.5px solid rgba(255, 255, 255, 0.15);
            border-radius: 14px;
            box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
          }
          .faq-corp-search:focus-within {
            border-color: #10b981;
            box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(16, 185, 129, 0.2);
          }

          /* ── Professional Category Group Card ───────────── */
          .corp-faq-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            box-shadow: 0 2px 8px rgba(3, 22, 56, 0.04);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .corp-faq-card:hover {
            transform: translateY(-3px);
            border-color: #cbd5e1;
            box-shadow: 0 12px 32px -6px rgba(3, 22, 56, 0.09);
          }

          /* Clean Highlight Point */
          .corp-highlight-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 13px;
            color: #475569;
            line-height: 1.5;
          }

          /* Standardized Brand Emerald Button */
          .corp-card-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 9px 18px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            color: #ffffff !important;
            background: #0e6245;
            box-shadow: 0 2px 8px rgba(14, 98, 69, 0.25);
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            text-decoration: none;
          }
          .corp-card-btn:hover {
            background: #094833;
            box-shadow: 0 4px 14px rgba(14, 98, 69, 0.35);
            transform: translateY(-1px);
          }
          .corp-card-btn svg {
            transition: transform 0.2s ease;
          }
          .corp-card-btn:hover svg {
            transform: translateX(3px);
          }

          /* ── Clean Accordion Item ────────────────────────── */
          .corp-accordion-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            margin-bottom: 10px;
            overflow: hidden;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .corp-accordion-card:hover {
            border-color: #cbd5e1;
          }
          .corp-accordion-card.is-open {
            border-color: #031638;
            box-shadow: 0 4px 16px -2px rgba(3, 22, 56, 0.06);
          }
        `,
        }}
      />

      <main className="faq-root-scope w-full">
        {/* =========================================================================
            1. EXECUTIVE HERO: Clean Dark Navy Palette, Authoritative Typography
            ========================================================================= */}
        <section className="faq-corp-hero pt-14 pb-16 px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="max-w-4xl mx-auto">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-5">
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Insurance Advisory Knowledge Base • IRDAI Registered IMF</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Frequently Asked Questions <br className="hidden sm:inline" />
              <span className="text-emerald-400">&amp; Coverage Advisory</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Objective, regulatory-aligned answers regarding policy audits, cashless hospital networks,
              fleet risk management, warehouse declarations, and insurance ombudsman dispute resolution.
            </p>

            {/* Corporate Search Bar */}
            <div className="w-full max-w-2xl mx-auto mt-8">
              <div className="faq-corp-search flex items-center px-4 py-3 gap-3">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  id="faq-search-input"
                  type="text"
                  placeholder="Search by topic, clause, or policy type (e.g., 'Cashless', 'NCB transfer', 'Warehouse', 'Claim rejection')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-[#031638] placeholder-slate-400 text-sm sm:text-base font-medium outline-none"
                  aria-label="Search insurance questions"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-300">
                <span className="text-slate-400 font-medium mr-1">Popular Topics:</span>
                {quickSearchSuggestions.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSearchQuery(topic)}
                    className="px-3 py-1 rounded-md text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Stats/Trust Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-8 border-t border-white/10 max-w-4xl mx-auto">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-left">
                <div className="text-emerald-400 font-extrabold text-lg sm:text-xl">100% Free</div>
                <div className="text-xs text-slate-300 font-medium">Policy audits &amp; reviews</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-left">
                <div className="text-emerald-400 font-extrabold text-lg sm:text-xl">25+ Insurers</div>
                <div className="text-xs text-slate-300 font-medium">Independent rate audits</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-left">
                <div className="text-emerald-400 font-extrabold text-lg sm:text-xl">IRDAI Regulated</div>
                <div className="text-xs text-slate-300 font-medium">Licensed IMF governance</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-left">
                <div className="text-emerald-400 font-extrabold text-lg sm:text-xl">Pan-India</div>
                <div className="text-xs text-slate-300 font-medium">Claims &amp; advisory support</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. GROUPED CATEGORY CARD GRID: Clean Executive Styling (No Rainbow Colors)
            ========================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0e6245] px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 mb-3">
              Insurance Knowledge Groups
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#031638] tracking-tight">
              Browse Questions by Category
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2.5 max-w-2xl mx-auto leading-relaxed">
              Select any category card below to view detailed questions, policy conditions, and statutory steps.
            </p>
          </div>

          {/* Clean 2 / 3 Column Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {FAQ_CATEGORIES.map((cat, idx) => (
              <article key={cat.id} className="corp-faq-card p-6 sm:p-7">
                <div>
                  {/* Card Header: Neutral Icon + Badge + Index */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#031638] flex items-center justify-center flex-shrink-0">
                        <CategoryIcon type={cat.icon} className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {cat.badge}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#031638] leading-snug mb-2">
                    <Link href={`/faq/${cat.id}`} className="hover:text-[#0e6245] transition-colors">
                      {cat.title}
                    </Link>
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                    {cat.description}
                  </p>

                  {/* Highlights (Clean, without clunky grey box) */}
                  <div className="space-y-2 mb-5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Key Topics Covered:
                    </div>
                    {cat.majorHighlights.map((highlight, hIdx) => (
                      <div key={hIdx} className="corp-highlight-item">
                        <svg className="w-4 h-4 text-[#0e6245] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sample Questions Preview */}
                  <div className="pt-4 border-t border-slate-100 space-y-1.5 mb-6">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Sample Inquiries:
                    </div>
                    {cat.faqs.slice(0, 2).map((q, qIdx) => (
                      <div key={qIdx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                        <span className="text-slate-400 font-bold">•</span>
                        <span className="line-clamp-1 font-medium">{q.question}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unified Card Action Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                  <span className="text-xs font-semibold text-slate-500">
                    <strong className="text-[#031638]">{cat.faqs.length}</strong> Questions
                  </span>
                  <Link href={`/faq/${cat.id}`} className="corp-card-btn">
                    <span>Explore Group</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* =========================================================================
            3. INTERACTIVE SEARCH & ACCORDION (Unified Corporate Styling)
            ========================================================================= */}
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-[#031638]">
              Browse All Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Read authoritative answers directly or filter by category.
            </p>

            {/* Unified Category Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-[#031638] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                All ({allFaqsList.length})
              </button>
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === cat.id
                      ? "bg-[#031638] text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat.shortTitle}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion Questions */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-2.5">
              {filteredFaqs.map((faq) => {
                const isOpen = !!expandedFaqMap[faq.id];
                return (
                  <div
                    key={faq.id}
                    className={`corp-accordion-card ${isOpen ? "is-open" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <div className="space-y-1 flex-1 pr-2">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {faq.categoryTitle}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-[#031638] leading-snug">
                          {highlightMatch(faq.question, searchQuery)}
                        </h4>
                      </div>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 mt-1 ${
                          isOpen ? "bg-[#031638] text-white rotate-180" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        <p className="pt-2">{highlightMatch(faq.answer, searchQuery)}</p>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Verified by Bima Headquarter
                          </span>
                          <Link
                            href={`/faq/${faq.categoryId}`}
                            className="font-bold text-[#031638] hover:text-[#0e6245] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Open {faq.categoryTitle} FAQs</span>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-sm font-bold text-[#031638] mb-1">No matching inquiries found</p>
              <p className="text-xs text-slate-500 mb-4">
                No questions matching &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#031638] text-white text-xs font-semibold"
              >
                Reset Filter
              </button>
            </div>
          )}
        </section>

        {/* =========================================================================
            4. EXECUTIVE FOOTER BANNER
            ========================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#031638] text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="max-w-2xl text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Need Specific Guidance on a Policy Clause or Claim Dispute?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Speak directly with our certified insurance advisory desk in Bhopal. We evaluate policy wordings,
                commercial declarations, and claim rejection letters with zero consultation fees.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto flex-shrink-0">
              <a
                href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Call {BUSINESS_DETAILS.phone}</span>
              </a>
              <Link
                href="/#cta-banner"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all"
              >
                <span>Request Policy Audit</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
