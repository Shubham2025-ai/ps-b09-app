import { auth } from "./auth";
import type { Role } from "@prisma/client";

export async function requireRole(allowedRoles: Role[]) {
  const session = await auth();

  if (!session?.user) {
    return { authorized: false as const, error: "Not authenticated", status: 401 };
  }

  if (!allowedRoles.includes(session.user.role as Role)) {
    return { authorized: false as const, error: "Forbidden", status: 403 };
  }

  return { authorized: true as const, session };
}