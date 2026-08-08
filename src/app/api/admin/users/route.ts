import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import bcrypt from "bcryptjs";

export async function GET() {
  const check = await requireRole(["ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const check = await requireRole(["ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { email, password, role } = await req.json();

  if (!email || !password || !role) {
    return NextResponse.json({ error: "email, password, role required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, role },
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}