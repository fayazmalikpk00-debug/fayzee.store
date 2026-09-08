/**
 * FAYZEE Cloudinary Service
 * 
 * Production-ready serverless cloud storage for marketplace product images.
 * - Streams uploads directly over HTTPS to Cloudinary REST API (Zero local filesystem writes)
 * - Safe for Vercel serverless functions
 * - Applies automatic web optimization: f_auto (HEIC/HEIF -> WebP/AVIF), q_auto, w_1600,c_limit
 * - Provides transactional asset cleanup (deleteCloudinaryAsset)
 * - Safe server-side diagnostics without leaking secrets
 */

import crypto from "crypto";

export interface CloudinaryUploadParams {
  buffer: Buffer;
  fileName?: string;
  sellerId: string;
  mimeType?: string;
}

export interface CloudinaryUploadResult {
  success: boolean;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  error?: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Safely retrieves Cloudinary configuration from environment variables.
 * Strips accidental wrapping quotes or whitespace.
 */
export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim().replace(/^["']|["']$/g, "");
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim().replace(/^["']|["']$/g, "");
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim().replace(/^["']|["']$/g, "");

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig() !== null;
}

/**
 * Builds an optimized Cloudinary delivery URL with automatic format and compression:
 * - f_auto: Automatically delivers WebP/AVIF and converts iPhone HEIC/HEIF to browser-friendly formats
 * - q_auto: Intelligent e-commerce compression preserving visual fidelity
 * - w_1600,c_limit: Caps excessive 8000px camera photos to 1600px width while preserving aspect ratio
 */
export function buildOptimizedImageUrl(cloudName: string, publicId: string, format = "jpg"): string {
  // If publicId already contains an extension, strip it for dynamic transformation URL
  const cleanPublicId = publicId.replace(/\.[^/.]+$/, "");
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1600,c_limit/${cleanPublicId}.${format}`;
}

export const buildOptimizedUrl = buildOptimizedImageUrl;

/**
 * Extracts Cloudinary public_id from a secure delivery URL.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return null;
  }
  // Matches /upload/(optional transformations/)(optional version v12345/)<publicId>.<extension>
  const match = url.match(/\/upload\/(?:[a-zA-Z0-9_,:]+\/)?(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match ? match[1] : null;
}

/**
 * Uploads an image buffer directly to Cloudinary using the secure HTTPS REST API.
 * Never touches the local disk or filesystem.
 */
export async function uploadImageToCloudinary({
  buffer,
  fileName = "product-image",
  sellerId,
  mimeType = "image/jpeg",
}: CloudinaryUploadParams): Promise<CloudinaryUploadResult> {
  const config = getCloudinaryConfig();
  if (!config) {
    const errorMsg = "Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing.";
    console.error(`❌ [CLOUDINARY ERROR] ${errorMsg}`);
    return {
      success: false,
      secureUrl: "",
      publicId: "",
      format: "",
      bytes: 0,
      error: "Cloud image storage service is not configured. Please add Cloudinary credentials to Vercel environment variables.",
    };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    // Sanitize sellerId for folder path safety
    const safeSellerId = sellerId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const folder = `fayzee/products/${safeSellerId}`;

    // Cloudinary signature generation:
    // Sort parameters alphabetically: folder=...&timestamp=...
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${config.apiSecret}`;
    const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

    // Construct multipart form data
    const formData = new FormData();
    const fileBlob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    formData.append("file", fileBlob, fileName);
    formData.append("api_key", config.apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("folder", folder);
    formData.append("signature", signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
    console.log(`☁️ [CLOUDINARY] Uploading image (${(buffer.length / (1024 * 1024)).toFixed(2)}MB) to folder: ${folder}...`);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const detailedError = errData?.error?.message || response.statusText || "Upload rejected by Cloudinary";
      console.error("❌ [CLOUDINARY API ERROR]:", {
        status: response.status,
        statusText: response.statusText,
        message: detailedError,
        folder,
      });
      return {
        success: false,
        secureUrl: "",
        publicId: "",
        format: "",
        bytes: 0,
        error: `Cloudinary upload failed: ${detailedError}`,
      };
    }

    const data = await response.json();
    const publicId = data.public_id;
    const format = data.format || "jpg";

    // Generate optimized delivery URL with f_auto,q_auto
    const optimizedUrl = buildOptimizedImageUrl(config.cloudName, publicId, format);

    console.log(`✅ [CLOUDINARY SUCCESS] Uploaded asset: ${publicId} (format: ${format}, size: ${(data.bytes / 1024).toFixed(1)}KB)`);

    return {
      success: true,
      secureUrl: optimizedUrl,
      publicId,
      format,
      bytes: data.bytes || buffer.length,
      width: data.width,
      height: data.height,
    };
  } catch (err: any) {
    console.error("❌ [CLOUDINARY EXCEPTION]:", err?.message || err);
    return {
      success: false,
      secureUrl: "",
      publicId: "",
      format: "",
      bytes: 0,
      error: err?.message || "An unexpected error occurred while communicating with Cloudinary.",
    };
  }
}

/**
 * Deletes an uploaded asset from Cloudinary.
 * Used for transactional rollback if an image batch or product creation fails.
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<boolean> {
  const config = getCloudinaryConfig();
  if (!config || !publicId) return false;

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`;
    const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", config.apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const destroyUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`;
    const res = await fetch(destroyUrl, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.result === "ok") {
      console.log(`🧹 [CLOUDINARY CLEANUP] Deleted asset: ${publicId}`);
      return true;
    } else {
      console.warn(`⚠️ [CLOUDINARY CLEANUP] Could not delete asset: ${publicId}`, data);
      return false;
    }
  } catch (err) {
    console.error(`❌ [CLOUDINARY CLEANUP ERROR] Failed to delete asset: ${publicId}`, err);
    return false;
  }
}
