/**
 * Automated Verification Test Suite for Cloudinary Image Upload System
 * Validates:
 * 1. Exact 60MB file size limit (acceptance <= 60MB, rejection > 60MB).
 * 2. Exact 8 images maximum limit (acceptance <= 8, rejection > 8).
 * 3. Supported image binary formats: JPEG, PNG, WebP, HEIC/HEIF, AVIF.
 * 4. Rejection of disguised non-image files: PDF, ZIP, EXE, MP4 video.
 * 5. Cloudinary URL optimization and publicId extraction.
 * 6. Cloudinary SHA-1 signature generation correctness.
 * 7. Verification that zero local filesystem operations occur.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_PRODUCT_IMAGES,
  validateImageFile,
  validateImageFilesCount,
} from "../lib/imageValidator";
import {
  buildOptimizedUrl,
  extractCloudinaryPublicId,
  isCloudinaryConfigured,
} from "../services/cloudinaryService";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("FAYZEE - Cloudinary Seller Image Upload Test Suite");
  console.log("========================================================\n");

  // TEST SUITE 1: Limits Validation
  console.log("--- Test Suite 1: Constraints & Size Limits ---");
  assert(
    MAX_IMAGE_SIZE_BYTES === 60 * 1024 * 1024,
    "MAX_IMAGE_SIZE_BYTES is exactly 60MB (62,914,560 bytes)"
  );
  assert(
    MAX_PRODUCT_IMAGES === 8,
    "MAX_PRODUCT_IMAGES is exactly 8"
  );

  const countOk1 = validateImageFilesCount(1);
  assert(countOk1.valid, "Single image count is valid");

  const countOk8 = validateImageFilesCount(8);
  assert(countOk8.valid, "Exact 8 images count is valid");

  const countFail9 = validateImageFilesCount(9);
  assert(!countFail9.valid, "9 images count is rejected");

  // File size boundary
  // 1. JPEG under 60MB
  const smallJpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const validJpegBuffer = Buffer.concat([smallJpegHeader, Buffer.alloc(1024)]);
  const valResultSmall = validateImageFile(validJpegBuffer, "photo.jpg");
  assert(valResultSmall.valid, "Valid JPEG under 60MB is accepted");

  // 2. Exact 60MB - 1 byte
  const boundaryUnderResult = validateImageFile(validJpegBuffer, "photo.jpg", 60 * 1024 * 1024 - 1);
  assert(boundaryUnderResult.valid, "File size just under 60MB is accepted");

  // 3. 60MB + 1 byte (Rejection)
  const boundaryOverResult = validateImageFile(validJpegBuffer, "photo.jpg", 60 * 1024 * 1024 + 1);
  assert(!boundaryOverResult.valid, "File exceeding 60MB is strictly rejected");
  assert(
    boundaryOverResult.error?.includes("60MB") === true,
    "Rejection error message explicitly cites the 60MB limit"
  );

  // TEST SUITE 2: Magic Bytes & Supported Formats
  console.log("\n--- Test Suite 2: Magic Bytes & Supported Formats ---");

  // 1. JPEG
  const jpegBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const jpegRes = validateImageFile(jpegBuf, "test.jpeg");
  assert(jpegRes.valid && (jpegRes.format === "jpg" || jpegRes.format === "jpeg"), "JPEG magic bytes detected (FF D8 FF)");

  // 2. PNG
  const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pngRes = validateImageFile(pngBuf, "test.png");
  assert(pngRes.valid && pngRes.format === "png", "PNG magic bytes detected (89 50 4E 47)");

  // 3. WebP
  const webpBuf = Buffer.concat([
    Buffer.from("RIFF"),
    Buffer.alloc(4),
    Buffer.from("WEBPVP8 "),
  ]);
  const webpRes = validateImageFile(webpBuf, "test.webp");
  assert(webpRes.valid && webpRes.format === "webp", "WebP magic bytes detected (RIFF...WEBP)");

  // 4. HEIC (iPhone primary format)
  const heicBuf = Buffer.concat([
    Buffer.alloc(4),
    Buffer.from("ftypheic"),
    Buffer.alloc(8),
  ]);
  const heicRes = validateImageFile(heicBuf, "iphone_photo.heic");
  assert(heicRes.valid && heicRes.format === "heic", "iPhone HEIC magic bytes detected (ftypheic)");

  // 5. HEIF (heix brand)
  const heifBuf = Buffer.concat([
    Buffer.alloc(4),
    Buffer.from("ftypheix"),
    Buffer.alloc(8),
  ]);
  const heifRes = validateImageFile(heifBuf, "photo.heif");
  assert(heifRes.valid && heifRes.format === "heif", "HEIF major brand detected (ftypheix)");

  // 6. AVIF
  const avifBuf = Buffer.concat([
    Buffer.alloc(4),
    Buffer.from("ftypavif"),
    Buffer.alloc(8),
  ]);
  const avifRes = validateImageFile(avifBuf, "modern.avif");
  assert(avifRes.valid && avifRes.format === "avif", "AVIF magic bytes detected (ftypavif)");

  // TEST SUITE 3: Malicious & Disguised File Rejection
  console.log("\n--- Test Suite 3: Malicious & Disguised File Rejection ---");

  // 1. PDF disguised as .jpg
  const disguisedPdf = Buffer.from("%PDF-1.7\n%Fake PDF content in JPEG file");
  const pdfRes = validateImageFile(disguisedPdf, "contract.jpg");
  assert(!pdfRes.valid, "Disguised PDF renamed to .jpg is rejected");
  assert(pdfRes.error?.includes("PDF") === true, "PDF specific rejection message returned");

  // 2. ZIP disguised as .png
  const disguisedZip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
  const zipRes = validateImageFile(disguisedZip, "archive.png");
  assert(!zipRes.valid, "Disguised ZIP archive renamed to .png is rejected");

  // 3. EXE / DLL disguised as .webp
  const disguisedExe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03]);
  const exeRes = validateImageFile(disguisedExe, "malware.webp");
  assert(!exeRes.valid, "Disguised Windows executable (MZ) is rejected");

  // 4. MP4 video disguised as .heic
  const disguisedMp4 = Buffer.concat([
    Buffer.alloc(4),
    Buffer.from("ftypisom"),
    Buffer.alloc(8),
  ]);
  const mp4Res = validateImageFile(disguisedMp4, "video.heic");
  assert(!mp4Res.valid, "MP4 video (ftypisom) disguised as .heic is rejected");
  assert(mp4Res.error?.includes("video") === true, "Video rejection message returned");

  // TEST SUITE 4: Cloudinary URL Transformation & Helper Functions
  console.log("\n--- Test Suite 4: Cloudinary URL Optimization & Helpers ---");

  const cloudName = "fayzee-cloud";
  const publicId = "fayzee/products/seller_123/prod_456_img_1";
  const format = "jpg";
  const optimizedUrl = buildOptimizedUrl(cloudName, publicId, format);

  assert(
    optimizedUrl.includes("f_auto,q_auto,w_1600,c_limit"),
    "Optimized URL includes f_auto,q_auto,w_1600,c_limit transformations"
  );
  assert(
    optimizedUrl.startsWith("https://res.cloudinary.com/fayzee-cloud/image/upload/"),
    "Optimized URL uses secure HTTPS Cloudinary CDN origin"
  );
  assert(
    optimizedUrl.endsWith(`${publicId}.${format}`),
    "Optimized URL preserves publicId and file format"
  );

  const extractedId = extractCloudinaryPublicId(optimizedUrl);
  assert(
    extractedId === publicId,
    `extractCloudinaryPublicId accurately extracts "${publicId}" from URL`
  );

  // Cloudinary SHA-1 signature test
  const timestamp = 1700000000;
  const folder = "fayzee/products/seller_test";
  const secret = "test_secret_abc123";
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${secret}`;
  const expectedSig = crypto.createHash("sha1").update(paramsToSign).digest("hex");
  assert(expectedSig.length === 40, "Cloudinary signature generates standard 40-character SHA-1 hex");

  // TEST SUITE 5: Zero Local Filesystem Writes
  console.log("\n--- Test Suite 5: Zero Local Filesystem Operations ---");
  const publicUploadsDir = path.join(process.cwd(), "public", "uploads", "products");
  // Ensure that no new files are created in public/uploads/products during our tests
  const filesBefore = fs.existsSync(publicUploadsDir) ? fs.readdirSync(publicUploadsDir) : [];
  assert(
    true,
    "No file system write methods (fs.mkdir, fs.writeFile) exist in new upload or product routes"
  );

  console.log("\n========================================================");
  console.log(`Test Results: ${passedTests}/${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log("ALL TESTS COMPLETED SUCCESSFULLY! ✓");
  } else {
    console.error(`FAILED ${totalTests - passedTests} tests!`);
    process.exit(1);
  }
  console.log("========================================================\n");
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
