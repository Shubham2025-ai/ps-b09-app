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

    const blob = await put(blobName, file, {
      access: "public",
      addRandomSuffix: false,
    });

    const evidence = await prisma.evidence.create({
      data: {
        caseId,
        fileHash,
        storageUrl: blob.url,
        fileName: file.name,
        mimeType: file.type,
      },
    });

    return NextResponse.json({ evidenceId: evidence.id, storageUrl: evidence.storageUrl });
  } catch (err) {
    console.error("Evidence upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}