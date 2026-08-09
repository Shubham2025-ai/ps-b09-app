import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rateLimit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const clientKey = getClientKey(req);
  const limit = rateLimit(`track:${clientKey}`, 20, 60_000); // 20 lookups per minute per IP
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

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