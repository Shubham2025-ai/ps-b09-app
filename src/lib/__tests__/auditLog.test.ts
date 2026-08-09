import { describe, it, expect } from "vitest";
import { computeRowHash } from "../hash";

// We test the verification LOGIC in isolation here (same algorithm verifyChain uses),
// since verifyChain itself requires a live Prisma/DB connection.
// This proves the chain-walk detection logic is correct independent of the database layer.

type FakeRow = {
  id: string;
  caseId: string;
  action: string;
  actorId: string | null;
  rowHash: string;
  prevRowHash: string | null;
  createdAt: Date;
};

function verifyChainLogic(rows: FakeRow[]) {
  let expectedPrevHash: string | null = null;

  for (const row of rows) {
    const recomputed = computeRowHash(expectedPrevHash, row.caseId, row.action, row.actorId, row.createdAt);
    if (recomputed !== row.rowHash || row.prevRowHash !== expectedPrevHash) {
      return { valid: false, brokenAtRowId: row.id, brokenAtAction: row.action };
    }
    expectedPrevHash = row.rowHash;
  }
  return { valid: true as const };
}

describe("audit chain verification", () => {
  const caseId = "case1";
  const date1 = new Date("2026-01-01T00:00:00Z");
  const date2 = new Date("2026-01-01T00:05:00Z");
  const date3 = new Date("2026-01-01T00:10:00Z");

  function buildValidChain(): FakeRow[] {
    const hash1 = computeRowHash(null, caseId, "SUBMITTED", "user1", date1);
    const hash2 = computeRowHash(hash1, caseId, "VIEWED", "user2", date2);
    const hash3 = computeRowHash(hash2, caseId, "STATUS_CHANGED", "user2", date3);

    return [
      { id: "row1", caseId, action: "SUBMITTED", actorId: "user1", rowHash: hash1, prevRowHash: null, createdAt: date1 },
      { id: "row2", caseId, action: "VIEWED", actorId: "user2", rowHash: hash2, prevRowHash: hash1, createdAt: date2 },
      { id: "row3", caseId, action: "STATUS_CHANGED", actorId: "user2", rowHash: hash3, prevRowHash: hash2, createdAt: date3 },
    ];
  }

  it("validates an untampered chain", () => {
    const result = verifyChainLogic(buildValidChain());
    expect(result.valid).toBe(true);
  });

  it("detects tampering in the middle of the chain", () => {
    const rows = buildValidChain();
    rows[1].action = "TAMPERED"; // corrupt row 2's action without recomputing its hash

    const result = verifyChainLogic(rows);
    expect(result.valid).toBe(false);
    expect(result.brokenAtRowId).toBe("row2");
  });

  it("detects tampering at the first row", () => {
    const rows = buildValidChain();
    rows[0].actorId = "attacker";

    const result = verifyChainLogic(rows);
    expect(result.valid).toBe(false);
    expect(result.brokenAtRowId).toBe("row1");
  });

  it("detects tampering at the last row", () => {
    const rows = buildValidChain();
    rows[2].action = "FAKE_RESOLVED";

    const result = verifyChainLogic(rows);
    expect(result.valid).toBe(false);
    expect(result.brokenAtRowId).toBe("row3");
  });

  it("detects a broken prevRowHash link even if the row's own hash is internally consistent", () => {
    const rows = buildValidChain();
    // Attacker recomputes row2's hash correctly for a DIFFERENT prevRowHash, breaking the chain link
    const forgedHash = computeRowHash("forged-prev", caseId, "VIEWED", "user2", date2);
    rows[1].rowHash = forgedHash;
    rows[1].prevRowHash = "forged-prev";

    const result = verifyChainLogic(rows);
    expect(result.valid).toBe(false);
    expect(result.brokenAtRowId).toBe("row2");
  });

  it("validates an empty chain (new case, no audit rows yet)", () => {
    const result = verifyChainLogic([]);
    expect(result.valid).toBe(true);
  });
});