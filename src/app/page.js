import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import PublicHeader from "@/app/components/public/PublicHeader";
import LandingEffects from "@/app/components/LandingEffects";
import PublicFooter from "@/app/components/public/PublicFooter";
import BrandLogo from "@/app/components/brand/BrandLogo";
import { INSURER_LOGOS } from "@/app/components/brand/logoAssets";
import { BUSINESS_DETAILS, SITE_URL } from "@/lib/seo/site";
import { HOMEPAGE_CONTENT } from "@/content/homepage";
import { SERVICES } from "@/content/services";

const companyName = "Bima Headquarter by Insuredesk IMF Pvt. Ltd.";
const homepageTitle = "Bima Headquarter by Insuredesk IMF Pvt. Ltd. | Insurance Guidance";
const homepageDescription = "Bima Headquarter by Insuredesk IMF Pvt. Ltd. offers insurance guidance in Bhopal, policy comparisons, renewal assistance and claim documentation support.";

export const metadata = {
  title: { absolute: homepageTitle },
  description: homepageDescription,
  applicationName: companyName,
  authors: [{ name: companyName, url: SITE_URL }],
  creator: companyName,
  publisher: companyName,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: companyName,
    title: homepageTitle,
    description: homepageDescription,
    images: [{ url: "/brand/main-logo-wide.webp", width: 1024, height: 570, alt: `${companyName} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: homepageTitle,
    description: homepageDescription,
    images: ["/brand/main-logo-wide.webp"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "LocalBusiness", "InsuranceAgency"],
      "@id": `${SITE_URL}/#organization`,
      name: companyName,
      alternateName: ["BimaHeadquarter", "bimaheadquarter.com"],
      legalName: companyName,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/main-logo-wide.webp`,
      image: `${SITE_URL}/brand/main-logo-wide.webp`,
      email: BUSINESS_DETAILS.email,
      telephone: BUSINESS_DETAILS.phoneHref,
      description: homepageDescription,
      foundingDate: BUSINESS_DETAILS.foundingDate,
      slogan: "Trusted Insurance Consultancy",
      address: {
        "@type": "PostalAddress",
        ...BUSINESS_DETAILS.address,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 23.1956,
        longitude: 77.4608,
      },
      hasMap: BUSINESS_DETAILS.mapsUrl,
      areaServed: {
        "@type": "Country",
        name: BUSINESS_DETAILS.serviceArea,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: BUSINESS_DETAILS.openingHours.days,
        opens: BUSINESS_DETAILS.openingHours.opens,
        closes: BUSINESS_DETAILS.openingHours.closes,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: BUSINESS_DETAILS.phoneHref,
        email: BUSINESS_DETAILS.email,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
      founder: {
        "@type": "Person",
        "@id": `${SITE_URL}/about#anand-soni`,
        name: "Anand Soni",
        jobTitle: "Founder Director",
        sameAs: ["https://www.linkedin.com/in/anand-soni-976b7024/"],
      },
      knowsAbout: [
        "Insurance consulting",
        "Claim assistance",
        ...SERVICES.map((s) => s.title),
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: companyName,
      headline: homepageTitle,
      description: homepageDescription,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/#insurance-consulting-service`,
      name: "Insurance and Claim Consulting",
      serviceType: "Insurance consulting and claim assistance",
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      areaServed: {
        "@type": "Country",
        name: BUSINESS_DETAILS.serviceArea,
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Insurance Consulting Services",
        itemListElement: SERVICES.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.fullName || s.title,
          },
        })),
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: HOMEPAGE_CONTENT.faqSection.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
      ],
    },
  ],
};

