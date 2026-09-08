"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { SITE_URL } from "@/lib/seo/site";

const ROUTE_NAMES = {
  services: "Services",
  about: "About Us",
  contact: "Contact Us",
  "general-insurance": "General Insurance",
  "health-insurance": "Health Insurance",
  "motor-insurance": "Motor Insurance",
  "life-insurance": "Life Insurance",
  "commercial-insurance": "Commercial Insurance",
  "warehouse-insurance": "Warehouse Insurance",
  "fire-insurance": "Fire Insurance",
  "marine-insurance": "Marine Insurance",
  "policy-renewals": "Policy Renewals",
  "claims-assistance": "Claims Assistance",
  "risk-advisory": "Risk Advisory",
  blog: "Blog",
  faq: "Frequently Asked Questions",
  "privacy-policy": "Privacy Policy",
  "terms-and-conditions": "Terms and Conditions",
  disclaimer: "Disclaimer",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const name = ROUTE_NAMES[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { name, path };
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      ...breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: crumb.name,
        item: `${SITE_URL}${crumb.path}`,
      })),
    ],
  };

  return (
    <Script
      id={`breadcrumb-schema-${segments.join("-")}`}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
