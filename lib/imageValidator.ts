/**
 * FAYZEE Image Validation Utility
 * 
 * Provides server-side validation for product images:
 * - Exact limit: 10MB per image file
 * - Exact limit: 8 images max per product
 * - Real magic bytes / binary signature inspection
 * - Support for JPG, JPEG, PNG, WebP, HEIC, HEIF, AVIF, GIF, BMP, TIFF
 * - Strict rejection of non-image formats (PDF, ZIP, MP4, EXE, etc.)
 */

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB in bytes = 10,485,760
export const MAX_PRODUCT_IMAGES = 8;

export interface ImageValidationResult {
  valid: boolean;
  format?: string;
  mimeType?: string;
  error?: string;
}

/**
 * Validates the number of image files uploaded for a single product.
 */
export function validateImageFilesCount(count: number): { valid: boolean; error?: string } {
  if (count <= 0) {
    return { valid: false, error: "At least one product image is required." };
  }
  if (count > MAX_PRODUCT_IMAGES) {
    return {
      valid: false,
      error: `Cannot upload more than ${MAX_PRODUCT_IMAGES} images per product. You provided ${count}.`,
    };
  }
  return { valid: true };
}

/**
 * Inspects a file buffer's magic bytes to determine if it is a genuine, safe image format.
 * Never relies solely on file extensions.
 */
export function validateImageBuffer(buffer: Buffer, fileName = "image", explicitSize?: number): ImageValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: `File "${fileName}" is empty.` };
  }

  const effectiveSize = explicitSize !== undefined ? explicitSize : buffer.length;
  if (effectiveSize > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (effectiveSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File "${fileName}" exceeds the 10MB limit (${sizeMb}MB). Maximum allowed size is 10MB per image.`,
    };
  }

  // Need at least 4 bytes for basic signature checking
  if (buffer.length < 4) {
    return { valid: false, error: `File "${fileName}" is corrupted or too small to be a valid image.` };
  }

  // 1. Check for known malicious / rejected formats first
  // PDF: %PDF (25 50 44 46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: false, error: `File "${fileName}" is a PDF document, not an image.` };
  }

  // ZIP / DOCX / XLSX / APK: PK\x03\x04 (50 4B 03 04)
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return { valid: false, error: `File "${fileName}" is an archive or document file, not an image.` };
  }

  // Windows Executable: MZ (4D 5A)
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return { valid: false, error: `File "${fileName}" is an executable file and cannot be uploaded.` };
  }

  // 2. JPEG / JPG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: "jpg", mimeType: "image/jpeg" };
  }

  // 3. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: "png", mimeType: "image/png" };
  }

  // 4. WebP: RIFF (bytes 0-3) ... WEBP (bytes 8-11)
  if (buffer.length >= 12) {
    const riff = buffer.subarray(0, 4).toString("ascii");
    const webp = buffer.subarray(8, 12).toString("ascii");
    if (riff === "RIFF" && webp === "WEBP") {
      return { valid: true, format: "webp", mimeType: "image/webp" };
    }
  }

  // 5. ISOBMFF Box (Offset 4..8 is "ftyp") -> HEIC, HEIF, AVIF or MP4 Video
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const majorBrand = buffer.subarray(8, 12).toString("ascii").toLowerCase();
    
    // HEIC / HEIF Brands (Apple iPhone and modern camera outputs)
    const heicBrands = ["heic", "heim", "heis", "hevc", "hevx"];
    const heifBrands = ["heix", "mif1", "msf1"];
    if (heicBrands.includes(majorBrand)) {
      return { valid: true, format: "heic", mimeType: "image/heic" };
    }
    if (heifBrands.includes(majorBrand)) {
      return { valid: true, format: "heif", mimeType: "image/heif" };
    }

    // AVIF Brands
    if (majorBrand === "avif" || majorBrand === "avis") {
      return { valid: true, format: "avif", mimeType: "image/avif" };
    }

    // Video formats sharing ISOBMFF container (MP4, MOV) -> REJECT
    const videoBrands = ["isom", "mp41", "mp42", "qt  ", "dash", "mmp4", "3gp4", "3gp5", "3gp6"];
    if (videoBrands.includes(majorBrand)) {
      return { valid: false, error: `File "${fileName}" is a video file (${majorBrand.trim()}), not an image.` };
    }

    // Check compatible brands in the rest of the ftyp header (up to 32 bytes)
    const compatibleArea = buffer.subarray(12, Math.min(buffer.length, 36)).toString("ascii").toLowerCase();
    for (const hb of heicBrands) {
      if (compatibleArea.includes(hb)) {
        return { valid: true, format: "heic", mimeType: "image/heic" };
      }
    }
    if (compatibleArea.includes("avif") || compatibleArea.includes("avis")) {
      return { valid: true, format: "avif", mimeType: "image/avif" };
    }
  }

  // 6. GIF: GIF87a or GIF89a
  const gifHeader = buffer.subarray(0, 6).toString("ascii");
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
    return { valid: true, format: "gif", mimeType: "image/gif" };
  }

  // 7. BMP: BM (42 4D)
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return { valid: true, format: "bmp", mimeType: "image/bmp" };
  }

  // 8. TIFF: II*\0 (49 49 2A 00) or MM\0* (4D 4D 00 2A)
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
    (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a)
  ) {
    return { valid: true, format: "tiff", mimeType: "image/tiff" };
  }

  // Unsupported or unrecognized format
  return {
    valid: false,
    error: `File "${fileName}" is not a recognized image format. Supported formats: JPG, JPEG, PNG, WebP, HEIC, HEIF, AVIF.`,
  };
}

export const validateImageFile = validateImageBuffer;

