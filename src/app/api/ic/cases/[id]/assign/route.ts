import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { appendAuditLog } from "@/lib/auditLog";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireRole(["IC_MEMBER", "ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await params;
  const { assignedToId } = await req.json();

  const updated = await prisma.case.update({
    where: { id },
    data: { assignedToId },
  });

  await appendAuditLog(id, "ASSIGNED", check.session.user.role as any, check.session.user.id);

  await prisma.notification.create({
    data: { userId: assignedToId, caseId: id, type: "ASSIGNED" },
  });

  return NextResponse.json(updated);
}