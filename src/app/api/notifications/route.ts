import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    include: { case: { select: { trackingCode: true, category: true } } },
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}