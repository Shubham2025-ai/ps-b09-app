import crypto from "crypto";

const SECRET = process.env.AUDIT_HMAC_SECRET!;

export function computeRowHash(
  prevRowHash: string | null,
  caseId: string,
  action: string,
  actorId: string | null,
  createdAt: Date
): string {
  const message = `${prevRowHash ?? ""}|${caseId}|${action}|${actorId ?? ""}|${createdAt.toISOString()}`;
  return crypto.createHmac("sha256", SECRET).update(message).digest("hex");
}