import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyJWT } from "@/lib/auth";
import { canAccessCustomerProfile, getCustomerProfileScopedFilter, getTenantFilter } from "@/lib/auth/rbac";
import { logAudit, getAuditMetadata } from "@/lib/audit";
import {
  normalizeIndianPhone,
  sanitizeLeadGenerationPayload,
  serializeCustomerProfile,
} from "@/lib/customer-profiles/utils";
import { getUserFacingErrorMessage } from "@/lib/errors/user-facing";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const session = await verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const profile = await prisma.leadGeneration.findFirst({
      where: {
        id,
        ...getCustomerProfileScopedFilter(session),
      },
      include: {
        createdBy: { select: { name: true, email: true } },
        updatedBy: { select: { name: true, email: true } },
      },
    });

    if (!profile || profile.deletedAt) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 404 });
    }

    return NextResponse.json(serializeCustomerProfile(profile));
  } catch (error) {
    return NextResponse.json(
      { error: getUserFacingErrorMessage(error, "Customer profile could not be loaded.") },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const session = await verifyJWT(token);
    if (!session || session.role === "VIEWER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.leadGeneration.findFirst({
      where: {
        id,
        ...getCustomerProfileScopedFilter(session),
      },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 404 });
    }

    if (!canAccessCustomerProfile(session, "write", existing)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const data = sanitizeLeadGenerationPayload(await request.json());
    const actorLabel = session.name || session.email || "";

    const actorId = session.userId || session.id;
    if (!data.phone || normalizeIndianPhone(data.phone) !== data.phone) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number (starting with 6-9)." },
        { status: 400 },
      );
    }
    if (data.alternatePhone && normalizeIndianPhone(data.alternatePhone) !== data.alternatePhone) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number (starting with 6-9) for alternate phone." },
        { status: 400 },
      );
    }
    if (data.customerProfileId) {
      const linkedCustomer = await prisma.customerProfile.findFirst({
        where: {
          id: data.customerProfileId,
          ...getTenantFilter(session, "read"),
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!linkedCustomer) {
        return NextResponse.json({ error: "Selected customer portfolio was not found." }, { status: 400 });
      }
    }

    const duplicate = await prisma.leadGeneration.findFirst({
      where: {
        deletedAt: null,
        phone: data.phone,
        organizationId: existing.organizationId || null,
        NOT: { id },
      },
      include: {
        createdBy: { select: { name: true, email: true } },
        updatedBy: { select: { name: true, email: true } },
      },
    });

    if (duplicate) {
      const isOwnLead = duplicate.createdById === actorId;
      return NextResponse.json(
        {
          error: isOwnLead
            ? "This phone number already exists in your Lead Generation records."
            : "This phone number is already claimed by another user in Lead Generation.",
          profile: isOwnLead ? serializeCustomerProfile(duplicate) : null,
          claimedByAnotherUser: !isOwnLead,
        },
        { status: 409 },
      );
    }

    const { customerProfileId, ...leadData } = data;
    const profile = await prisma.leadGeneration.update({
      where: { id },
      data: {
        ...leadData,
        name: data.name || "Unnamed Customer",
        assignedTo: data.assignedTo || existing.assignedTo || actorLabel,
        updatedBy: { connect: { id: actorId } },
        customerProfile: customerProfileId
          ? { connect: { id: customerProfileId } }
          : { disconnect: true },
      },
      include: {
        createdBy: { select: { name: true, email: true } },
        updatedBy: { select: { name: true, email: true } },
      },
    });

    const { ipAddress, userAgent } = getAuditMetadata(request);
    await logAudit({
      action: "LEAD_UPDATE",
      entityType: "LeadGeneration",
      entityId: profile.id,
      severity: "INFO",
      source: "API",
      ipAddress,
      userAgent,
      userId: actorId,
      organizationId: session.organizationId,
      metadata: { phone: profile.phone, selectedLOBs: profile.selectedLOBs },
    });

    return NextResponse.json(serializeCustomerProfile(profile));
  } catch (error) {
    return NextResponse.json(
      { error: getUserFacingErrorMessage(error, "Customer profile could not be updated.") },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const session = await verifyJWT(token);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can delete lead generation records." }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.leadGeneration.findFirst({
      where: {
        id,
        ...getCustomerProfileScopedFilter(session),
      },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 404 });
    }

    const actorId = session.userId || session.id;
    const profile = await prisma.leadGeneration.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: actorId,
      },
      include: {
        createdBy: { select: { name: true, email: true } },
        updatedBy: { select: { name: true, email: true } },
      },
    });

    const { ipAddress, userAgent } = getAuditMetadata(request);
    await logAudit({
      action: "LEAD_DELETE",
      entityType: "LeadGeneration",
      entityId: profile.id,
      severity: "WARNING",
      source: "API",
      ipAddress,
      userAgent,
      userId: actorId,
      organizationId: session.organizationId,
      metadata: { phone: profile.phone, selectedLOBs: profile.selectedLOBs },
    });

    return NextResponse.json({ success: true, profile: serializeCustomerProfile(profile) });
  } catch (error) {
    return NextResponse.json(
      { error: getUserFacingErrorMessage(error, "Customer profile could not be deleted.") },
      { status: 500 },
    );
  }
}
