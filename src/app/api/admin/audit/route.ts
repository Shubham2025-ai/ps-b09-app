import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { verifyChain } from "@/lib/auditLog";

export async function GET() {
  const check = await requireRole(["ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const cases = await prisma.case.findMany({
    select: { id: true, trackingCode: true },
  });

  const results = await Promise.all(
    cases.map(async (c) => {
      const verification = await verifyChain(c.id);
      return {
        caseId: c.id,
        trackingCode: c.trackingCode,
        ...verification,
      };
    })
  );

  return NextResponse.json(results);
}