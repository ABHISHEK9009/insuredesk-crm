import { prisma } from "@/lib/db/prisma";
import { verifyJWT } from "@/lib/auth";
import { getTenantFilter } from "@/lib/auth/rbac";
import { MANUAL_RENEWAL_SQL_EXCLUSION } from "@/lib/records/manual-renewal-source";
import { normalizeUploadStatus, UPLOAD_STATUS } from "@/lib/uploads/status";
import { loadLeadAgentReport } from "@/lib/reports/lead-generation";

export const dynamic = "force-dynamic";

function tenantSql(session) {
  return [session.role === "SUPER_ADMIN", session.organizationId ?? null];
}

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const session = await verifyJWT(token);
    if (!session) return Response.json({ error: "Invalid or expired session" }, { status: 401 });

    const [isSuperAdmin, organizationId] = tenantSql(session);
    const sqlParams = [isSuperAdmin, organizationId];
    const tenantFilter = getTenantFilter(session, "read");

    const policySummaryQuery = `
      WITH active_records AS (
        SELECT
          COALESCE(
            NULLIF(BTRIM(reviewed_data->>'insuredName'), ''),
            NULLIF(BTRIM(data->>'insuredName'), ''),
            NULLIF(BTRIM(reviewed_data->>'customerName'), ''),
            NULLIF(BTRIM(data->>'customerName'), ''),
            NULLIF(BTRIM(reviewed_data->>'Insured Name'), ''),
            NULLIF(BTRIM(data->>'Insured Name'), ''),
            'Unnamed insured'
          ) AS customer_name,
          is_active_policy
        FROM pdf_records
        WHERE deleted_at IS NULL
          AND ($1::boolean OR organization_id IS NOT DISTINCT FROM $2::uuid)
          ${MANUAL_RENEWAL_SQL_EXCLUSION}
          AND COALESCE(source_file, '') != 'generic_renewal_template.xlsx'
          AND COALESCE(pdf_file_name, '') != 'generic_renewal_template.xlsx'
      )
      SELECT
        COUNT(*) FILTER (WHERE is_active_policy = true)::integer AS active_policies,
        COUNT(DISTINCT customer_name) FILTER (WHERE is_active_policy = true)::integer AS total_customers
      FROM active_records
    `;

    const monthlyTrendsQuery = `
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month_key,
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS short_month,
        TO_CHAR(DATE_TRUNC('month', created_at), 'Month YYYY') AS month_label,
        COUNT(*)::integer AS policy_count,
        COALESCE(SUM(
          COALESCE(
            NULLIF(REGEXP_REPLACE(reviewed_data->>'totalPremium', '[^0-9.]', '', 'g'), '')::numeric,
            NULLIF(REGEXP_REPLACE(data->>'totalPremium', '[^0-9.]', '', 'g'), '')::numeric,
            NULLIF(REGEXP_REPLACE(reviewed_data->>'netPremium', '[^0-9.]', '', 'g'), '')::numeric,
            NULLIF(REGEXP_REPLACE(data->>'netPremium', '[^0-9.]', '', 'g'), '')::numeric,
            0
          )
        ), 0)::numeric AS total_premium
      FROM pdf_records
      WHERE deleted_at IS NULL
        AND ($1::boolean OR organization_id IS NOT DISTINCT FROM $2::uuid)
        ${MANUAL_RENEWAL_SQL_EXCLUSION}
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `;

    const categoryBreakdownQuery = `
      SELECT
        COALESCE(
          NULLIF(BTRIM(reviewed_data->>'policyCategory'), ''),
          NULLIF(BTRIM(data->>'policyCategory'), ''),
          NULLIF(BTRIM(reviewed_data->>'documentCategory'), ''),
          NULLIF(BTRIM(data->>'documentCategory'), ''),
          'General Insurance'
        ) AS category,
        COUNT(*)::integer AS count,
        COALESCE(SUM(
          COALESCE(
            NULLIF(REGEXP_REPLACE(reviewed_data->>'totalPremium', '[^0-9.]', '', 'g'), '')::numeric,
            NULLIF(REGEXP_REPLACE(data->>'totalPremium', '[^0-9.]', '', 'g'), '')::numeric,
            NULLIF(REGEXP_REPLACE(reviewed_data->>'netPremium', '[^0-9.]', '', 'g'), '')::numeric,
            NULLIF(REGEXP_REPLACE(data->>'netPremium', '[^0-9.]', '', 'g'), '')::numeric,
            0
          )
        ), 0)::numeric AS total_premium
      FROM pdf_records
      WHERE deleted_at IS NULL
        AND ($1::boolean OR organization_id IS NOT DISTINCT FROM $2::uuid)
        ${MANUAL_RENEWAL_SQL_EXCLUSION}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 8
    `;

    const topInsurersQuery = `
      SELECT
        COALESCE(
          NULLIF(BTRIM(reviewed_data->>'insuranceCompany'), ''),
          NULLIF(BTRIM(data->>'insuranceCompany'), ''),
          NULLIF(BTRIM(reviewed_data->>'companyName'), ''),
          NULLIF(BTRIM(data->>'companyName'), ''),
          'Unknown Insurer'
        ) AS insurer,
        COUNT(*)::integer AS count,
        COALESCE(SUM(
          COALESCE(
            NULLIF(REGEXP_REPLACE(reviewed_data->>'totalPremium', '[^0-9.]', '', 'g'), '')::numeric,
            NULLIF(REGEXP_REPLACE(data->>'totalPremium', '[^0-9.]', '', 'g'), '')::numeric,
            NULLIF(REGEXP_REPLACE(reviewed_data->>'netPremium', '[^0-9.]', '', 'g'), '')::numeric,
            NULLIF(REGEXP_REPLACE(data->>'netPremium', '[^0-9.]', '', 'g'), '')::numeric,
            0
          )
        ), 0)::numeric AS total_premium
      FROM pdf_records
      WHERE deleted_at IS NULL
        AND ($1::boolean OR organization_id IS NOT DISTINCT FROM $2::uuid)
        ${MANUAL_RENEWAL_SQL_EXCLUSION}
      GROUP BY 1
      ORDER BY total_premium DESC
      LIMIT 8
    `;

    const recentPoliciesQuery = `
      SELECT
        id,
        created_at AS "createdAt",
        COALESCE(
          NULLIF(BTRIM(reviewed_data->>'insuredName'), ''),
          NULLIF(BTRIM(data->>'insuredName'), ''),
          'Policyholder'
        ) AS "insuredName",
        COALESCE(
          NULLIF(BTRIM(reviewed_data->>'insuranceCompany'), ''),
          NULLIF(BTRIM(data->>'insuranceCompany'), ''),
          'Insurance Co.'
        ) AS "insuranceCompany",
        COALESCE(
          NULLIF(BTRIM(reviewed_data->>'policyCategory'), ''),
          NULLIF(BTRIM(data->>'policyCategory'), ''),
          'Policy'
        ) AS "documentCategory",
        COALESCE(
          NULLIF(BTRIM(reviewed_data->>'policyNumber'), ''),
          NULLIF(BTRIM(data->>'policyNumber'), ''),
          'Pending'
        ) AS "policyNumber",
        COALESCE(
          NULLIF(REGEXP_REPLACE(reviewed_data->>'totalPremium', '[^0-9.]', '', 'g'), '')::numeric,
          NULLIF(REGEXP_REPLACE(data->>'totalPremium', '[^0-9.]', '', 'g'), '')::numeric,
          0
        ) AS "totalPremium"
      FROM pdf_records
      WHERE deleted_at IS NULL
        AND ($1::boolean OR organization_id IS NOT DISTINCT FROM $2::uuid)
        ${MANUAL_RENEWAL_SQL_EXCLUSION}
      ORDER BY created_at DESC
      LIMIT 6
    `;

    const [
      policyRows,
      uploadGroups,
      monthlyTrends,
      categoryRows,
      insurerRows,
      recentPolicies,
      claimGroups,
      leadGroups,
      recentLeads,
      leadAgentReport,
    ] = await Promise.all([
      prisma.$queryRawUnsafe(policySummaryQuery, ...sqlParams).catch((err) => {
        console.error("policySummaryQuery error:", err);
        return [];
      }),
      prisma.uploadedFile
        .groupBy({
          by: ["status"],
          where: { ...tenantFilter, deletedAt: null },
          _count: { id: true },
        })
        .catch(() => []),
      prisma.$queryRawUnsafe(monthlyTrendsQuery, ...sqlParams).catch((err) => {
        console.error("monthlyTrendsQuery error:", err);
        return [];
      }),
      prisma.$queryRawUnsafe(categoryBreakdownQuery, ...sqlParams).catch((err) => {
        console.error("categoryBreakdownQuery error:", err);
        return [];
      }),
      prisma.$queryRawUnsafe(topInsurersQuery, ...sqlParams).catch((err) => {
        console.error("topInsurersQuery error:", err);
        return [];
      }),
      prisma.$queryRawUnsafe(recentPoliciesQuery, ...sqlParams).catch((err) => {
        console.error("recentPoliciesQuery error:", err);
        return [];
      }),
      prisma.claim
        .groupBy({
          by: ["status"],
          where: { ...tenantFilter, deletedAt: null },
          _count: { id: true },
        })
        .catch(() => []),
      prisma.leadGeneration
        .groupBy({
          by: ["status"],
          where: { ...tenantFilter, deletedAt: null },
          _count: { id: true },
        })
        .catch(() => []),
      prisma.leadGeneration
        .findMany({
          where: { ...tenantFilter, deletedAt: null },
          orderBy: { updatedAt: "desc" },
          take: 8,
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            selectedLOBs: true,
            status: true,
            customerType: true,
            sourceCompany: true,
            followUpDate: true,
            nextFollowUpDate: true,
            createdAt: true,
            updatedAt: true,
            assignedTo: true,
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        })
        .catch(() => []),
      loadLeadAgentReport({ session, page: 1, limit: 6 }).catch(() => null),
    ]);

    const policy = policyRows[0] || {};
    const uploadCount = (status) =>
      uploadGroups
        .filter((group) => normalizeUploadStatus(group.status) === status)
        .reduce((total, group) => total + Number(group._count?.id || 0), 0);

    const getClaimCount = (status) =>
      claimGroups.find((g) => g.status === status)?._count?.id || 0;
    const totalClaims = claimGroups.reduce((acc, g) => acc + (g._count?.id || 0), 0);

    const getLeadCount = (status) =>
      leadGroups.find((g) => g.status === status)?._count?.id || 0;
    const totalLeads = leadGroups.reduce((acc, g) => acc + (g._count?.id || 0), 0);

    return Response.json({
      success: true,
      viewerRole: session.role,
      summary: {
        activePolicies: Number(policy.active_policies) || 0,
        totalCustomers: Number(policy.total_customers) || 0,
        needsReview: uploadCount(UPLOAD_STATUS.REVIEW_REQUIRED),
        failedExtractions: uploadCount(UPLOAD_STATUS.FAILED),
        totalClaims,
        pendingClaims: getClaimCount("PENDING"),
        claimFollowUps: getClaimCount("UNDER_PROCESS"),
        claimDocumentsPending: getClaimCount("DOCUMENTATION_PENDING"),
        settledClaims: getClaimCount("SETTLED"),
        rejectedClaims: getClaimCount("REJECTED"),
        totalLeads,
        newLeads: getLeadCount("NEW"),
        leadFollowUps: getLeadCount("CONTACTED"),
        interestedLeads: getLeadCount("PROPOSAL_SENT"),
        convertedLeads: getLeadCount("WON"),
        lostLeads: getLeadCount("LOST"),
      },
      monthlyTrends: monthlyTrends.map((t) => ({
        monthKey: t.month_key,
        shortMonth: t.short_month,
        monthLabel: t.month_label,
        policyCount: Number(t.policy_count) || 0,
        totalPremium: Number(t.total_premium) || 0,
      })),
      categoryBreakdown: categoryRows.map((c) => ({
        category: c.category,
        count: Number(c.count) || 0,
        totalPremium: Number(c.total_premium) || 0,
      })),
      insurerBreakdown: insurerRows.map((i) => ({
        insurer: i.insurer,
        count: Number(i.count) || 0,
        totalPremium: Number(i.total_premium) || 0,
      })),
      recentPolicies: recentPolicies.map((p) => ({
        ...p,
        totalPremium: Number(p.totalPremium) || 0,
      })),
      recentLeads,
      leadAgentReport,
    });
  } catch (error) {
    console.error("Dashboard overview failed:", error instanceof Error ? error.message : error);
    return Response.json(
      {
        error: "Dashboard overview could not be loaded.",
        success: false,
        summary: {},
        monthlyTrends: [],
        categoryBreakdown: [],
        insurerBreakdown: [],
        recentPolicies: [],
      },
      { status: 200 }
    );
  }
}
