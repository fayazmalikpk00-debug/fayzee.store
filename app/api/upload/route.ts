import { getSessionUser } from "@/lib/auth";
import crypto from "crypto";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export const dynamic = "force-dynamic";

// Maximum 5MB per image file
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Magic bytes signatures
function detectImageExtension(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  // WebP: RIFF ... WEBP
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    return "webp";
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (
      !user ||
      (user.role !== "SELLER" &&
        user.role !== "ADMIN" &&
        user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: You must be logged in as an authorized seller or administrator to upload images.",
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    // Support either "files" or "file" in formData
    const rawFiles = formData.getAll("files").length > 0
      ? formData.getAll("files")
      : formData.getAll("file");

    const files = rawFiles.filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No image file provided. Please select an image from your device." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const uploadedResults: Array<{ url: string; name: string; size: number }> = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `Image "${file.name}" exceeds the 5MB size limit (${(
              file.size /
              (1024 * 1024)
            ).toFixed(1)}MB). Please choose a smaller image.`,
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const detectedExt = detectImageExtension(buffer);
      if (!detectedExt) {
        return NextResponse.json(
          {
            error: `File "${file.name}" has an invalid image format. Only JPEG, PNG, and WebP images are allowed.`,
          },
          { status: 400 }
        );
      }

      // Generate cryptographically secure collision-free filename
      const randomHex = crypto.randomBytes(8).toString("hex");
      const safeFilename = `${Date.now()}-${randomHex}.${detectedExt}`;
      const destinationPath = path.join(uploadDir, safeFilename);

      // Path traversal check
      if (!destinationPath.startsWith(uploadDir)) {
        return NextResponse.json(
          { error: "Invalid upload destination path." },
          { status: 400 }
        );
      }

      await fs.promises.writeFile(destinationPath, buffer);

      const publicUrl = `/uploads/products/${safeFilename}`;
      uploadedResults.push({
        url: publicUrl,
        name: file.name,
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      url: uploadedResults[0].url,
      name: uploadedResults[0].name,
      size: uploadedResults[0].size,
      urls: uploadedResults.map((r) => r.url),
      files: uploadedResults,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
