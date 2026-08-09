import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the prisma import before importing the module under test
vi.mock("../prisma", () => ({
  prisma: {
    case: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "../prisma";
import { assessRetaliationRisk } from "../retaliationRisk";

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

describe("assessRetaliationRisk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not flag a complainant's first-ever case", async () => {
    (prisma.case.findMany as any).mockResolvedValue([]);

    const result = await assessRetaliationRisk("user1", "Verbal harassment", "newCase1");

    expect(result.flagged).toBe(false);
    expect(result.score).toBe(0);
  });

  it("does not flag a single weak signal alone (one open same-category case)", async () => {
    (prisma.case.findMany as any).mockResolvedValue([
      { category: "Verbal harassment", status: "UNDER_REVIEW", severity: "ROUTINE", createdAt: daysAgo(20) },
    ]);

    const result = await assessRetaliationRisk("user1", "Verbal harassment", "newCase1");

    // Only "repeat_category_open" should trigger (weight 1), below threshold of 2
    expect(result.flagged).toBe(false);
    expect(result.score).toBe(1);
  });

  it("flags when repeat category AND rapid succession combine", async () => {
    (prisma.case.findMany as any).mockResolvedValue([
      { category: "Verbal harassment", status: "UNDER_REVIEW", severity: "ROUTINE", createdAt: hoursAgo(10) },
    ]);

    const result = await assessRetaliationRisk("user1", "Verbal harassment", "newCase1");

    // repeat_category_open (1) + rapid_succession (1) = 2, meets threshold
    expect(result.flagged).toBe(true);
    expect(result.score).toBe(2);
  });

  it("flags on escalating severity alone combined with high frequency", async () => {
    (prisma.case.findMany as any).mockResolvedValue([
      { category: "Discrimination", status: "CLOSED", severity: "URGENT", createdAt: daysAgo(5) },
      { category: "Retaliation", status: "CLOSED", severity: "URGENT", createdAt: daysAgo(10) },
      { category: "Other", status: "CLOSED", severity: "ROUTINE", createdAt: daysAgo(15) },
    ]);

    const result = await assessRetaliationRisk("user1", "Physical harassment", "newCase1");

    // escalating_severity (1.5) + high_frequency (1) = 2.5, meets threshold
    // repeat_category_open and rapid_succession should NOT trigger (different category, not recent)
    expect(result.flagged).toBe(true);
    const triggeredNames = result.signals.filter((s) => s.triggered).map((s) => s.name);
    expect(triggeredNames).toContain("escalating_severity");
    expect(triggeredNames).toContain("high_frequency");
    expect(triggeredNames).not.toContain("repeat_category_open");
  });

  it("does not flag old, unrelated, low-severity case history", async () => {
    (prisma.case.findMany as any).mockResolvedValue([
      { category: "Other", status: "CLOSED", severity: "ROUTINE", createdAt: daysAgo(200) },
    ]);

    const result = await assessRetaliationRisk("user1", "Verbal harassment", "newCase1");

    expect(result.flagged).toBe(false);
    expect(result.score).toBe(0);
  });
});