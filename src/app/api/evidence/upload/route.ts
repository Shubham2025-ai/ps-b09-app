import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use the hash as the filename to avoid collisions and keep it content-addressed
    const ext = path.extname(file.name) || "";
    const storedFileName = `${fileHash}${ext}`;
    const storedPath = path.join(process.cwd(), "public", "uploads", "evidence", storedFileName);

    await writeFile(storedPath, buffer);

    const evidence = await prisma.evidence.create({
      data: {
        caseId,
        fileHash,
        storageUrl: `/uploads/evidence/${storedFileName}`,
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