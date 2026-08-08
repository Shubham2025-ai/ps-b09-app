import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { appendAuditLog } from "@/lib/auditLog";

const VALID_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "ACTION_TAKEN", "CLOSED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireRole(["IC_MEMBER", "ADMIN", "RESPONDER"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.case.update({
    where: { id },
    data: { status },
  });

  await appendAuditLog(id, "STATUS_CHANGED", check.session.user.role as any, check.session.user.id);

  // Notify the complainant if they're not anonymous
  if (updated.complainantId) {
    await prisma.notification.create({
      data: {
        userId: updated.complainantId,
        caseId: id,
        type: "STATUS_CHANGE",
      },
    });
  }

  return NextResponse.json(updated);
}