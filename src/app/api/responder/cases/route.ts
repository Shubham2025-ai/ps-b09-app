import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const check = await requireRole(["RESPONDER", "ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const cases = await prisma.case.findMany({
    where: { severity: "URGENT" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      trackingCode: true,
      category: true,
      status: true,
      immediateDanger: true,
      createdAt: true,
    },
  });

  return NextResponse.json(cases);
}