export default function RootPage() {
  const partnerLogos = [...INSURER_LOGOS, ...INSURER_LOGOS];

  return (
    <>
      <Script
        id="bimaheadquarter-structured-data"
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
            transform: translateY(-4px);
            box-shadow: 0px 20px 40px rgba(26, 43, 78, 0.1);
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

        .preserve-3d {
            transform-style: preserve-3d;
        }
        
        .hero-stats-container {
            display: flex;
            flex-wrap: wrap;
            align-items: stretch;
            row-gap: 20px;
            column-gap: 40px;
            margin-top: 48px;
            width: 100%;
            justify-content: flex-start;
        }
        .hero-stat-col {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            position: relative;
        }
        .hero-stat-col:not(:last-child)::after {
            content: "";
            position: absolute;
            right: -20px;
            top: 10%;
            height: 80%;
            width: 1px;
            background-color: #c5c6cf;
        }
        .hero-stat-value {
            font-size: 30px;
            font-weight: 700;
            color: #031638 !important;
            line-height: 1.1;
        }

        .hero-stat-label {
            font-size: 12px;
            font-weight: 700;
            color: #5c5d66 !important;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-top: 6px;
            line-height: 1.2;
        }
        @media (max-width: 640px) {
            .hero-stats-container {
                display: flex !important;
                flex-direction: row !important;
                column-gap: 24px !important;
                row-gap: 8px !important;
                margin-top: 32px !important;
                justify-content: center !important;
                width: 100% !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }
            .hero-stat-col:not(:last-child)::after {
                right: -12px !important;
                display: block !important;
            }
            .hero-stat-value {
                font-size: 20px !important;
            }
            .hero-stat-label {
                font-size: 10px !important;
                margin-top: 4px !important;
            }
            .typing-headline {
                font-size: 32px !important;
                line-height: 1.15 !important;
            }
            .hero-content p {
                font-size: 15px !important;
                line-height: 1.55 !important;
            }
        }
        @media (max-width: 480px) {
            .hero-stats-container {
                column-gap: 20px !important;
            }
            .hero-stat-col:not(:last-child)::after {
                right: -10px !important;
            }
            .hero-stat-value {
                font-size: 18px !important;
            }
            .hero-stat-label {
                font-size: 9px !important;
                letter-spacing: 0.05em !important;
            }
            .typing-headline {
                font-size: 28px !important;
            }
            .hero-content .flex-wrap {
                width: 100% !important;
            }
            .hero-content .flex-wrap a {
                width: 100% !important;
            }
        }
        .typing-headline {
            text-align: left !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
        }
        .typing-line {
            display: block !important;
            text-align: left !important;
            margin-left: 0 !important;
            margin-right: auto !important;
            width: fit-content !important;
        }
      `,
        }}
      />

      <LandingEffects />

      <div className="landing-shell bg-background text-on-background font-body-md overflow-x-hidden min-h-screen">
        <PublicHeader />
        <main>
          <header
            className="relative pt-24 pb-32 flex items-center justify-start min-h-[640px] lg:min-h-[680px] isolate"
            id="hero"
          >
            <div className="max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
              <div className="hero-content flex flex-col items-start text-left justify-center max-w-[680px]">
                <h1 className="typing-headline font-display-lg text-display-lg text-primary mb-3 leading-tight text-[40px] md:text-[48px] font-bold text-left">
                  {HOMEPAGE_CONTENT.hero.heading}
                </h1>
                <p className="text-secondary text-[20px] md:text-[24px] font-bold mb-5">
                  {HOMEPAGE_CONTENT.hero.subheading}
                </p>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl text-[18px] text-left">
                  {HOMEPAGE_CONTENT.hero.description}
                </p>
                <div className="flex flex-wrap gap-4 justify-start">
                  <a
                    href="#solutions"
                    className="px-8 py-4 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-xl hover:translate-y-[-2px] transition-all border-0 min-h-0 text-[14px] inline-block text-center"
                  >
                    {HOMEPAGE_CONTENT.hero.ctaConsultationText}
                  </a>
                  <a
                    href="#process"
                    className="px-8 py-4 border-2 border-secondary text-secondary rounded-xl font-label-md text-label-md hover:bg-secondary/5 transition-all bg-transparent min-h-0 text-[14px] inline-block text-center"
                  >
                    {HOMEPAGE_CONTENT.hero.ctaClaimsText}
                  </a>
                </div>
                <div className="hero-stats-container">
                  {HOMEPAGE_CONTENT.hero.stats.map((stat, idx) => (
                    <div className="hero-stat-col" key={idx}>
                      <span
                        className="hero-stat-value"
                        id={stat.id}
                        suppressHydrationWarning={stat.suppressHydrationWarning || stat.isCounter}
                      >
                        {stat.value}
                      </span>
                      <span className="hero-stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {/* Partner Slider */}
          <section
            className="pt-4 pb-8 bg-surface-container-lowest overflow-hidden border-t border-b border-outline-variant/30"
            id="partners"
          >
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-2 text-center reveal">
              <p className="font-label-md text-on-surface-variant uppercase tracking-widest text-[12px] font-semibold">
                {HOMEPAGE_CONTENT.partnerSliderTitle}
              </p>
            </div>
            <div className="flex partner-slider whitespace-nowrap gap-10 items-center">
              {partnerLogos.map((logo, index) => (
                <span
                  className={`partner-logo-card ${logo.className || ""}`.trim()}
                  key={`${logo.src}-${index}`}
                  aria-hidden={index >= INSURER_LOGOS.length ? true : undefined}
                >
                  <Image unoptimized src={logo.src} alt={`${logo.name} logo`} width={136} height={44} />
                </span>
              ))}
            </div>
          </section>

          {/* Insurance Categories Grid */}
          <section className="services-section py-24 relative overflow-hidden" id="solutions">
            <div className="services-section-texture absolute inset-0"></div>
            <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="services-heading text-center reveal">
                <div className="services-kicker">
                  <div></div>
                  <span>{HOMEPAGE_CONTENT.servicesSection.kicker}</span>
                  <div></div>
                </div>
                <h2 className="font-headline-lg font-extrabold tracking-tight">
                  {HOMEPAGE_CONTENT.servicesSection.heading}
                </h2>
                <p className="font-body-lg">
                  {HOMEPAGE_CONTENT.servicesSection.subheading.split("\n").map((line, lIdx) => (
                    <span key={lIdx}>
                      {line}
                      {lIdx < HOMEPAGE_CONTENT.servicesSection.subheading.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>

              <div className="services-grid">
                {SERVICES.filter((s) => s.slug !== "risk-advisory").slice(0, 6).map((service, index) => (
                  <Link
                    key={index}
                    href={service.route}
                    className="service-card group reveal"
                  >
                    <div className="service-card-media">
                      <div className="service-image-clip">
                        <Image
                          src={service.image}
                          alt={`${service.title} consultancy by Bima Headquarter`}
                          width={600}
                          height={400}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </div>
                    <div className="service-card-copy">
                      <div>
                        <div className="service-card-heading">
                          <div className="service-card-icon" aria-hidden="true">
                            <span className="material-symbols-outlined text-[24px]">{service.icon}</span>
                          </div>
                          <h3 className="font-headline-md font-bold">{service.title}</h3>
                        </div>
                        <p className="text-body-md">{service.desc}</p>
                      </div>

                      <span className="service-card-link font-label-md group/btn">
                        Learn More{" "}
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Trust Indicator Bar */}
              <div className="services-trust-bar reveal">
                {HOMEPAGE_CONTENT.trustBar.map((item, idx) => (
                  <span key={idx} className="contents">
                    <div className="services-trust-item">
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                    {idx < HOMEPAGE_CONTENT.trustBar.length - 1 && (
                      <div className="services-trust-divider"></div>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Company overview */}
          <section className="company-overview" aria-labelledby="company-overview-heading">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="company-overview-layout">
                <div className="company-overview-intro">
                  <BrandLogo className="company-overview-brand" />
                  <div>
                    <h2 id="company-overview-heading">
                      {HOMEPAGE_CONTENT.whyChooseUs.heading}
                    </h2>
                    <p>{HOMEPAGE_CONTENT.whyChooseUs.subheading}</p>
                  </div>
                  <a href="#process" className="company-overview-cta">
                    {HOMEPAGE_CONTENT.whyChooseUs.ctaText}
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                  </a>
                </div>
                <div className="company-overview-details">
                  {HOMEPAGE_CONTENT.whyChooseUs.cards.map((card) => (
                    <article className="company-overview-item" key={card.title}>
                      <span className="company-overview-icon material-symbols-outlined" aria-hidden="true">
                        {card.icon}
                      </span>
                      <div>
                        <h3>{card.title}</h3>
                        <p>{card.desc}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Claim Assistance Process */}
          <section
            className="py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop"
            id="process"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1 reveal">
                <Image
                  alt="Bima Headquarter insurance claim assistance consultation"
                  className="rounded-3xl shadow-2xl w-full aspect-video object-cover"
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80"
                  width={1200}
                  height={675}
                />
              </div>
              <div className="order-1 lg:order-2 reveal" style={{ transitionDelay: "0.2s" }}>
                <span className="font-label-md text-secondary uppercase tracking-widest text-[12px] mb-4 block font-semibold">
                  {HOMEPAGE_CONTENT.processSection.kicker}
                </span>
                <h2 className="font-headline-lg text-headline-lg text-primary mb-8 text-[32px] font-bold">
                  {HOMEPAGE_CONTENT.processSection.heading}
                </h2>
                <div className="space-y-8">
                  {HOMEPAGE_CONTENT.processSection.steps.map((step) => (
                    <div className="flex gap-6 group" key={step.number}>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold transition-transform group-hover:scale-110">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="font-headline-md text-[18px] text-primary mb-1 font-semibold">
                          {step.title}
                        </h3>
                        <p className="text-body-md text-on-surface-variant">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href="#cta-banner"
                  className="mt-12 px-8 py-4 bg-primary text-on-primary rounded-xl font-label-md hover:shadow-lg transition-all reveal border-0 min-h-0 text-[14px] inline-block text-center"
                  style={{ transitionDelay: "0.4s" }}
                >
                  {HOMEPAGE_CONTENT.processSection.ctaText}
                </a>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section
            className="py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop"
            id="faq"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="reveal">
                <h2 className="font-headline-lg text-headline-lg text-primary mb-6 text-[32px] font-bold">
                  {HOMEPAGE_CONTENT.faqSection.heading}
                </h2>
                <p className="text-body-lg text-on-surface-variant mb-8 text-[18px]">
                  {HOMEPAGE_CONTENT.faqSection.subheading}
                </p>
                <a
                  href="#cta-banner"
                  className="text-secondary font-label-md inline-flex items-center gap-2 hover:underline group bg-transparent p-0 min-h-0 shadow-none hover:translate-y-0 text-[14px]"
                >
                  {HOMEPAGE_CONTENT.faqSection.ctaText}{" "}
                  <span className="material-symbols-outlined group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                    arrow_outward
                  </span>
                </a>
              </div>
              <div className="lg:col-span-2 space-y-4">
                {HOMEPAGE_CONTENT.faqSection.faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-white rounded-2xl p-6 border border-outline-variant/30 open:shadow-md transition-all reveal"
                    style={{ transitionDelay: `${(index + 1) * 0.1}s` }}
                  >
                    <summary className="list-none cursor-pointer flex justify-between items-center font-headline-md text-[18px] text-primary font-semibold">
                      {faq.question}
                      <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                        expand_more
                      </span>
                    </summary>
                    <p className="mt-4 text-body-md text-on-surface-variant">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section
            className="py-20 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-margin-desktop"
            id="cta-banner"
          >
            <div className="relative bg-primary rounded-3xl p-12 lg:p-20 overflow-hidden text-center text-on-primary shadow-2xl reveal border border-primary/20">
              <div className="absolute inset-0 -z-10 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px]"></div>
              </div>
              <h2 className="font-display-lg text-display-lg mb-6 entry-anim text-white text-[48px] font-bold">
                {HOMEPAGE_CONTENT.ctaBanner.heading}
              </h2>
              <p
                className="font-body-lg text-body-lg mb-10 opacity-80 max-w-2xl mx-auto entry-anim text-white/80 text-[18px]"
                style={{ animationDelay: "0.2s" }}
              >
                {HOMEPAGE_CONTENT.ctaBanner.subheading}
              </p>
              <div
                className="flex flex-wrap justify-center gap-6 entry-anim"
                style={{ animationDelay: "0.4s" }}
              >
                <a
                  href={`tel:${BUSINESS_DETAILS.phoneHref}`}
                  className="px-10 py-5 bg-secondary text-white rounded-xl font-label-md text-label-md flex items-center gap-3 hover:scale-105 transition-all text-[14px]"
                >
                  <span className="material-symbols-outlined">call</span> {HOMEPAGE_CONTENT.ctaBanner.callCtaText}{" "}
                  {BUSINESS_DETAILS.phone}
                </a>
                <Link
                  href="/contact"
                  className="px-10 py-5 bg-white text-primary rounded-xl font-label-md text-label-md flex items-center gap-3 hover:scale-105 transition-all border-0 min-h-0 text-[14px]"
                >
                  {HOMEPAGE_CONTENT.ctaBanner.scheduleCtaText}
                </Link>
              </div>
            </div>
          </section>
        </main>
        <PublicFooter />
      </div>
    </>
  );
}
