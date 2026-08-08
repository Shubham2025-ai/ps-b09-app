import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export type ClassificationResult = {
  severity: "URGENT" | "ROUTINE";
  category: string;
  reasoning: string;
};

export async function classifyCase(
  description: string,
  immediateDangerFlag: boolean
): Promise<ClassificationResult> {
  // Hard override: if the user explicitly flagged immediate danger, always URGENT
  if (immediateDangerFlag) {
    return {
      severity: "URGENT",
      category: "safety-critical",
      reasoning: "Complainant self-reported immediate physical danger.",
    };
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You classify workplace harassment reports for routing.
Return ONLY valid JSON, no markdown, no preamble: {"severity": "URGENT"|"ROUTINE", "category": string, "reasoning": string}
URGENT = immediate physical danger, ongoing threat, or explicit safety risk language.
ROUTINE = everything else (verbal harassment, discrimination, inappropriate conduct without imminent danger).`,
      },
      { role: "user", content: description },
    ],
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(raw);
    return {
      severity: parsed.severity === "URGENT" ? "URGENT" : "ROUTINE",
      category: parsed.category ?? "general",
      reasoning: parsed.reasoning ?? "",
    };
  } catch {
    // fail-safe: if parsing fails, default to ROUTINE but flag for manual review
    return {
      severity: "ROUTINE",
      category: "general",
      reasoning: "Classification parsing failed - flagged for manual review.",
    };
  }
}