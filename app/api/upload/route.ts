import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { validateFile, generateUniqueFileName } from "@/lib/utils/file-upload";

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "File validation failed" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileName = generateUniqueFileName(file.name);

    // Decide storage strategy: use Vercel Blob when available (production),
    // fall back to local filesystem in development.
    let fileUrl: string;

    const isBlobAvailable =
      !!process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL === "1";

    if (isBlobAvailable) {
      // Upload to Vercel Blob storage
      const blob = await put(`uploads/${fileName}`, file, {
        access: "public",
        addRandomSuffix: true,
      });
      fileUrl = blob.url;
    } else {
      // Local filesystem (development only)
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, fileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      fileUrl = `/uploads/${fileName}`;
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "File upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json(
        { error: "No file name provided" },
        { status: 400 }
      );
    }

    // Delete from local filesystem
    const fs = await import("fs/promises");
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    try {
      await fs.unlink(filePath);
    } catch {
      // File may not exist, that's ok
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: "File deletion failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
