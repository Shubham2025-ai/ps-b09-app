import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const foundCase = await prisma.case.findUnique({
    where: { trackingCode: code },
    select: {
      trackingCode: true,
      status: true,
      severity: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!foundCase) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json(foundCase);
}