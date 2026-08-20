"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  TrendingUp,
  Award,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Clock3,
  CheckCircle2,
  Calendar,
  FileText,
  PieChart,
  Layers,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Briefcase,
  Zap,
} from "lucide-react";

// -------------------------------------------------------------
// Constants, Formats & Brand Helpers
// -------------------------------------------------------------
const DASHBOARD_CACHE_KEY = "bimaheadquarter.dashboard.overview.cache.v5";

const PALETTE = [
  "#2563eb", // Royal Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#14b8a6", // Teal
];

function formatMoney(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatCompactMoney(amount) {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
  return `₹${Math.round(num)}`;
}

const KNOWN_INSURERS = [
  { match: /new india/i, label: "New India Assurance" },
  { match: /icici lombard/i, label: "ICICI Lombard" },
  { match: /iffco/i, label: "IFFCO Tokio" },
  { match: /tata aig/i, label: "Tata AIG" },
  { match: /bajaj allianz/i, label: "Bajaj Allianz" },
  { match: /royal sundaram/i, label: "Royal Sundaram" },
  { match: /hdfc ergo/i, label: "HDFC ERGO" },
  { match: /united india/i, label: "United India" },
  { match: /national insurance/i, label: "National Insurance" },
  { match: /oriental/i, label: "Oriental Insurance" },
  { match: /sbi general/i, label: "SBI General" },
  { match: /cholamandalam|chola ms/i, label: "Chola MS" },
  { match: /star health/i, label: "Star Health" },
  { match: /care health/i, label: "Care Health" },
  { match: /niva bupa/i, label: "Niva Bupa" },
  { match: /go digit|digit/i, label: "Go Digit" },
  { match: /acko/i, label: "Acko General" },
  { match: /liberty/i, label: "Liberty General" },
  { match: /magma hdi/i, label: "Magma HDI" },
  { match: /universal sompo/i, label: "Universal Sompo" },
  { match: /future generali/i, label: "Future Generali" },
  { match: /shriram/i, label: "Shriram General" },
  { match: /raheja/i, label: "Raheja QBE" },
];

function normalizeCompanyName(name = "") {
  if (!name) return "Insurance Partner";
  for (const item of KNOWN_INSURERS) {
    if (item.match.test(name)) return item.label;
  }
  return name
    .replace(/^THE\s+/i, "")
    .replace(/General Insurance\s*(Company)?\s*(Limited|Ltd\.?)?/i, "")
    .replace(/Assurance\s*(Company)?\s*(Limited|Ltd\.?)?/i, "Assurance")
    .replace(/Insurance\s*(Company)?\s*(Limited|Ltd\.?)?/i, "")
    .replace(/Company\s*(Limited|Ltd\.?)?/i, "")
    .replace(/Co\.?\s*(Ltd\.?)?/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCategoryName(name = "") {
  if (!name) return "General Insurance";
  return name
    .replace(/^Motor\s*-\s*/i, "")
    .replace(/package policy/i, "Package")
    .replace(/liability policy/i, "Liability")
    .replace(/\s+policy$/i, "")
    .replace(/Warehouse\s*\/\s*MSME\s*\/\s*Fire\s*&\s*Burglary\s*package/i, "Fire & MSME")
    .replace(/Commercial Vehicle\s*Package/i, "Commercial Vehicle")
    .replace(/Private Car\s*Package/i, "Private Car")
    .replace(/Two Wheeler\s*Package/i, "Two Wheeler")
    .replace(/Auto Secure\s*-\s*Private Car\s*Package/i, "Auto Secure Car")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    let message = "Request failed";
    try {
      const body = await res.json();
      message = body.error || body.message || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

const EMPTY_SUMMARY = {
  activePolicies: 0,
  expiringPolicies: 0,
  totalCustomers: 0,
  needsReview: 0,
  failedExtractions: 0,
  expiringToday: 0,
  expiring7Days: 0,
  expiring30Days: 0,
  pendingRenewals: 0,
  renewedPolicies: 0,
  lostPolicies: 0,
  todayFollowUps: 0,
  overdueFollowUps: 0,
  totalClaims: 0,
  pendingClaims: 0,
  claimFollowUps: 0,
  claimDocumentsPending: 0,
  settledClaims: 0,
  rejectedClaims: 0,
  totalLeads: 0,
  newLeads: 0,
  leadFollowUps: 0,
  interestedLeads: 0,
  convertedLeads: 0,
  lostLeads: 0,
};

const EMPTY_PREMIUM = {
  mtdPremium: 0,
  mtdCount: 0,
  ytdPremium: 0,
  ytdCount: 0,
  eodPremium: 0,
  eodCount: 0,
  renewedPremium: 0,
};

// -------------------------------------------------------------
// Component: Top Executive KPI Metric Strip (4 Stat Cards)
// -------------------------------------------------------------
function ExecutiveKpiStrip({ summary = {}, premium = {}, periodLabel = "" }) {
  return (
    <section className="dash-exec-kpi-grid">
      {/* 1. Policies In Period */}
      <Link href="/policy-records?lifecycle=active" className="dash-exec-card tone-blue" prefetch={false}>
        <div className="dash-exec-accent-bar" />
        <div className="dash-exec-card-head">
          <span className="dash-exec-label">POLICIES ISSUED</span>
          <div className="dash-exec-icon-wrap"><ShieldCheck size={18} /></div>
        </div>
        <div className="dash-exec-body">
          <strong className="dash-exec-value">{summary.activePolicies || 0}</strong>
          <span className="dash-exec-sub">Booked policies in {periodLabel || "period"}</span>
        </div>
      </Link>

      {/* 2. Total Policyholders */}
      <Link href="/customer-management?scope=active-policyholders" className="dash-exec-card tone-emerald" prefetch={false}>
        <div className="dash-exec-accent-bar" />
        <div className="dash-exec-card-head">
          <span className="dash-exec-label">INSURED CLIENTS</span>
          <div className="dash-exec-icon-wrap"><Users size={18} /></div>
        </div>
        <div className="dash-exec-body">
          <strong className="dash-exec-value">{summary.totalCustomers || 0}</strong>
          <span className="dash-exec-sub">Distinct client profiles</span>
        </div>
      </Link>

      {/* 3. Booked Premium */}
      <div className="dash-exec-card tone-purple">
        <div className="dash-exec-accent-bar" />
        <div className="dash-exec-card-head">
          <span className="dash-exec-label">BOOKED PREMIUM</span>
          <div className="dash-exec-icon-wrap"><TrendingUp size={18} /></div>
        </div>
        <div className="dash-exec-body">
          <strong className="dash-exec-value">{formatCompactMoney(summary.totalPremium || premium.periodPremium || premium.ytdPremium || 0)}</strong>
          <span className="dash-exec-sub">{formatMoney(summary.totalPremium || 0)} total value</span>
        </div>
      </div>

      {/* 4. Renewed / Retention */}
      <div className="dash-exec-card tone-amber">
        <div className="dash-exec-accent-bar" />
        <div className="dash-exec-card-head">
          <span className="dash-exec-label">RENEWAL & LEADS</span>
          <div className="dash-exec-icon-wrap"><Award size={18} /></div>
        </div>
        <div className="dash-exec-body">
          <strong className="dash-exec-value">{summary.renewedPolicies || summary.convertedLeads || 0}</strong>
          <span className="dash-exec-sub">{summary.pendingRenewals || 0} pending dues | {summary.totalLeads || 0} leads</span>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Component: Primary Production Trajectory Graph (Hero Chart)
// -------------------------------------------------------------
function ProductionTrajectoryChart({ trends = [], periodInfo = {} }) {
  const [metric, setMetric] = useState("premium"); // "premium" | "count"
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const data = useMemo(() => {
    if (!trends || trends.length === 0) {
      return [
        { shortMonth: "Jan", month_key: "2026-01", totalPremium: 0, policyCount: 0 },
        { shortMonth: "Feb", month_key: "2026-02", totalPremium: 0, policyCount: 0 },
        { shortMonth: "Mar", month_key: "2026-03", totalPremium: 0, policyCount: 0 },
        { shortMonth: "Apr", month_key: "2026-04", totalPremium: 0, policyCount: 0 },
        { shortMonth: "May", month_key: "2026-05", totalPremium: 0, policyCount: 0 },
        { shortMonth: "Jun", month_key: "2026-06", totalPremium: 0, policyCount: 0 },
        { shortMonth: "Jul", month_key: "2026-07", totalPremium: 0, policyCount: 0 },
        { shortMonth: "Aug", month_key: "2026-08", totalPremium: 0, policyCount: 0 },
      ];
    }
    return trends;
  }, [trends]);

  const activeHoverIndex = hoveredIndex !== null ? hoveredIndex : data.length - 1;

  const width = 860;
  const height = 220;
  const paddingLeft = 70;
  const paddingRight = 24;
  const paddingTop = 32;
  const paddingBottom = 30;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => (metric === "premium" ? Number(d.totalPremium || 0) : Number(d.policyCount || 0)));
  const rawMax = Math.max(...values, 0);
  const maxValue = rawMax > 0 ? rawMax * 1.15 : metric === "premium" ? 100000 : 10;
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth / 2;

  const points = data.map((item, index) => {
    const val = metric === "premium" ? Number(item.totalPremium || 0) : Number(item.policyCount || 0);
    const x = data.length === 1 ? paddingLeft + plotWidth / 2 : paddingLeft + index * stepX;
    const y = paddingTop + plotHeight - (val / maxValue) * plotHeight;
    return { ...item, x, y, value: val };
  });

  const linePath = points.length === 1
    ? `M ${points[0].x - 30} ${points[0].y} L ${points[0].x + 30} ${points[0].y}`
    : points.reduce((acc, pt, i) => {
        if (i === 0) return `M ${pt.x} ${pt.y}`;
        const prev = points[i - 1];
        const cx1 = prev.x + (pt.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (pt.x - prev.x) / 2;
        const cy2 = pt.y;
        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
      }, "");

  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`
    : "";

  const totalPeriodPremium = data.reduce((acc, d) => acc + Number(d.totalPremium || 0), 0);
  const totalPeriodCount = data.reduce((acc, d) => acc + Number(d.policyCount || 0), 0);
  const focusedMonthItem = activeHoverIndex !== null && data[activeHoverIndex] ? data[activeHoverIndex] : data[data.length - 1] || {};

  const getShortMonthLabel = (pt) => {
    if (pt.shortMonth) {
      return pt.shortMonth;
    }
    return pt.monthLabel || "";
  };

  return (
    <div className="dash-hero-chart-card">
      {/* 1. Header: Title & Metric Segmented Switch */}
      <div className="dash-card-header">
        <div>
          <div className="dash-card-tag">PRODUCTION VELOCITY</div>
          <h3 className="dash-card-title">Business Production Trajectory</h3>
          <p className="dash-card-subtitle">Fresh policy issuance volume & premium trajectory over time</p>
        </div>
        <div className="dash-pill-segmented">
          <button
            type="button"
            className={metric === "premium" ? "active" : ""}
            onClick={() => setMetric("premium")}
          >
            Premium (₹)
          </button>
          <button
            type="button"
            className={metric === "count" ? "active" : ""}
            onClick={() => setMetric("count")}
          >
            Policies (#)
          </button>
        </div>
      </div>

      <div className="dash-hero-svg-wrap">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="dash-hero-svg"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="heroAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
            </linearGradient>
            <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1e40af" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* Gridlines & Y-Axis Labels */}
          {[0, 0.33, 0.66, 1].map((ratio) => {
            const y = paddingTop + plotHeight * (1 - ratio);
            const labelVal = maxValue * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  className="dash-chart-gridline"
                />
                <text x={paddingLeft - 10} y={y + 3.5} className="dash-chart-axis-y">
                  {metric === "premium" ? formatCompactMoney(labelVal) : Math.round(labelVal)}
                </text>
              </g>
            );
          })}

          {/* Area & Curved Line */}
          {areaPath ? <path d={areaPath} fill="url(#heroAreaGradient)" /> : null}
          {linePath ? (
            <path
              d={linePath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#heroShadow)"
            />
          ) : null}

          {/* Nodes & Hover Tooltips */}
          {points.map((pt, idx) => {
            const isHovered = activeHoverIndex === idx;
            const stepSkip = points.length > 18 ? 3 : points.length > 10 ? 2 : 1;
            const showLabel = points.length <= 12 ? true : idx % stepSkip === 0;

            return (
              <g
                key={pt.month_key || pt.monthKey || pt.monthLabel || idx}
                className="dash-chart-node"
                onMouseEnter={() => setHoveredIndex(idx)}
              >
                {isHovered ? (
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={paddingTop + plotHeight}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                ) : null}

                {showLabel ? (
                  <text
                    x={pt.x}
                    y={height - 8}
                    className={`dash-chart-axis-x ${isHovered ? "active" : ""}`}
                  >
                    {getShortMonthLabel(pt)}
                  </text>
                ) : null}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : points.length > 16 ? 3 : 4}
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth={isHovered ? 2.5 : 1.8}
                  className="dash-chart-dot"
                />

                {isHovered ? (
                  <g transform={`translate(${Math.min(Math.max(pt.x, 70), width - 70)}, ${Math.max(pt.y - 42, 10)})`}>
                    <rect
                      x="-65"
                      y="-8"
                      width="130"
                      height="34"
                      rx="6"
                      fill="#0f172a"
                      filter="drop-shadow(0 4px 8px rgba(15,23,42,0.25))"
                    />
                    <text x="0" y="5" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontWeight="600">
                      {pt.monthLabel || pt.shortMonth}
                    </text>
                    <text x="0" y="18" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">
                      {metric === "premium" ? formatMoney(pt.totalPremium) : `${pt.policyCount} Policies`}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="dash-hero-footer">
        <div className="dash-hero-stat-pill">
          <TrendingUp size={15} className="text-blue-600" />
          <span>
            {focusedMonthItem.monthLabel || focusedMonthItem.shortMonth || "Focused Month"}:{" "}
            <strong>{formatMoney(focusedMonthItem.totalPremium || 0)}</strong> ({focusedMonthItem.policyCount || 0} pol)
          </span>
        </div>
        <div className="dash-hero-stat-pill">
          <Layers size={15} className="text-indigo-600" />
          <span>
            {periodInfo.label || "Period Total"}: <strong>{formatMoney(totalPeriodPremium)}</strong> ({totalPeriodCount} pol)
          </span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Line of Business / Portfolio Mix (Left Column)
// -------------------------------------------------------------
function PortfolioMixCard({ categories = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const cleanCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        { category: "Motor - Private Car", count: 0, totalPremium: 0 },
        { category: "Motor - Two Wheeler", count: 0, totalPremium: 0 },
        { category: "Health Insurance", count: 0, totalPremium: 0 },
        { category: "Commercial & Fire", count: 0, totalPremium: 0 },
      ];
    }
    return categories.slice(0, 5);
  }, [categories]);

  const totalCount = cleanCategories.reduce((acc, c) => acc + c.count, 0) || 1;

  const size = 140;
  const center = size / 2;
  const radius = 54;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const slices = cleanCategories.map((item, idx) => {
    const fraction = totalCount > 0 ? item.count / totalCount : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += fraction * circumference;
    const color = PALETTE[idx % PALETTE.length];
    return {
      ...item,
      cleanName: normalizeCategoryName(item.category),
      fraction,
      percentage: Math.round(fraction * 100),
      strokeDasharray,
      strokeDashoffset,
      color,
    };
  });

  const activeItem = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div>
          <div className="dash-card-tag">PORTFOLIO MIX</div>
          <h3 className="dash-card-title">Line of Business Split</h3>
          <p className="dash-card-subtitle">Active distribution by policy type</p>
        </div>
        <PieChart size={18} className="text-slate-400" />
      </div>

      <div className="dash-portfolio-layout">
        <div className="dash-donut-box">
          <svg viewBox={`0 0 ${size} ${size}`} className="dash-donut-svg">
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {slices.map((slice, idx) => (
              <circle
                key={slice.category}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={hoveredIdx === idx ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                className="dash-donut-slice"
                transform={`rotate(-90 ${center} ${center})`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}
          </svg>
          <div className="dash-donut-inner">
            {activeItem ? (
              <>
                <span className="dash-donut-pct" style={{ color: activeItem.color }}>{activeItem.percentage}%</span>
                <span className="dash-donut-lbl">{activeItem.count} Pol</span>
              </>
            ) : (
              <>
                <span className="dash-donut-total">{totalCount}</span>
                <span className="dash-donut-lbl">PORTFOLIO</span>
              </>
            )}
          </div>
        </div>

        <div className="dash-portfolio-list">
          {slices.map((slice, idx) => (
            <div
              key={slice.category}
              className={`dash-portfolio-row ${hoveredIdx === idx ? "active" : ""}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span className="dash-row-dot" style={{ backgroundColor: slice.color }} />
              <div className="dash-row-details">
                <span className="dash-row-title" title={slice.category}>{slice.cleanName}</span>
                <span className="dash-row-sub">{slice.count} policies • {formatCompactMoney(slice.totalPremium)}</span>
              </div>
              <span
                className="dash-row-badge"
                style={{
                  color: slice.color,
                  backgroundColor: `${slice.color}14`,
                }}
              >
                {slice.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-hero-footer">
        <div className="dash-hero-stat-pill">
          <PieChart size={15} className="text-blue-600" />
          <span>Top Share: <strong>{slices[0]?.cleanName || "Motor"}</strong> ({slices[0]?.percentage || 0}%)</span>
        </div>
        <div className="dash-hero-stat-pill">
          <Layers size={15} className="text-emerald-600" />
          <span>Total Active: <strong>{totalCount} Policies</strong></span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Top Insurers Market Share (Right Column)
// -------------------------------------------------------------
function TopInsurersCard({ insurers = [] }) {
  const cleanInsurers = useMemo(() => {
    if (!insurers || insurers.length === 0) {
      return [
        { insurer: "ICICI Lombard", count: 0, totalPremium: 0 },
        { insurer: "Tata AIG", count: 0, totalPremium: 0 },
        { insurer: "HDFC ERGO", count: 0, totalPremium: 0 },
        { insurer: "Bajaj Allianz", count: 0, totalPremium: 0 },
        { insurer: "New India Assurance", count: 0, totalPremium: 0 },
      ];
    }
    return insurers.slice(0, 5);
  }, [insurers]);

  const totalInsurersPremium = cleanInsurers.reduce((acc, i) => acc + (i.totalPremium || 0), 0) || 1;
  const topPartner = cleanInsurers[0] || {};

  const PARTNER_THEMES = [
    {
      bg: "linear-gradient(90deg, #fffbeb 0%, #ffffff 100%)",
      border: "#fde68a",
      accent: "#f59e0b",
      badgeBg: "#fef3c7",
      badgeColor: "#b45309",
      pillBg: "#fef3c7",
      pillColor: "#b45309",
      emoji: "🏆",
    },
    {
      bg: "linear-gradient(90deg, #ecfdf5 0%, #ffffff 100%)",
      border: "#a7f3d0",
      accent: "#10b981",
      badgeBg: "#d1fae5",
      badgeColor: "#065f46",
      pillBg: "#d1fae5",
      pillColor: "#047857",
      emoji: "2",
    },
    {
      bg: "linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)",
      border: "#bfdbfe",
      accent: "#3b82f6",
      badgeBg: "#dbeafe",
      badgeColor: "#1e40af",
      pillBg: "#dbeafe",
      pillColor: "#1d4ed8",
      emoji: "3",
    },
    {
      bg: "linear-gradient(90deg, #faf5ff 0%, #ffffff 100%)",
      border: "#e9d5ff",
      accent: "#8b5cf6",
      badgeBg: "#f3e8ff",
      badgeColor: "#6b21a8",
      pillBg: "#f3e8ff",
      pillColor: "#7c3aed",
      emoji: "4",
    },
    {
      bg: "linear-gradient(90deg, #fff1f2 0%, #ffffff 100%)",
      border: "#fecdd3",
      accent: "#f43f5e",
      badgeBg: "#ffe4e6",
      badgeColor: "#9f1239",
      pillBg: "#ffe4e6",
      pillColor: "#e11d48",
      emoji: "5",
    },
  ];

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div>
          <div className="dash-card-tag">MARKET SHARE</div>
          <h3 className="dash-card-title">Top Insurance Partners</h3>
          <p className="dash-card-subtitle">Ranked by gross written premium</p>
        </div>
        <Briefcase size={18} className="text-slate-400" />
      </div>

      <div className="dash-partner-list">
        {cleanInsurers.map((item, idx) => {
          const cleanName = normalizeCompanyName(item.insurer);
          const sharePct = Math.round((item.totalPremium / totalInsurersPremium) * 100);
          const theme = PARTNER_THEMES[idx] || PARTNER_THEMES[3];

          return (
            <div
              key={item.insurer}
              className="dash-partner-card"
              style={{
                background: theme.bg,
                borderColor: theme.border,
                borderLeftColor: theme.accent,
                borderLeftWidth: "4px",
              }}
            >
              <div
                className="dash-partner-rank-badge"
                style={{
                  background: theme.badgeBg,
                  color: theme.badgeColor,
                  borderColor: theme.border,
                }}
              >
                {theme.emoji}
              </div>

              <div className="dash-partner-info">
                <strong className="dash-partner-name" title={item.insurer}>
                  {cleanName}
                </strong>
                <span className="dash-partner-sub">
                  {item.count} policies • <span className="dash-partner-share-tag" style={{ color: theme.pillColor, backgroundColor: theme.pillBg }}>{sharePct}% share</span>
                </span>
              </div>

              <div className="dash-partner-metrics">
                <strong className="dash-partner-money" style={{ color: "#0f172a" }}>
                  {formatMoney(item.totalPremium)}
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dash-hero-footer">
        <div className="dash-hero-stat-pill">
          <Award size={15} className="text-amber-500" />
          <span>Top Lead: <strong>{normalizeCompanyName(topPartner.insurer)}</strong> ({formatCompactMoney(topPartner.totalPremium)})</span>
        </div>
        <div className="dash-hero-stat-pill">
          <Briefcase size={15} className="text-blue-600" />
          <span>Total Partners: <strong>{cleanInsurers.length} Active</strong></span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Renewal Retention Engine (Lifecycle)
// -------------------------------------------------------------
function RenewalRetentionEngine({ summary = {}, premium = {} }) {
  const renewed = summary.renewedPolicies || 0;
  const lost = summary.lostPolicies || 0;
  const pending = summary.pendingRenewals || 0;
  const expiringToday = summary.expiringToday || 0;
  const expiring7 = summary.expiring7Days || 0;
  const expiring30 = summary.expiring30Days || 0;

  const totalClosed = renewed + lost;
  const retentionRate = totalClosed > 0 ? Math.round((renewed / totalClosed) * 100) : 0;
  const maxBarVal = Math.max(expiringToday, expiring7, expiring30, renewed, lost, 1);

  const horizonBars = [
    {
      key: "today",
      label: "Today",
      val: expiringToday,
      status: expiringToday > 0 ? "Action Due" : "Clear",
      color: "#f43f5e",
      bg: "#ffe4e6",
      icon: <AlertCircle size={15} className="text-rose-500" />,
      href: "/dashboard/renewals/policies?tab=due_today",
    },
    {
      key: "due_7",
      label: "7 Days",
      val: expiring7,
      status: "High Priority",
      color: "#f59e0b",
      bg: "#fef3c7",
      icon: <Zap size={15} className="text-amber-500" />,
      href: "/dashboard/renewals/policies?tab=due_7",
    },
    {
      key: "due_30",
      label: "30 Days",
      val: expiring30,
      status: "Upcoming",
      color: "#3b82f6",
      bg: "#dbeafe",
      icon: <Calendar size={15} className="text-blue-500" />,
      href: "/dashboard/renewals/policies?tab=due_30",
    },
    {
      key: "renewed",
      label: "Saved",
      val: renewed,
      status: `${retentionRate}% Retained`,
      color: "#10b981",
      bg: "#d1fae5",
      icon: <CheckCircle2 size={15} className="text-emerald-500" />,
      href: "/dashboard/renewals/renewed",
    },
  ];

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <div>
          <div className="dash-card-tag">RETENTION ENGINE</div>
          <h3 className="dash-card-title">Renewal Pipeline & Retention Graph</h3>
          <p className="dash-card-subtitle">Horizon distribution & policy retention velocity</p>
        </div>
        <Link href="/dashboard/renewals/policies" className="dash-card-link" prefetch={false}>
          Renewal Hub <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="dash-rn-meter-layout">
        {/* Left Side: Circular Retention Gauge & Quick Stats */}
        <div className="dash-rn-meter-gauge">
          <div className="dash-rn-gauge-ring">
            <svg viewBox="0 0 88 88" className="dash-rn-ring-svg">
              <circle cx="44" cy="44" r="35" className="dash-rn-ring-track" />
              <circle
                cx="44"
                cy="44"
                r="35"
                className="dash-rn-ring-fill"
                style={{
                  strokeDasharray: 220,
                  strokeDashoffset: 220 - (Math.min(retentionRate, 100) / 100) * 220,
                }}
              />
            </svg>
            <div className="dash-rn-ring-center">
              <span className="dash-rn-ring-pct">{retentionRate}%</span>
              <span className="dash-rn-ring-lbl">RETENTION</span>
            </div>
          </div>

          <div className="dash-rn-meter-capsules">
            <div className="dash-rn-cap-item retained">
              <span className="dash-rn-cap-label">RETAINED</span>
              <strong className="dash-rn-cap-val">{formatCompactMoney(premium.renewedPremium || 0)}</strong>
            </div>
            <div className="dash-rn-cap-item pipeline">
              <span className="dash-rn-cap-label">PIPELINE</span>
              <strong className="dash-rn-cap-val">{pending} pol</strong>
            </div>
          </div>
        </div>

        {/* Right Side: Horizontal Horizon Progress Graph */}
        <div className="dash-rn-meter-bars">
          {horizonBars.map((bar) => {
            const ratio = Math.max(Math.round((bar.val / maxBarVal) * 100), bar.val > 0 ? 8 : 2);

            return (
              <Link
                key={bar.key}
                href={bar.href}
                className="dash-rn-meter-row"
                prefetch={false}
              >
                <div className="dash-rn-meter-icon-wrap" style={{ backgroundColor: bar.bg }}>
                  {bar.icon}
                </div>

                <div className="dash-rn-meter-main">
                  <div className="dash-rn-meter-head">
                    <span className="dash-rn-meter-label">{bar.label}</span>
                    <span className="dash-rn-meter-status" style={{ color: bar.color }}>
                      {bar.status}
                    </span>
                  </div>
                  <div className="dash-rn-meter-track">
                    <div
                      className="dash-rn-meter-fill"
                      style={{
                        width: `${ratio}%`,
                        backgroundColor: bar.color,
                      }}
                    />
                  </div>
                </div>

                <div className="dash-rn-meter-badge">
                  <strong className="dash-rn-meter-val" style={{ color: bar.color }}>
                    {bar.val}
                  </strong>
                  <span className="dash-rn-meter-unit">pol</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="dash-hero-footer">
        <div className="dash-hero-stat-pill">
          <Clock3 size={15} className="text-amber-500" />
          <span>7-Day Attention: <strong>{expiring7} Policies</strong></span>
        </div>
        <div className="dash-hero-stat-pill">
          <ShieldCheck size={15} className="text-emerald-600" />
          <span>Retention Benchmark: <strong>{retentionRate}%</strong></span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Agent Contribution & Lead Outcomes Table Card
// -------------------------------------------------------------
function AgentContributionTableCard({ report = null }) {
  const agents = report?.agents || [];
  const summary = report?.summary || {};
  const totalAgents = report?.totalAgents || agents.length || 0;
  const maxLeads = Math.max(1, ...agents.map((a) => a.totalLeads || 0));

  const pct = (val, total) => {
    if (!total) return 0;
    return Math.round(((Number(val) || 0) / total) * 100);
  };

  const formatAgentDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  return (
    <div className="dash-card dash-agent-table-card">
      <div className="dash-card-header">
        <div>
          <div className="dash-card-tag">EXECUTIVE PERFORMANCE AUDIT</div>
          <h3 className="dash-card-title">Agent Contribution & Lead Conversion Outcomes</h3>
          <p className="dash-card-subtitle">Comprehensive team leaderboard, active pipeline status & conversion velocity</p>
        </div>
        <Link href="/dashboard/reports/lead-generation" className="dash-card-link" prefetch={false}>
          Command Center Report <ChevronRight size={14} />
        </Link>
      </div>

      {/* Top Mini Summary KPI Strip */}
      <div className="dash-agent-kpi-strip">
        <div className="dash-agent-kpi-box">
          <span className="dash-agent-kpi-lbl">ACTIVE CREATORS</span>
          <strong className="dash-agent-kpi-val text-blue-700">{totalAgents} Agents</strong>
        </div>
        <div className="dash-agent-kpi-divider" />
        <div className="dash-agent-kpi-box">
          <span className="dash-agent-kpi-lbl">TOTAL PIPELINE LEADS</span>
          <strong className="dash-agent-kpi-val text-indigo-700">{summary.totalLeads || agents.reduce((s, a) => s + (a.totalLeads || 0), 0)} Leads</strong>
        </div>
        <div className="dash-agent-kpi-divider" />
        <div className="dash-agent-kpi-box">
          <span className="dash-agent-kpi-lbl">TOP CONTRIBUTOR</span>
          <strong className="dash-agent-kpi-val text-amber-700">{agents[0]?.agentName || "Pragati Pandey"} ({agents[0]?.totalLeads || 0})</strong>
        </div>
        <div className="dash-agent-kpi-divider" />
        <div className="dash-agent-kpi-box">
          <span className="dash-agent-kpi-lbl">OVERALL CONVERSION</span>
          <strong className="dash-agent-kpi-val text-emerald-700">{summary.conversionRate || 0}% Closed</strong>
        </div>
      </div>

      {/* Rich Interactive Table */}
      <div className="dash-agent-table-wrap">
        <table className="dash-agent-table">
          <thead>
            <tr>
              <th style={{ width: "38px", textAlign: "center" }}>#</th>
              <th>AGENT</th>
              <th>TOTAL LEADS</th>
              <th>OPEN</th>
              <th>NEW</th>
              <th>FOLLOW-UP</th>
              <th>INTERESTED</th>
              <th>CONVERTED</th>
              <th>CONV. RATE</th>
              <th>LOST</th>
              <th>LATEST ACTIVITY</th>
            </tr>
          </thead>
          <tbody>
            {agents && agents.length > 0 ? (
              agents.map((agent, index) => {
                const convRate = pct(agent.converted, agent.totalLeads);
                const sharePct = Math.round(((agent.totalLeads || 0) / maxLeads) * 100);

                return (
                  <tr key={agent.agentId || agent.agentName || index} className="dash-agent-table-row">
                    {/* Rank Badge */}
                    <td className="dash-agent-cell-rank">
                      <span className={`dash-rank-badge rank-${index + 1}`}>
                        {index + 1}
                      </span>
                    </td>

                    {/* Agent Name + Email */}
                    <td className="dash-agent-cell-profile">
                      <div className="dash-agent-profile-meta">
                        <Link
                          href={`/operations/lead-generation?createdById=${encodeURIComponent(agent.agentId || "unassigned")}`}
                          prefetch={false}
                          className="dash-agent-name-link"
                        >
                          <strong>{agent.agentName || "Unnamed Agent"}</strong>
                        </Link>
                        <span className="dash-agent-email">{agent.agentEmail || "No linked user"}</span>
                      </div>
                    </td>

                    {/* Total Leads + Share Bar */}
                    <td className="dash-agent-cell-total">
                      <div className="dash-total-leads-wrap">
                        <strong className="dash-total-num">{agent.totalLeads || 0}</strong>
                        <div className="dash-mini-share-track" title={`${sharePct}% of top creator`}>
                          <div className="dash-mini-share-fill" style={{ width: `${sharePct}%` }} />
                        </div>
                      </div>
                    </td>

                    {/* Status Breakdown Pills */}
                    <td>
                      <span className="dash-status-pill open">{agent.openLeads || 0}</span>
                    </td>
                    <td>
                      <span className="dash-status-pill new">{agent.newLeads || 0}</span>
                    </td>
                    <td>
                      <span className={`dash-status-pill followup ${Number(agent.followUpRequired) > 0 ? "highlight" : ""}`}>
                        {agent.followUpRequired || 0}
                      </span>
                    </td>
                    <td>
                      <span className="dash-status-pill interested">{agent.interested || 0}</span>
                    </td>
                    <td>
                      <span className={`dash-status-pill converted ${Number(agent.converted) > 0 ? "highlight" : ""}`}>
                        {agent.converted || 0}
                      </span>
                    </td>

                    {/* Conversion Rate */}
                    <td>
                      <div className={`dash-conv-badge ${convRate > 0 ? "positive" : "neutral"}`}>
                        <span>{convRate}%</span>
                      </div>
                    </td>

                    {/* Lost */}
                    <td>
                      <span className="dash-status-pill lost">{agent.lost || 0}</span>
                    </td>

                    {/* Latest Activity */}
                    <td className="dash-agent-cell-date">
                      <span className="dash-activity-date">
                        <Calendar size={11} className="text-slate-400" />
                        {formatAgentDate(agent.latestLeadAt)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="dash-table-empty-row">
                  <div className="dash-feed-empty">
                    <Users size={24} className="text-slate-400" />
                    <p>No lead activity recorded by agents yet.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="dash-agent-table-footer">
        <span className="dash-footer-badge">Showing {agents.length} of {totalAgents} active agents</span>
        <span className="dash-footer-hint">Click on any agent name to filter active pipeline records</span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Immediate Action Radar Banner
// -------------------------------------------------------------
function ImmediateActionRadar({ summary = {} }) {
  const hasReview = summary.needsReview > 0;
  const hasFailed = summary.failedExtractions > 0;
  const hasOverdue = summary.overdueFollowUps > 0;
  const hasClaims = summary.pendingClaims > 0;

  if (!hasReview && !hasFailed && !hasOverdue && !hasClaims) return null;

  return (
    <section className="dash-radar-strip">
      <div className="dash-radar-info">
        <span className="dash-radar-tag"><Zap size={13} /> ACTION RADAR</span>
        <p>Operational tasks requiring team attention</p>
      </div>
      <div className="dash-radar-pills">
        {hasReview ? (
          <Link href="/policy-records?review=needs_review" className="dash-radar-badge tone-purple" prefetch={false}>
            <AlertCircle size={14} />
            <span>PDFs Under Review: <strong>{summary.needsReview}</strong></span>
          </Link>
        ) : null}
        {hasFailed ? (
          <Link href="/policy-records?review=extraction_failed" className="dash-radar-badge tone-red" prefetch={false}>
            <AlertTriangle size={14} />
            <span>Extraction Failed: <strong>{summary.failedExtractions}</strong></span>
          </Link>
        ) : null}
        {hasOverdue ? (
          <Link href="/dashboard/renewals/follow-ups?filter=overdue" className="dash-radar-badge tone-amber" prefetch={false}>
            <Clock3 size={14} />
            <span>Overdue Follow-ups: <strong>{summary.overdueFollowUps}</strong></span>
          </Link>
        ) : null}
        {hasClaims ? (
          <Link href="/operations/claims-management?filter=pending" className="dash-radar-badge tone-amber" prefetch={false}>
            <AlertCircle size={14} />
            <span>Pending Survey: <strong>{summary.pendingClaims}</strong></span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Main Dashboard Overview Component
// -------------------------------------------------------------
export default function DashboardOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState("YTD");
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [periodInfo, setPeriodInfo] = useState({ label: "Year 2026", startIso: null, endIso: null });

  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [premium, setPremium] = useState(EMPTY_PREMIUM);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [insurerBreakdown, setInsurerBreakdown] = useState([]);
  const [leadAgentReport, setLeadAgentReport] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboard = useCallback(async (signal) => {
    setIsRefreshing(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedPeriod) params.set("period", selectedPeriod);
      if (selectedMonth && selectedMonth !== "ALL") params.set("month", selectedMonth);
      if (selectedCategory && selectedCategory !== "ALL") params.set("category", selectedCategory);

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const headerQueryStr = params.toString() ? `?summaryOnly=true&${params.toString()}` : "?summaryOnly=true";

      const [overviewData, reportingData] = await Promise.all([
        fetchJson(`/api/dashboard/overview${queryStr}`, signal),
        fetchJson(`/api/dashboard/header-data${headerQueryStr}`, signal),
      ]);

      const headerCounts = reportingData.renewalCounts || {};
      const newSummary = {
        ...EMPTY_SUMMARY,
        ...(overviewData.summary || {}),
        expiringToday: Number(headerCounts.due10 || 0),
        expiring7Days: Number(headerCounts.due20 || 0),
        expiring30Days: Number(headerCounts.due30 || 0),
        pendingRenewals: Number(headerCounts.due30 || 0),
        renewedPolicies: Number(headerCounts.renewed || 0),
        lostPolicies: Number(headerCounts.lost || 0),
      };

      const newPremium = {
        ...EMPTY_PREMIUM,
        ...headerCounts,
        periodPremium: overviewData.summary?.totalPremium || 0,
        periodCount: overviewData.summary?.activePolicies || 0,
      };

      const newTrends = overviewData.monthlyTrends || [];
      const newCats = overviewData.categoryBreakdown || [];
      const newInsurers = overviewData.insurerBreakdown || [];
      const newAgentReport = overviewData.leadAgentReport || null;
      const newPeriodInfo = overviewData.periodBounds || { label: "Active Period" };

      setSummary(newSummary);
      setPremium(newPremium);
      setMonthlyTrends(newTrends);
      setCategoryBreakdown(newCats);
      setInsurerBreakdown(newInsurers);
      setLeadAgentReport(newAgentReport);
      setPeriodInfo(newPeriodInfo);
    } catch (loadError) {
      if (loadError?.name !== "AbortError") {
        setError(loadError?.message || "Dashboard data could not be loaded.");
      }
    } finally {
      if (!signal.aborted) setIsRefreshing(false);
    }
  }, [selectedPeriod, selectedMonth, selectedCategory]);

  useEffect(() => {
    const controller = new globalThis.AbortController();
    loadDashboard(controller.signal);
    return () => controller.abort();
  }, [loadDashboard, refreshKey]);

  return (
    <div className="dashboard-overview dash-modern-tower">
      {error ? (
        <div className="dash-error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>
            Retry
          </button>
        </div>
      ) : null}

      {/* 1. Header Command Tower with Global Time-Machine Controls */}
      <header className="dash-tower-head">
        <div className="dash-tower-title-group">
          <div className="dash-live-badge">
            <span className={`dash-live-dot ${isRefreshing ? "spin" : ""}`} />
            <span>{isRefreshing ? "SYNCING LIVE DATA..." : "LIVE CRM COMMAND TOWER"}</span>
          </div>
          <h1>Executive Dashboard & Analytics</h1>
          <p>Real-time production trajectory, active portfolio breakdown, and operational control.</p>
        </div>

        <div className="dash-tower-actions">
          {/* Global Period & Category Selectors */}
          <div className="dash-tower-filters">
            <div className="dash-global-select-wrap">
              <Calendar size={14} className="text-blue-600" />
              <select
                className="dash-global-select"
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  setSelectedMonth("ALL");
                }}
                aria-label="Select Dashboard Reporting Period"
              >
                <option value="TODAY">Today (Daily / EOD)</option>
                <option value="MTD">This Month (MTD)</option>
                <option value="YTD">Year 2026 (YTD)</option>
                <option value="2025">Year 2025 (Full Year)</option>
                <option value="2024">Year 2024 (Full Year)</option>
                <option value="LAST_30">Last 30 Days</option>
                <option value="LAST_90">Last 90 Days</option>
                <option value="ALL">All Time (Historical)</option>
              </select>
            </div>

            {/* Optional Specific Month Filter */}
            <div className="dash-global-select-wrap">
              <select
                className="dash-global-select no-icon"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Filter by Specific Month"
              >
                <option value="ALL">All Months</option>
                <option value="1">Jan (01)</option>
                <option value="2">Feb (02)</option>
                <option value="3">Mar (03)</option>
                <option value="4">Apr (04)</option>
                <option value="5">May (05)</option>
                <option value="6">Jun (06)</option>
                <option value="7">Jul (07)</option>
                <option value="8">Aug (08)</option>
                <option value="9">Sep (09)</option>
                <option value="10">Oct (10)</option>
                <option value="11">Nov (11)</option>
                <option value="12">Dec (12)</option>
              </select>
            </div>

            {/* Policy Type / Category Filter */}
            <div className="dash-global-select-wrap">
              <select
                className="dash-global-select no-icon"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by Policy Type"
              >
                <option value="ALL">All Policy Types</option>
                <option value="MOTOR">Motor Insurance</option>
                <option value="FIRE">Fire Insurance</option>
                <option value="WAREHOUSE">Warehouse Insurance</option>
                <option value="HEALTH">Health Insurance</option>
                <option value="COMMERCIAL">Commercial Insurance</option>
                <option value="BURGLARY">Burglary Insurance</option>
              </select>
            </div>

            <div className="dash-global-period-pill">
              <Sparkles size={13} className="text-blue-600" />
              <span>
                {selectedCategory !== "ALL" ? `${selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase()} • ` : ""}
                {periodInfo.label || "Active Period"}
              </span>
            </div>
          </div>

          <Link href="/manual-policy-entry" className="dash-btn-primary" prefetch={false}>
            <Sparkles size={15} /> Add Policy
          </Link>
          <Link href="/bulk-upload" className="dash-btn-secondary" prefetch={false}>
            <FileText size={15} /> Upload PDF
          </Link>
          <button
            type="button"
            className="dash-btn-refresh"
            onClick={() => setRefreshKey((value) => value + 1)}
            title="Refresh Data"
          >
            <RefreshCw size={15} className={isRefreshing ? "spin" : ""} />
          </button>
        </div>
      </header>

      {/* 2. Top Executive KPI Strip */}
      <ExecutiveKpiStrip summary={summary} premium={premium} periodLabel={periodInfo.label} />

      {/* 3. Action Radar (if urgent items exist) */}
      <ImmediateActionRadar summary={summary} />

      {/* 4. Balanced Primary Hero Grid: Production Trajectory (60%) + Portfolio Mix Donut (40%) */}
      <div className="dash-hero-grid">
        <ProductionTrajectoryChart trends={monthlyTrends} periodInfo={periodInfo} />
        <PortfolioMixCard categories={categoryBreakdown} />
      </div>

      {/* 5. Market & Retention Operations Grid */}
      <div className="dash-two-col-grid">
        <TopInsurersCard insurers={insurerBreakdown} />
        <RenewalRetentionEngine summary={summary} premium={premium} />
      </div>

      {/* 6. Agent Contribution & Lead Outcomes Table */}
      <AgentContributionTableCard report={leadAgentReport} />
    </div>
  );
}
