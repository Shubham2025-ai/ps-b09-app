import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const check = await requireRole(["IC_MEMBER", "ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const cases = await prisma.case.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      trackingCode: true,
      category: true,
      severity: true,
      status: true,
      retaliationFlag: true,
      createdAt: true,
      assignedToId: true,
    },
  });

  // Urgent first, then by age within each group
  const sorted = cases.sort((a: { severity: string }, b: { severity: string }) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "URGENT" ? -1 : 1;
  });

  return NextResponse.json(sorted);
}