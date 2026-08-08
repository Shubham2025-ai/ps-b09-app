import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { appendAuditLog } from "@/lib/auditLog";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireRole(["RESPONDER", "ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await params;

  const updated = await prisma.case.update({
    where: { id },
    data: { status: "UNDER_REVIEW" },
  });

  await appendAuditLog(id, "ESCALATED", check.session.user.role as any, check.session.user.id);

  return NextResponse.json(updated);
}