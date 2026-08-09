import { prisma } from "./prisma";

export type RetaliationSignal = {
  name: string;
  triggered: boolean;
  weight: number;
  detail: string;
};

export type RetaliationAssessment = {
  flagged: boolean;
  score: number;
  signals: RetaliationSignal[];
};

const FLAG_THRESHOLD = 2;

/**
 * Computes a multi-signal retaliation-risk score for a new case submission.
 * Each signal contributes independently; the case is flagged if the combined
 * weighted score crosses FLAG_THRESHOLD. This is intentionally conservative -
 * a single weak signal alone should not flag a case, since that produces
 * excessive false positives that erode trust in the flag over time.
 */
export async function assessRetaliationRisk(
  complainantId: string,
  category: string,
  newCaseId: string
): Promise<RetaliationAssessment> {
  const signals: RetaliationSignal[] = [];

  const priorCases = await prisma.case.findMany({
    where: {
      complainantId,
      id: { not: newCaseId },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Signal 1: repeat filing in the same category while a prior case is still open
  const sameCategoryOpen = priorCases.some(
    (c) => c.category === category && c.status !== "CLOSED"
  );
  signals.push({
    name: "repeat_category_open",
    triggered: sameCategoryOpen,
    weight: 1,
    detail: "Same category as an existing open case",
  });

  // Signal 2: rapid succession filing - a new case within 72 hours of a prior one
  const recentCase = priorCases.find((c) => {
    const hoursSince = (Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSince < 72;
  });
  signals.push({
    name: "rapid_succession",
    triggered: !!recentCase,
    weight: 1,
    detail: "New case filed within 72 hours of a previous case",
  });

  // Signal 3: escalating severity - this complainant's cases are trending toward URGENT
  const recentSeverities = priorCases.slice(0, 3).map((c) => c.severity);
  const urgentTrend = recentSeverities.filter((s) => s === "URGENT").length >= 2;
  signals.push({
    name: "escalating_severity",
    triggered: urgentTrend,
    weight: 1.5,
    detail: "Multiple recent cases from this complainant classified URGENT",
  });

  // Signal 4: high filing frequency overall - more than 3 cases in the last 30 days
  const recentCount = priorCases.filter((c) => {
    const daysSince = (Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 30;
  }).length;
  signals.push({
    name: "high_frequency",
    triggered: recentCount >= 3,
    weight: 1,
    detail: "3 or more cases filed by this complainant in the last 30 days",
  });

  const score = signals.reduce((sum, s) => sum + (s.triggered ? s.weight : 0), 0);

  return {
    flagged: score >= FLAG_THRESHOLD,
    score,
    signals,
  };
}