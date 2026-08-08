import { prisma } from "./prisma";
import { computeRowHash } from "./hash";
import type { Role } from "@prisma/client";

export async function appendAuditLog(
  caseId: string,
  action: string,
  actorRole: Role,
  actorId: string | null
) {
  const lastRow = await prisma.auditLog.findFirst({
    where: { caseId },
    orderBy: { createdAt: "desc" },
  });

  const prevRowHash = lastRow?.rowHash ?? null;
  const createdAt = new Date();
  const rowHash = computeRowHash(prevRowHash, caseId, action, actorId, createdAt);

  return prisma.auditLog.create({
    data: {
      caseId,
      action,
      actorRole,
      actorId,
      rowHash,
      prevRowHash,
      createdAt,
    },
  });
}

export async function verifyChain(caseId: string) {
  const rows = await prisma.auditLog.findMany({
    where: { caseId },
    orderBy: { createdAt: "asc" },
  });

  let expectedPrevHash: string | null = null;

  for (const row of rows) {
    const recomputed = computeRowHash(
      expectedPrevHash,
      row.caseId,
      row.action,
      row.actorId,
      row.createdAt
    );

    if (recomputed !== row.rowHash || row.prevRowHash !== expectedPrevHash) {
      return { valid: false, brokenAtRowId: row.id, brokenAtAction: row.action };
    }

    expectedPrevHash = row.rowHash;
  }

  return { valid: true as const };
}