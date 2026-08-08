import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { head } from "@vercel/blob";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireRole(["IC_MEMBER", "ADMIN", "RESPONDER"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await params;

  const evidence = await prisma.evidence.findUnique({ where: { id } });
  if (!evidence) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const blobDetails = await head(evidence.storageUrl);
    return NextResponse.json({ url: blobDetails.url });
  } catch (err) {
    console.error("Failed to get blob URL:", err);
    return NextResponse.json({ error: "Could not retrieve file" }, { status: 500 });
  }
}