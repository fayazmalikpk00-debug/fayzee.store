import { getSessionUser } from "@/lib/auth";
import { MAX_IMAGE_SIZE_BYTES, MAX_PRODUCT_IMAGES, validateImageBuffer } from "@/lib/imageValidator";
import { deleteCloudinaryAsset, isCloudinaryConfigured, uploadImageToCloudinary } from "@/services/cloudinaryService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Authenticate and authorize seller session
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

    const sellerId = user.sellerProfile?.id || user.id;

    // 2. Extract files from multipart form data
    const formData = await req.formData();
    const rawFiles = formData.getAll("files").length > 0
      ? formData.getAll("files")
      : formData.getAll("file");

    const files = rawFiles.filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No image file provided. Please select up to 8 images from your device." },
        { status: 400 }
      );
    }

    // 3. Exact limit enforcement: Maximum 8 images per product
    if (files.length > MAX_PRODUCT_IMAGES) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_PRODUCT_IMAGES} images allowed per product. You selected ${files.length} images.`,
        },
        { status: 400 }
      );
    }

    // 4. Verify Cloudinary configuration before processing large payloads
    if (!isCloudinaryConfigured()) {
      console.error(
        "❌ [UPLOAD ROUTE] Cloudinary credentials missing in environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)."
      );
      return NextResponse.json(
        {
          error:
            "Cloud image storage is not configured. Please add Cloudinary credentials to Vercel environment variables.",
        },
        { status: 500 }
      );
    }

    // 5. Pre-validate all files (Size <= 60MB, Magic bytes binary inspection)
    const validatedFilesData: Array<{ buffer: Buffer; name: string; format: string; mimeType: string }> = [];

    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        return NextResponse.json(
          {
            error: `Image "${file.name}" exceeds the 60MB size limit (${sizeMb}MB). Each image must be 60MB or smaller.`,
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const validation = validateImageBuffer(buffer, file.name);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || `File "${file.name}" is not a supported image format.` },
          { status: 400 }
        );
      }

      validatedFilesData.push({
        buffer,
        name: file.name,
        format: validation.format || "jpg",
        mimeType: validation.mimeType || "image/jpeg",
      });
    }

    // 6. Upload validated buffers to Cloudinary with transactional rollback
    const uploadedResults: Array<{
      url: string;
      publicId: string;
      name: string;
      size: number;
      format: string;
    }> = [];

    const uploadedPublicIdsToRollback: string[] = [];

    for (const item of validatedFilesData) {
      const uploadResult = await uploadImageToCloudinary({
        buffer: item.buffer,
        fileName: item.name,
        sellerId,
        mimeType: item.mimeType,
      });

      if (!uploadResult.success) {
        // Rollback all already-uploaded assets in this batch to prevent orphans
        console.warn(
          `⚠️ [UPLOAD ROUTE ROLLBACK] Upload failed for "${item.name}". Rolling back ${uploadedPublicIdsToRollback.length} assets...`
        );
        for (const pubId of uploadedPublicIdsToRollback) {
          await deleteCloudinaryAsset(pubId);
        }

        return NextResponse.json(
          {
            error: uploadResult.error || `Failed to upload "${item.name}" to cloud storage. Please try again.`,
          },
          { status: 500 }
        );
      }

      uploadedPublicIdsToRollback.push(uploadResult.publicId);
      uploadedResults.push({
        url: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        name: item.name,
        size: uploadResult.bytes,
        format: uploadResult.format,
      });
    }

    // 7. Successful Cloudinary upload response (Zero filesystem writes)
    return NextResponse.json({
      success: true,
      url: uploadedResults[0].url,
      publicId: uploadedResults[0].publicId,
      name: uploadedResults[0].name,
      size: uploadedResults[0].size,
      urls: uploadedResults.map((r) => r.url),
      files: uploadedResults,
    });
  } catch (error: any) {
    console.error("❌ [UPLOAD ROUTE EXCEPTION]:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while processing the image upload." },
      { status: 500 }
    );
  }
}
