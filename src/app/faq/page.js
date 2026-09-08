"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Script from "next/script";
import PublicHeader from "@/app/components/public/PublicHeader";
import LandingEffects from "@/app/components/LandingEffects";
import PublicFooter from "@/app/components/public/PublicFooter";
import { BUSINESS_DETAILS, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { HOMEPAGE_CONTENT } from "@/content/homepage";

const faqs = HOMEPAGE_CONTENT.faqSection.faqs.map((faq, index) => ({
  ...faq,
  id: `faq-${index + 1}`,
}));

const categories = [
  { name: "All", icon: "apps" },
  { name: "General & Consultation", icon: "handshake" },
  { name: "Health Insurance", icon: "health_and_safety" },
  { name: "Motor Insurance", icon: "directions_car" },
  { name: "Commercial & Business", icon: "domain" },
  { name: "Claims Support & Ombudsman", icon: "gavel" }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  const toggleFaq = (id) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
      const cleanQuery = searchQuery.toLowerCase().trim();
      const matchesSearch =
        cleanQuery === "" ||
        faq.question.toLowerCase().includes(cleanQuery) ||
        faq.answer.toLowerCase().includes(cleanQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${SITE_URL}/faq#webpage`,
          url: `${SITE_URL}/faq`,
          name: `Frequently Asked Questions | ${SITE_NAME}`,
          headline: `Frequently Asked Questions about Insurance and Claims`,
          description: `Find expert answers to common insurance questions regarding claims support, renewals, commercial risks, and policy auditing in India.`,
          isPartOf: {
            "@id": `${SITE_URL}/#website`,
          },
          inLanguage: "en-IN",
        },
        {
          "@type": "FAQPage",
          "@id": `${SITE_URL}/faq#faqpage`,
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
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
  }, []);

  const highlightText = (text, query) => {
    const lines = text.split("\n");
    const escapedQuery = query.trim() ? query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
    const regex = escapedQuery ? new RegExp(`(${escapedQuery})`, "gi") : null;

    return lines.map((line, idx) => {
      const isBullet = line.startsWith("• ");
      let heading = "";
      let remainingText = line;

      if (isBullet) {
        const colonIndex = line.indexOf(":");
        if (colonIndex !== -1) {
          heading = line.substring(2, colonIndex + 1); // e.g. "What it is:"
          remainingText = line.substring(colonIndex + 1);
        }
      }

      const renderText = (content) => {
        if (!regex) return content;
        const parts = content.split(regex);
        return parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-100 text-primary font-semibold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        );
      };

      return (
        <p key={idx} className="mb-3 last:mb-0 text-gray-600 text-sm md:text-[15px] leading-relaxed">
          {isBullet ? (
            <>
              <strong style={{ color: "#031638", marginRight: "6px" }}>{heading}</strong>
              {renderText(remainingText)}
            </>
          ) : (
            renderText(remainingText)
          )}
        </p>
      );
    });
  };

  return (
    <>
      <LandingEffects />
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0px 10px 30px rgba(26, 43, 78, 0.05);
            position: relative;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .glass-card::before {
            content: "";
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.4) 0%, transparent 50%);
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        }

        .glass-card:hover::before {
            opacity: 1;
        }

        .glass-card:hover {
            transform: translateY(-2px);
            box-shadow: 0px 15px 35px rgba(26, 43, 78, 0.08);
        }

        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }

        .entry-anim {
            opacity: 0;
            transform: translateY(20px);
            animation: entry 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes entry {
            to { opacity: 1; transform: translateY(0); }
        }

        nav#mainNav.scrolled {
            height: 72px !important;
            background: linear-gradient(90deg, #F8FAFC 0%, #EEF4FF 50%, #F8FAFC 100%) !important;
            box-shadow: none !important;
            border: none !important;
        }

        .landing-page,
        .landing-page * {
            color: inherit !important;
        }

        .landing-page button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            transition: all 0.2s !important;
            border-radius: 0.75rem !important;
            font-weight: 600 !important;
        }

        .landing-page button.bg-primary {
            background-color: #031638 !important;
            color: #ffffff !important;
        }
        .landing-page button.bg-primary:hover {
            background-color: #0d2554 !important;
            color: #ffffff !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 15px -3px rgba(3, 22, 56, 0.3) !important;
        }

        .landing-page button.bg-secondary {
            background-color: #1c6c39 !important;
            color: #ffffff !important;
        }

        .landing-page body,
        .landing-page .bg-background {
            background-color: #f8f9ff !important;
            color: #0b1c30 !important;
        }

        .landing-page h1,
        .landing-page h2,
        .landing-page h3,
        .landing-page h4 {
            color: #031638 !important;
        }

        /* Custom Vanilla Grid & Layout Setup */
        .faq-hero {
            position: relative;
            padding-top: 140px; /* Safe fixed nav clearance */
            padding-bottom: 40px;
            text-align: center;
            background: linear-gradient(180deg, rgba(229, 238, 255, 0.4) 0%, rgba(248, 249, 255, 1) 100%);
            width: 100%;
        }

        .faq-hero-inner {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }

        .faq-badge-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 16px;
            border-radius: 9999px;
            background: rgba(28, 108, 57, 0.08);
            color: #1c6c39 !important;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 20px;
            letter-spacing: 0.5px;
        }

        .faq-title {
            font-size: 32px;
            font-weight: 800;
            color: #031638 !important;
            line-height: 1.2;
            margin: 0 0 16px 0;
        }

        @media (min-width: 768px) {
            .faq-title {
                font-size: 48px;
            }
        }

        .faq-tagline-sub {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            color: #1c6c39 !important;
            margin-top: -8px;
            margin-bottom: 20px;
            letter-spacing: 1px;
        }

        .faq-description {
            font-size: 16px;
            color: #4a5568 !important;
            max-width: 740px;
            margin: 0 0 24px 0;
            line-height: 1.6;
        }

        .faq-hero-meta-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 13px;
            font-weight: 700;
            color: #031638 !important;
            margin-bottom: 32px;
            background: rgba(3, 22, 56, 0.05);
            padding: 8px 20px;
            border-radius: 9999px;
            flex-wrap: wrap;
        }

        .faq-hero-meta-row .dot {
            color: #c5c6cf !important;
            font-weight: 400;
        }

        .faq-search-wrapper {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            position: relative;
        }

        .faq-search-input {
            width: 100% !important;
            height: 56px !important;
            padding: 0 50px 0 54px !important;
            border-radius: 16px !important;
            background: #ffffff !important;
            border: 1px solid rgba(3, 22, 56, 0.12) !important;
            box-shadow: 0 8px 30px rgba(3, 22, 56, 0.04) !important;
            font-size: 15px !important;
            color: #1a2b4e !important;
            outline: none !important;
            transition: all 0.3s ease !important;
        }

        .faq-search-input:focus {
            border-color: #031638 !important;
            box-shadow: 0 8px 30px rgba(3, 22, 56, 0.08), 0 0 0 3px rgba(3, 22, 56, 0.05) !important;
        }

        .faq-search-icon {
            position: absolute;
            left: 18px;
            top: 50%;
            transform: translateY(-50%);
            color: #a0aec0;
            pointer-events: none;
            z-index: 10;
        }

        .faq-search-clear-btn {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            cursor: pointer;
            color: #a0aec0;
            padding: 4px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 10;
        }

        .faq-search-clear-btn:hover {
            background: rgba(0,0,0,0.05);
            color: #4a5568;
        }

        .faq-content-section {
            padding: 48px 24px 96px 24px;
            max-width: 1280px;
            margin: 0 auto;
            width: 100%;
        }

        .faq-layout-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 32px;
            align-items: start;
            width: 100%;
        }

        @media (min-width: 1024px) {
            .faq-layout-grid {
                grid-template-columns: 320px minmax(0, 1fr);
            }
        }

        /* Sidebar Styling */
        .faq-sidebar {
            background: #ffffff;
            border: 1px solid rgba(3, 22, 56, 0.08);
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 4px 20px -2px rgba(26, 43, 78, 0.03);
            width: 100%;
        }

        .sidebar-pill {
            width: 100%;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            padding: 12px 16px !important;
            border-radius: 12px !important;
            background: transparent !important;
            border: 1px solid transparent !important;
            color: #4a5568 !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            transition: all 0.25s ease !important;
            text-align: left !important;
            gap: 12px !important;
            cursor: pointer;
        }

        .sidebar-pill.active {
            background: #031638 !important;
            color: #ffffff !important;
            box-shadow: 0 8px 20px -5px rgba(3, 22, 56, 0.2) !important;
        }

        .sidebar-pill.active .material-symbols-outlined,
        .sidebar-pill.active .badge {
            color: #ffffff !important;
        }

        .sidebar-pill .material-symbols-outlined {
            color: #718096;
            font-size: 20px;
            transition: color 0.25s ease;
        }

        .sidebar-pill:hover:not(.active) {
            background: rgba(3, 22, 56, 0.04) !important;
            color: #031638 !important;
            border-color: rgba(3, 22, 56, 0.08) !important;
        }

        .sidebar-pill:hover:not(.active) .material-symbols-outlined {
            color: #031638 !important;
        }

        .sidebar-pill .badge {
            margin-left: auto;
            font-size: 11px;
            font-weight: 700;
            background: rgba(3, 22, 56, 0.06);
            color: #4a5568 !important;
            padding: 2px 8px;
            border-radius: 10px;
            transition: all 0.25s ease;
        }

        .sidebar-pill.active .badge {
            background: rgba(255, 255, 255, 0.15) !important;
            color: #ffffff !important;
        }

        /* FAQ Accordion Item Styling */
        .faq-list-container {
            width: 100%;
        }

        .faq-card {
            background: #ffffff;
            border: 1px solid rgba(3, 22, 56, 0.07);
            border-radius: 16px;
            box-shadow: 0 4px 15px -2px rgba(26, 43, 78, 0.02);
            margin-bottom: 14px;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: hidden;
            position: relative;
            width: 100%;
        }

        .faq-card::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: #1c6c39; /* Secondary Green */
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .faq-card.open {
            border-color: rgba(3, 22, 56, 0.15);
            box-shadow: 0 10px 25px -5px rgba(26, 43, 78, 0.05);
            background: #fcfdfe;
        }

        .faq-card.open::after {
            opacity: 1;
        }

        .faq-card:hover:not(.open) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px -4px rgba(26, 43, 78, 0.04);
            border-color: rgba(3, 22, 56, 0.12);
        }

        .faq-accordion-header {
            cursor: pointer;
            user-select: none;
            transition: background-color 0.2s ease;
        }

        .faq-accordion-panel {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s ease;
        }

        .faq-accordion-panel.open {
            max-height: 1200px;
        }

        .faq-arrow {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .faq-arrow.rotated {
            transform: rotate(180deg);
        }

        .faq-category-label {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #1c6c39 !important;
            background: rgba(28, 108, 57, 0.08);
            padding: 3px 10px;
            border-radius: 6px;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }

        /* CTA Section Styling */
        .faq-cta-card {
            position: relative;
            background: #031638;
            color: #ffffff !important;
            border-radius: 32px;
            padding: 64px 32px;
            text-align: center;
            overflow: hidden;
            margin-top: 64px;
            box-shadow: 0 20px 50px rgba(3, 22, 56, 0.15);
            width: 100%;
        }

        @media (min-width: 1024px) {
            .faq-cta-card {
                padding: 80px 64px;
            }
        }

        .faq-cta-card * {
            color: #ffffff !important;
        }

        .faq-cta-title {
            font-size: 32px;
            font-weight: 800;
            margin: 0 0 16px 0;
            line-height: 1.2;
        }

        @media (min-width: 768px) {
            .faq-cta-title {
                font-size: 44px;
            }
        }

        .faq-cta-description {
            font-size: 16px;
            opacity: 0.85;
            max-width: 600px;
            margin: 0 auto 36px auto;
            line-height: 1.6;
        }

        .faq-cta-buttons {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
        }

        .faq-cta-btn-primary {
            background: #1c6c39 !important;
            color: #ffffff !important;
            padding: 16px 32px !important;
            border-radius: 12px !important;
            font-weight: 700 !important;
            transition: all 0.25s ease !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(28, 108, 57, 0.25);
            cursor: pointer;
        }

        .faq-cta-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(28, 108, 57, 0.35);
        }

        .faq-cta-btn-secondary {
            background: #ffffff !important;
            color: #031638 !important;
            padding: 16px 32px !important;
            border-radius: 12px !important;
            font-weight: 700 !important;
            transition: all 0.25s ease !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px;
            cursor: pointer;
        }

        .faq-cta-btn-secondary:hover {
            transform: translateY(-2px);
            background: #f1f5f9 !important;
        }
      `,
        }}
      />

      <div className="landing-shell bg-background text-on-background font-body-md overflow-x-hidden min-h-screen">
        <PublicHeader />
        <main>
          {/* Hero / Header Section */}
          <header className="faq-hero">
            <div className="faq-hero-inner">
              <div className="entry-anim flex flex-col items-center w-full">
                <div className="faq-badge-pill">
                  <span
                    className="material-symbols-outlined text-[16px] text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  A Brand of InsureDesk IMF Pvt. Ltd.
                </div>
                <h1 className="faq-title">
                  Frequently Asked <span className="text-secondary">Questions</span>
                </h1>
                <p className="faq-tagline-sub">
                  Insurance Consulting & Claim Assistance Across India
                </p>
                <p className="faq-description">
                  Bima Headquarter helps individuals, families, businesses, warehouses, transporters, and institutions make informed insurance decisions with professional consulting and claim support. Headquartered in Bhopal, we assist clients across India with motor, health, life, marine, warehouse, and commercial insurance solutions.
                </p>
                <div className="faq-hero-meta-row">
                  <span>10+ Insurance Partners</span>
                  <span className="dot">•</span>
                  <span>Expert Guidance</span>
                  <span className="dot">•</span>
                  <span>Claim Assistance</span>
                </div>

                {/* Search Bar Container */}
                <div className="faq-search-wrapper">
                  <span className="material-symbols-outlined faq-search-icon">
                    search
                  </span>
                  <input
                    id="faq-search-input"
                    type="text"
                    placeholder="Search by keyword, policy type, or claims query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="faq-search-input"
                    aria-label="Search frequently asked questions"
                  />
                  {searchQuery && (
                    <button
                      id="faq-search-clear"
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="faq-search-clear-btn"
                      aria-label="Clear search"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Layout Container (Side-by-Side) */}
          <section className="faq-content-section">
            <div className="faq-layout-grid">
              
              {/* Left Column: Category Sidebar (Sticky on Desktop) */}
              <aside className="entry-anim">
                <div className="faq-sidebar">
                  <h2 className="font-bold text-primary text-[14px] mb-4 uppercase tracking-wider opacity-75" style={{ color: "#031638" }}>
                    Filter by Category
                  </h2>
                  <div className="space-y-1.5" role="tablist" aria-label="FAQ Categories">
                    {categories.map((cat) => {
                      const count = cat.name === "All"
                        ? faqs.length
                        : faqs.filter((f) => f.category === cat.name).length;
                      const isActive = activeCategory === cat.name;

                      return (
                        <button
                          key={cat.name}
                          id={`category-tab-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                          onClick={() => {
                            setActiveCategory(cat.name);
                            setExpandedFaqId(null);
                          }}
                          className={`sidebar-pill ${isActive ? "active" : ""}`}
                          role="tab"
                          aria-selected={isActive}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {cat.icon}
                          </span>
                          <span>{cat.name}</span>
                          <span className="badge">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-primary text-[14px] mb-2" style={{ color: "#031638" }}>Need Expert Help?</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4">
                      Our advisory team reviews current policies for potential risks and gaps at zero charge.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/95 text-white font-semibold text-xs rounded-xl shadow-md transition-all text-center"
                      style={{ background: "#1c6c39", color: "#ffffff" }}
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Get Free Audit
                    </Link>
                  </div>
                </div>
              </aside>

              {/* Right Column: FAQ Accordion List */}
              <div className="faq-list-container" id="faq-list-container">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => {
                    const isOpen = expandedFaqId === faq.id;
                    return (
                      <article
                        key={faq.id}
                        className={`faq-card ${isOpen ? "open" : ""}`}
                      >
                        <div
                          id={`faq-header-${faq.id}`}
                          onClick={() => toggleFaq(faq.id)}
                          className="faq-accordion-header flex justify-between items-start p-6 md:p-7 gap-4"
                          role="button"
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${faq.id}`}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleFaq(faq.id);
                            }
                          }}
                        >
                          <div className="flex flex-col items-start pr-2">
                            <span className="faq-category-label">{faq.category}</span>
                            <h3 className="font-bold text-[16px] md:text-[18px] text-primary leading-snug text-left mt-1" style={{ color: "#031638" }}>
                              {highlightText(faq.question, searchQuery)}
                            </h3>
                          </div>
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-container/10 flex items-center justify-center text-primary mt-4" style={{ background: "rgba(165, 245, 179, 0.25)" }}>
                            <span
                              className={`material-symbols-outlined text-[20px] faq-arrow ${
                                isOpen ? "rotated" : ""
                              }`}
                              style={{ color: "#1c6c39" }}
                            >
                              keyboard_arrow_down
                            </span>
                          </div>
                        </div>
                        <div
                          id={`faq-panel-${faq.id}`}
                          className={`faq-accordion-panel ${isOpen ? "open" : ""}`}
                          role="region"
                          aria-labelledby={`faq-header-${faq.id}`}
                        >
                          <div className="px-6 pb-6 md:px-7 md:pb-7 text-gray-600 text-sm md:text-[15px] leading-relaxed border-t border-gray-50 pt-5">
                            {highlightText(faq.answer, searchQuery)}
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-outline-variant/10 shadow-sm px-6">
                    <span className="material-symbols-outlined text-[48px] text-gray-300 mb-4">
                      search_off
                    </span>
                    <h3 className="font-semibold text-lg text-primary mb-2" style={{ color: "#031638" }}>No matching questions found</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                      We couldn't find any questions matching "{searchQuery}" in our {activeCategory} section. Try adjusting your keywords or clearing the search box.
                    </p>
                    <button
                      id="reset-filters-btn"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("All");
                      }}
                      className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all"
                      style={{ background: "#031638", color: "#ffffff" }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* CTA Banner */}
            <div className="faq-cta-card reveal" id="cta-banner">
              <div className="absolute inset-0 -z-10 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px]"></div>
              </div>
              <h2 className="faq-cta-title">
                Still Have Questions?
              </h2>
              <p className="faq-cta-description">
                If you couldn't find the answers you were looking for, or if you need immediate claims assistance or corporate advisory support, connect with us today. <strong>Consultations are 100% free.</strong>
              </p>
              <div className="faq-cta-buttons">
                <a
                  href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                  id="cta-faq-call"
                  className="faq-cta-btn-primary"
                >
                  <span className="material-symbols-outlined">call</span> Call Us: {BUSINESS_DETAILS.phone}
                </a>
                <a
                  href={`mailto:${BUSINESS_DETAILS.email}`}
                  id="cta-faq-email"
                  className="faq-cta-btn-secondary"
                >
                  <span className="material-symbols-outlined">mail</span> Email Our Experts
                </a>
              </div>
            </div>

          </section>
        </main>
        <PublicFooter />
      </div>
    </>
  );
}
