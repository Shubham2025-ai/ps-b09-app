import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caseId = formData.get("caseId") as string | null;
    const fileHash = formData.get("fileHash") as string | null;

    if (!file || !caseId || !fileHash) {
      return NextResponse.json(
        { error: "file, caseId, and fileHash are required" },
        { status: 400 }
      );
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
    const blobName = `evidence/${fileHash}${ext ? "." + ext : ""}`;

    // Store pathname only - we'll generate a signed URL on-demand when viewing
    const blob = await put(blobName, file, {
      access: "public", // required by SDK even for private stores at upload time; store setting controls actual access
    });

    const evidence = await prisma.evidence.create({
      data: {
        caseId,
        fileHash,
        storageUrl: blob.pathname, // store just the pathname, not the full URL
        fileName: file.name,
        mimeType: file.type,
      },
    });

    return NextResponse.json({ evidenceId: evidence.id });
  } catch (err) {
    console.error("Evidence upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}