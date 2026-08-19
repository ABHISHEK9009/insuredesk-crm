import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { verifyJWT } from "@/lib/auth";
import { getTenantFilter } from "@/lib/auth/rbac";
import { logAudit, getAuditMetadata } from "@/lib/audit";
import {
  normalizeClientPhone,
  isValidClientEmail,
  sanitizeClientAccountPayload,
  serializeClientAccount,
} from "@/lib/client-accounts/utils";
import { normalizeIndianPhone } from "@/lib/customer-profiles/utils";
import { getUserFacingErrorMessage } from "@/lib/errors/user-facing";
import { withClientPhoneLock } from "@/lib/client-accounts/server";
import { generateTemporaryClientMpin, provisionClientMpin } from "@/lib/client-portal/credentials";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const session = await requireStaffSession(request);
    if (session.response) return session.response;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
    const skip = (page - 1) * limit;
    const q = searchParams.get("q") || "";

    const where = {
      ...getTenantFilter(session, "read"),
      deletedAt: null,
    };

    if (q.trim()) {
      const query = q.trim();
      where.OR = [
        { id: isUuid(query) ? query : undefined },
        { name: { contains: query, mode: "insensitive" } },
        { phone: { contains: normalizeClientPhone(query) || query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { googleEmail: { contains: query, mode: "insensitive" } },
      ].filter((item) => !Object.values(item).includes(undefined));
    }

    const [accounts, total] = await Promise.all([
      prisma.clientAccount.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          createdBy: { select: { name: true, email: true } },
          updatedBy: { select: { name: true, email: true } },
        },
      }),
      prisma.clientAccount.count({ where }),
    ]);

    const accountIds = accounts.map((a) => a.id.toLowerCase());
    const accountPhones = accounts.map((a) => a.phone).filter(Boolean);
    const policyCountMap = new Map();
    const contactPersonMap = new Map();

    if (accountIds.length > 0 || accountPhones.length > 0) {
      try {
        const orgId = session.organizationId;
        const matchedRows = await prisma.$queryRaw`
          SELECT 
            LOWER(COALESCE(NULLIF(reviewed_data->>'clientId', ''), data->>'clientId', '')) as "clientId",
            REGEXP_REPLACE(COALESCE(NULLIF(reviewed_data->>'contactNumber', ''), data->>'contactNumber', NULLIF(reviewed_data->>'customerMobile', ''), data->>'customerMobile', ''), '[^0-9]', '', 'g') as "phone",
            COUNT(*)::int as count,
            MAX(COALESCE(NULLIF(reviewed_data->>'contactPerson', ''), NULLIF(data->>'contactPerson', ''), NULLIF(reviewed_data->>'contactPersonName', ''), NULLIF(data->>'contactPersonName', ''), '')) as "contactPerson"
          FROM pdf_records
          WHERE deleted_at IS NULL
            AND (
              ${orgId ? Prisma.sql`(organization_id = ${orgId}::uuid OR organization_id IS NULL)` : Prisma.sql`TRUE`}
            )
            AND (
              ${accountIds.length > 0 ? Prisma.sql`LOWER(COALESCE(NULLIF(reviewed_data->>'clientId', ''), data->>'clientId', '')) IN (${Prisma.join(accountIds)})` : Prisma.sql`FALSE`}
              OR ${accountPhones.length > 0 ? Prisma.sql`REGEXP_REPLACE(COALESCE(NULLIF(reviewed_data->>'contactNumber', ''), data->>'contactNumber', NULLIF(reviewed_data->>'customerMobile', ''), data->>'customerMobile', ''), '[^0-9]', '', 'g') IN (${Prisma.join(accountPhones)})` : Prisma.sql`FALSE`}
            )
          GROUP BY 1, 2
        `;

        for (const row of matchedRows) {
          const rowClientId = (row.clientId || "").toLowerCase();
          const rowPhone = row.phone || "";
          const rowContact = (row.contactPerson || "").trim();

          for (const acc of accounts) {
            const accId = acc.id.toLowerCase();
            const accPhone = (acc.phone || "").replace(/\D/g, "");
            const isMatch = (rowClientId && rowClientId === accId) || (rowPhone && accPhone && rowPhone.endsWith(accPhone));
            if (isMatch) {
              if (rowClientId === accId) {
                policyCountMap.set(accId, (policyCountMap.get(accId) || 0) + Number(row.count || 0));
              }
              if (rowContact && !contactPersonMap.has(accId)) {
                contactPersonMap.set(accId, rowContact);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch policy counts and contact persons for client accounts:", err);
      }
    }

    if (accountPhones.length > 0) {
      try {
        const customerProfiles = await prisma.customerProfile.findMany({
          where: {
            phone: { in: accountPhones },
            deletedAt: null,
          },
          select: { phone: true, contactPersonName: true },
        });
        for (const cp of customerProfiles) {
          if (cp.contactPersonName && cp.contactPersonName.trim()) {
            for (const acc of accounts) {
              if (acc.phone === cp.phone && !contactPersonMap.has(acc.id.toLowerCase())) {
                contactPersonMap.set(acc.id.toLowerCase(), cp.contactPersonName.trim());
              }
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch customer profile contact person:", err);
      }
    }

    const serializedProfiles = accounts.map((acc) => ({
      ...serializeClientAccount(acc),
      contactPerson: contactPersonMap.get(acc.id.toLowerCase()) || "",
      policiesCount: policyCountMap.get(acc.id.toLowerCase()) || 0,
      accountsCount: policyCountMap.get(acc.id.toLowerCase()) || 0,
    }));

    return NextResponse.json({
      profiles: serializedProfiles,
      accounts: serializedProfiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      canResetMpin: session.role === "SUPER_ADMIN",
    });
  } catch (error) {
    return NextResponse.json(
      { error: getUserFacingErrorMessage(error, "Failed to search client accounts.") },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await requireStaffSession(request);
    if (session.response) return session.response;
    if (session.role === "VIEWER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = sanitizeClientAccountPayload(await request.json());
    if (!data.name || !data.phone || normalizeIndianPhone(data.phone) !== data.phone) {
      return NextResponse.json(
        { error: "Please enter client name and a valid 10-digit Indian mobile number." },
        { status: 400 },
      );
    }
    if (!isValidClientEmail(data.email)) {
      return NextResponse.json({ error: "Please enter a valid client email address." }, { status: 400 });
    }

    const actorId = session.userId || session.id;
    const temporaryMpin = generateTemporaryClientMpin();
    const result = await withClientPhoneLock(session.organizationId, data.phone, async (database) => {
      const existing = await database.clientAccount.findFirst({
        where: {
          organizationId: session.organizationId ?? null,
          deletedAt: null,
          phone: data.phone,
        },
        include: {
          createdBy: { select: { name: true, email: true } },
          updatedBy: { select: { name: true, email: true } },
        },
      });
      if (existing) return { existing };

      const account = await database.clientAccount.create({
        data: {
          ...data,
          organizationId: session.organizationId,
          createdById: actorId,
          updatedById: actorId,
        },
        include: {
          createdBy: { select: { name: true, email: true } },
          updatedBy: { select: { name: true, email: true } },
        },
      });
      await provisionClientMpin(account, temporaryMpin, database);
      return { account, temporaryMpin };
    });

    if (result.existing) {
      return NextResponse.json(
        {
          error: "This phone number already has a Client ID.",
          profile: serializeClientAccount(result.existing),
        },
        { status: 409 },
      );
    }

    const account = result.account;

    const { ipAddress, userAgent } = getAuditMetadata(request);
    await logAudit({
      action: "CLIENT_ACCOUNT_CREATE",
      entityType: "ClientAccount",
      entityId: account.id,
      severity: "INFO",
      source: "API",
      ipAddress,
      userAgent,
      userId: actorId,
      organizationId: session.organizationId,
      metadata: { phone: account.phone },
    });

    return NextResponse.json(
      { ...serializeClientAccount(account), temporaryMpin: result.temporaryMpin },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: getUserFacingErrorMessage(error, "Client account could not be saved.") },
      { status: 500 },
    );
  }
}

async function requireStaffSession(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return { response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  const session = await verifyJWT(token);
  if (!session || session.role === "CLIENT") {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }
  return session;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);
}
