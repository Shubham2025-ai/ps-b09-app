import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const cases = await prisma.case.findMany({
    where: { complainantId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      trackingCode: true,
      category: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(cases);
}