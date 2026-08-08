import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { verifyChain } from "@/lib/auditLog";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireRole(["IC_MEMBER", "ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await params;

  const rows = await prisma.auditLog.findMany({
    where: { caseId: id },
    orderBy: { createdAt: "asc" },
  });

  const verification = await verifyChain(id);

  return NextResponse.json({ rows, verification });
}