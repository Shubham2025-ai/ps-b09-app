import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTrackingCode } from "@/lib/trackingCode";
import { classifyCase } from "@/lib/groqClassify";
import { appendAuditLog } from "@/lib/auditLog";
import { auth } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientKey = getClientKey(req);
    const limit = rateLimit(`submit:${clientKey}`, 5, 60_000); // 5 submissions per minute per IP
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { category, description, immediateDanger, isAnonymous, evidenceFileHashes } = body;

    if (!category || !description) {
      return NextResponse.json(
        { error: "category and description are required" },
        { status: 400 }
      );
    }

    // If confidential (not anonymous), attach the logged-in complainant
    const session = await auth();
    const complainantId = !isAnonymous && session?.user?.id ? session.user.id : null;

    const classification = await classifyCase(description, !!immediateDanger);

    const trackingCode = generateTrackingCode();

    const newCase = await prisma.case.create({
      data: {
        trackingCode,
        complainantId,
        category,
        description,
        severity: classification.severity,
        severityReasoning: classification.reasoning,
        immediateDanger: !!immediateDanger,
      },
    });

    // Retaliation-risk check: if this complainant (non-anonymous) has an existing
    // open case in the same category, flag this new one
    if (complainantId) {
      const priorCase = await prisma.case.findFirst({
        where: {
          complainantId,
          category,
          status: { not: "CLOSED" },
          id: { not: newCase.id },
        },
      });
      if (priorCase) {
        await prisma.case.update({
          where: { id: newCase.id },
          data: { retaliationFlag: true },
        });
      }
    }

    await appendAuditLog(newCase.id, "SUBMITTED", "COMPLAINANT", complainantId);

    if (classification.severity === "URGENT") {
      const responders = await prisma.user.findMany({ where: { role: "RESPONDER" } });
      await Promise.all(
        responders.map((r) =>
          prisma.notification.create({
            data: {
              userId: r.id,
              caseId: newCase.id,
              type: "URGENT_ESCALATION",
            },
          })
        )
      );
    }

    return NextResponse.json({
      trackingCode: newCase.trackingCode,
      caseId: newCase.id,
      severity: newCase.severity,
    });
  } catch (err) {
    console.error("Case creation error:", err);
    return NextResponse.json({ error: "Failed to submit case" }, { status: 500 });
  }
}