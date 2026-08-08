import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { appendAuditLog } from "@/lib/auditLog";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireRole(["IC_MEMBER", "ADMIN", "RESPONDER"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await params;

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      evidence: true,
      assignedTo: { select: { id: true, email: true } },
    },
  });

  if (!caseData) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  // Log the view - this itself becomes part of the audit trail
  await appendAuditLog(id, "VIEWED", check.session.user.role as any, check.session.user.id);

  return NextResponse.json(caseData);
}