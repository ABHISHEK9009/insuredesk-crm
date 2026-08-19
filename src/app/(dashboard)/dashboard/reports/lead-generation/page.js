export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSessionFromCookies } from "@/lib/records/scoped-data";
import { loadLeadAgentReport } from "@/lib/reports/lead-generation";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

function pct(value, total) {
  if (!total) return 0;
  return Math.round(((Number(value) || 0) / total) * 100);
}

export default async function LeadGenerationReportPage({ searchParams }) {
  const session = await getCurrentSessionFromCookies();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/dashboard");

  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page || "1", 10) || 1);
  const q = String(query.q || "").trim();
  const report = await loadLeadAgentReport({ session, page, limit: 25, q });
  const summary = report.summary || {};
  const statusRows = [
    { label: "New", value: summary.newLeads || 0, tone: "blue", href: "/operations/lead-generation?status=New%20Lead" },
    { label: "Follow-up", value: summary.followUpRequired || 0, tone: "amber", href: "/operations/lead-generation?status=Follow-up%20Required" },
    { label: "Interested", value: summary.interested || 0, tone: "violet", href: "/operations/lead-generation?status=Interested" },
    { label: "Converted", value: summary.converted || 0, tone: "green", href: "/operations/lead-generation?status=Converted" },
    { label: "Lost", value: summary.lost || 0, tone: "red", href: "/operations/lead-generation?status=Lost" },
  ];
  const bestAgentRate = report.topAgent?.totalLeads
    ? Math.round(((report.topAgent.converted || 0) / report.topAgent.totalLeads) * 100)
    : 0;
  const pageHref = (targetPage) => {
    const values = new globalThis.URLSearchParams();
    if (q) values.set("q", q);
    if (targetPage > 1) values.set("page", String(targetPage));
    return values.size ? `?${values}` : "?";
  };

  return (
    <main className="analytics-report-page lead-report-page">
      <header className="lead-report-compact-header">
        <div className="lead-report-header-info">
          <p className="eyebrow">Super Admin Reporting</p>
          <h1>Lead generation command center</h1>
          <p>Track lead volume, agent contribution, conversion movement, and pending follow-ups from the live lead database.</p>
        </div>
        <div className="lead-report-header-actions">
          <div className="lead-report-conversion-pill">
            <span>Overall Conversion:</span>
            <strong>{summary.conversionRate || 0}%</strong>
            <small>({formatNumber(summary.converted)} / {formatNumber(summary.totalLeads)})</small>
          </div>
          <Link className="primary-action" href="/operations/lead-generation" prefetch={false}>
            Open Leads Hub
          </Link>
          <Link className="secondary-action" href="/dashboard" prefetch={false}>
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="lead-report-kpi-grid">
        <div className="lead-report-kpi-card primary">
          <span>Total leads</span>
          <strong>{formatNumber(summary.totalLeads)}</strong>
          <small>{formatNumber(summary.createdThisMonth)} added this month</small>
        </div>
        <div className="lead-report-kpi-card">
          <span>Active agents</span>
          <strong>{formatNumber(summary.activeAgents)}</strong>
          <small>{formatNumber(summary.averageLeadsPerAgent)} average leads per agent</small>
        </div>
        <div className="lead-report-kpi-card warning">
          <span>Open pipeline</span>
          <strong>{formatNumber(summary.openLeads)}</strong>
          <small>{formatNumber(summary.followUpRequired)} waiting for follow-up</small>
        </div>
        <div className="lead-report-kpi-card success">
          <span>Converted</span>
          <strong>{formatNumber(summary.converted)}</strong>
          <small>{summary.conversionRate || 0}% conversion rate</small>
        </div>
        <div className="lead-report-kpi-card danger">
          <span>Lost leads</span>
          <strong>{formatNumber(summary.lost)}</strong>
          <small>{summary.lossRate || 0}% loss rate</small>
        </div>
      </section>

      <section className="lead-report-grid">
        <article className="glass-panel lead-report-card lead-report-funnel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Pipeline Funnel</p>
              <h2>Lead status distribution</h2>
            </div>
            <span className="lead-report-chip">{formatDate(summary.latestLeadAt)} latest lead</span>
          </div>
          <div className="lead-report-funnel-list">
            {statusRows.map((item) => (
              <Link className={`lead-report-bar ${item.tone}`} href={item.href} key={item.label} prefetch={false}>
                <span>{item.label}</span>
                <div><i style={{ width: `${pct(item.value, summary.totalLeads)}%` }} /></div>
                <strong>{formatNumber(item.value)}</strong>
                <small>{pct(item.value, summary.totalLeads)}%</small>
              </Link>
            ))}
          </div>
        </article>

        <article className="glass-panel lead-report-card lead-report-spotlight">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Performance Snapshot</p>
              <h2>Top agent and attention queue</h2>
            </div>
          </div>
          <div className="lead-report-spotlight-main">
            <span>Top contributor</span>
            <strong>{report.topAgent?.agentName || "No agent yet"}</strong>
            <p>
              {report.topAgent
                ? `${formatNumber(report.topAgent.totalLeads)} leads · ${bestAgentRate}% converted`
                : "No lead creators found for this report."}
            </p>
          </div>
          <div className="lead-report-attention-grid">
            <Link href="/operations/lead-generation?status=Follow-up%20Required" prefetch={false}>
              <span>Follow-ups pending</span>
              <strong>{formatNumber(summary.followUpRequired)}</strong>
            </Link>
            <Link href="/operations/lead-generation" prefetch={false}>
              <span>Overdue follow-ups</span>
              <strong>{formatNumber(summary.overdueFollowUps)}</strong>
            </Link>
            <Link href="/operations/lead-generation" prefetch={false}>
              <span>Due this week</span>
              <strong>{formatNumber(summary.dueThisWeek)}</strong>
            </Link>
            <Link href="/operations/lead-generation" prefetch={false}>
              <span>Created today</span>
              <strong>{formatNumber(summary.createdToday)}</strong>
            </Link>
          </div>
        </article>
      </section>

      <form className="glass-panel lead-report-filter" method="get">
        <label>
          <span>Search agent report</span>
          <input name="q" defaultValue={q} placeholder="Search by agent name or email" />
        </label>
        <button className="primary-action" type="submit">Apply Filter</button>
        {q ? <Link className="secondary-action" href="/dashboard/reports/lead-generation">Clear</Link> : null}
      </form>

      <section className="glass-panel report-detail-table">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Agent Contribution</p>
            <h2>Agent-wise reporting and outcomes</h2>
            <p className="lead-report-table-note">Sorted by highest lead contribution with direct drilldown into each agent.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="records-table lead-report-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Total Leads</th>
                <th>Open</th>
                <th>New</th>
                <th>Follow-up</th>
                <th>Interested</th>
                <th>Converted</th>
                <th>Conv. Rate</th>
                <th>Lost</th>
                <th>Latest Lead</th>
              </tr>
            </thead>
            <tbody>
              {report.agents.length ? report.agents.map((agent) => (
                <tr key={agent.agentId || "unassigned"}>
                  <td className="lead-agent-name-cell">
                    <Link href={`/operations/lead-generation?createdById=${encodeURIComponent(agent.agentId || "unassigned")}`} prefetch={false}>
                      <strong>{agent.agentName}</strong>
                    </Link>
                    <small>{agent.agentEmail || "No linked user"}</small>
                  </td>
                  <td><strong>{agent.totalLeads}</strong></td>
                  <td>{agent.openLeads}</td>
                  <td>{agent.newLeads}</td>
                  <td>{agent.followUpRequired}</td>
                  <td>{agent.interested}</td>
                  <td>{agent.converted}</td>
                  <td>
                    <span className="lead-report-rate">{pct(agent.converted, agent.totalLeads)}%</span>
                  </td>
                  <td>{agent.lost}</td>
                  <td>{formatDate(agent.latestLeadAt)}</td>
                </tr>
              )) : (
                <tr><td colSpan="10">No lead creators match this report.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Page {report.page} of {report.totalPages} · {report.totalAgents} agents</span>
          <div className="pagination-actions">
            {report.page > 1 ? <Link className="secondary-action" href={pageHref(report.page - 1)}>Previous</Link> : null}
            {report.page < report.totalPages ? <Link className="secondary-action" href={pageHref(report.page + 1)}>Next</Link> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
