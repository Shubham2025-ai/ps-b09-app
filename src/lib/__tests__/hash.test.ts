import { describe, it, expect } from "vitest";
import { computeRowHash } from "../hash";

describe("computeRowHash", () => {
  it("produces a deterministic hash for the same inputs", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const hash1 = computeRowHash(null, "case1", "SUBMITTED", "user1", date);
    const hash2 = computeRowHash(null, "case1", "SUBMITTED", "user1", date);
    expect(hash1).toBe(hash2);
  });

  it("produces a different hash when any input changes", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const base = computeRowHash(null, "case1", "SUBMITTED", "user1", date);

    expect(computeRowHash(null, "case2", "SUBMITTED", "user1", date)).not.toBe(base);
    expect(computeRowHash(null, "case1", "VIEWED", "user1", date)).not.toBe(base);
    expect(computeRowHash(null, "case1", "SUBMITTED", "user2", date)).not.toBe(base);
    expect(computeRowHash("prevhash", "case1", "SUBMITTED", "user1", date)).not.toBe(base);
  });

  it("chains correctly - each hash depends on the previous", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const row1Hash = computeRowHash(null, "case1", "SUBMITTED", "user1", date);
    const row2Hash = computeRowHash(row1Hash, "case1", "VIEWED", "user2", date);
    const row2HashTampered = computeRowHash("wrong-prev-hash", "case1", "VIEWED", "user2", date);

    expect(row2Hash).not.toBe(row2HashTampered);
  });
});