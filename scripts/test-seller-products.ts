import { AUTH_COOKIE_NAME, signToken } from "../lib/auth";
import prisma from "../lib/db";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function waitForDb(maxRetries = 5, delayMs = 3500) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (e: any) {
      console.log(`  [DB Retry ${i}/${maxRetries}] Waiting for database...`);
      if (i === maxRetries) throw e;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function fetchWithRetry(url: string, options?: RequestInit, maxRetries = 5, delayMs = 2500): Promise<Response> {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const res = await fetch(url, options);
      // If server returned 500 (e.g. database cold-start handshake), retry
      if (res.status === 500 && i < maxRetries) {
        console.log(`  [Fetch Retry ${i}/${maxRetries}] Server returned 500, retrying...`);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      return res;
    } catch (e) {
      if (i === maxRetries) throw e;
      console.log(`  [Fetch Retry ${i}/${maxRetries}] Connection error, retrying...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return fetch(url, options);
}

// 1x1 valid PNG image buffer
const VALID_PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, // IEND chunk
  0x42, 0x60, 0x82,
]);

// 1x1 valid JPEG image buffer
const VALID_JPEG_BUFFER = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
  0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
  0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
  0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
  0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
  0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
  0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
  0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
  0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
  0x00, 0xbf, 0x80, 0xff, 0xd9,
]);

async function runTests() {
  console.log("\n============================================================");
  console.log("   FAYZEE SELLER PRODUCT IMAGE & FOREIGN KEY TEST SUITE");
  console.log("============================================================\n");

  await waitForDb();

  // Find or create test seller
  let sellerUser = await prisma.user.findFirst({
    where: { role: "SELLER", sellerProfile: { status: "APPROVED" } },
    include: { sellerProfile: true },
  });

  if (!sellerUser || !sellerUser.sellerProfile) {
    console.log("  [Setup] Creating test approved seller...");
    sellerUser = await prisma.user.create({
      data: {
        email: `test-seller-${Date.now()}@fayzee.store`,
        name: "Automated Test Seller",
        passwordHash: "$2a$10$e8W...",
        role: "SELLER",
        sellerProfile: {
          create: {
            storeName: "Test Electronics Hub",
            businessName: "Test Electronics Ltd",
            storeSlug: `test-hub-${Date.now()}`,
            status: "APPROVED",
          },
        },
      },
      include: { sellerProfile: true },
    });
  }

  // Find or create test customer
  let customerUser = await prisma.user.findFirst({
    where: { role: "CUSTOMER" },
  });

  if (!customerUser) {
    customerUser = await prisma.user.create({
      data: {
        email: `test-customer-${Date.now()}@gmail.com`,
        name: "Test Customer",
        passwordHash: "$2a$10$e8W...",
        role: "CUSTOMER",
      },
    });
  }

  const sellerToken = signToken({
    userId: sellerUser.id,
    email: sellerUser.email,
    role: sellerUser.role as any,
    name: sellerUser.name,
  });

  const customerToken = signToken({
    userId: customerUser.id,
    email: customerUser.email,
    role: customerUser.role as any,
    name: customerUser.name,
  });

  const sellerCookieHeader = `${AUTH_COOKIE_NAME}=${sellerToken}`;
  const customerCookieHeader = `${AUTH_COOKIE_NAME}=${customerToken}`;

  // ------------------------------------------------------------
  // TEST 1: CATEGORY SELECTION API (GET /api/categories)
  // ------------------------------------------------------------
  console.log("TEST 1: Category Selection API (GET /api/categories)");
  const catRes = await fetchWithRetry(`${BASE_URL}/api/categories`);
  assert(catRes.status === 200, "GET /api/categories returns HTTP 200");
  const catData = await catRes.json();
  assert(Array.isArray(catData.categories), "Returns an array of categories");
  assert(catData.categories.length > 0, "At least one category exists in database");

  const sampleCategory = catData.categories[0];
  assert(typeof sampleCategory.id === "string", "Category contains valid CUID id");
  assert(typeof sampleCategory.name === "string", "Category contains name");
  console.log(`  ✓ Sample Category: "${sampleCategory.name}" (ID: ${sampleCategory.id})\n`);

  // ------------------------------------------------------------
  // TEST 2: IMAGE UPLOAD AUTHENTICATION & ACCESS CONTROL
  // ------------------------------------------------------------
  console.log("TEST 2: Image Upload Authentication & Role Enforcement");

  // Unauthenticated user
  const unauthUploadRes = await fetchWithRetry(`${BASE_URL}/api/upload`, {
    method: "POST",
  });
  assert(
    unauthUploadRes.status === 403,
    "Unauthenticated upload rejected with HTTP 403"
  );

  // Customer user (not a seller)
  const customerFormData = new FormData();
  customerFormData.append(
    "file",
    new Blob([VALID_PNG_BUFFER], { type: "image/png" }),
    "test.png"
  );

  const customerUploadRes = await fetchWithRetry(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Cookie: customerCookieHeader },
    body: customerFormData,
  });
  assert(
    customerUploadRes.status === 403,
    "Normal customer user rejected from uploading seller images (HTTP 403)"
  );
  console.log("");

  // ------------------------------------------------------------
  // TEST 3: IMAGE UPLOAD VALIDATION & SECURITY
  // ------------------------------------------------------------
  console.log("TEST 3: File Format & Size Validation on Server");

  // Missing file in request
  const emptyFormData = new FormData();
  const emptyUploadRes = await fetchWithRetry(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Cookie: sellerCookieHeader },
    body: emptyFormData,
  });
  assert(emptyUploadRes.status === 400, "Empty upload rejected with HTTP 400");

  // Oversized file (> 5MB)
  const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024); // 5.5 MB
  const oversizedFormData = new FormData();
  oversizedFormData.append(
    "file",
    new Blob([oversizedBuffer], { type: "image/png" }),
    "huge-image.png"
  );

  const oversizedRes = await fetchWithRetry(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Cookie: sellerCookieHeader },
    body: oversizedFormData,
  });
  assert(oversizedRes.status === 400, "Oversized file (>5MB) rejected with HTTP 400");
  const oversizedData = await oversizedRes.json();
  assert(
    oversizedData.error.includes("5MB"),
    "Oversized error explicitly mentions 5MB limit"
  );

  // Disguised non-image file (.txt disguised as image/png)
  const fakeImageBuffer = Buffer.from("Hello world, this is a plain text file pretending to be an image.");
  const fakeFormData = new FormData();
  fakeFormData.append(
    "file",
    new Blob([fakeImageBuffer], { type: "image/png" }),
    "fake.png"
  );

  const fakeRes = await fetchWithRetry(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Cookie: sellerCookieHeader },
    body: fakeFormData,
  });
  assert(
    fakeRes.status === 400,
    "Magic bytes check detects non-image buffer and rejects (HTTP 400)"
  );
  console.log("");

  // ------------------------------------------------------------
  // TEST 4: SUCCESSFUL DEVICE IMAGE UPLOAD (PNG & JPEG)
  // ------------------------------------------------------------
  console.log("TEST 4: Successful Device Image Upload (PNG & JPEG)");

  const validFormData = new FormData();
  validFormData.append(
    "files",
    new Blob([VALID_PNG_BUFFER], { type: "image/png" }),
    "product-main.png"
  );
  validFormData.append(
    "files",
    new Blob([VALID_JPEG_BUFFER], { type: "image/jpeg" }),
    "product-side.jpg"
  );

  const validUploadRes = await fetchWithRetry(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Cookie: sellerCookieHeader },
    body: validFormData,
  });

  assert(validUploadRes.status === 200, "Valid image upload returns HTTP 200");
  const uploadData = await validUploadRes.json();
  assert(uploadData.success === true, "Upload response indicates success: true");
  assert(Array.isArray(uploadData.urls), "Returns array of uploaded URLs");
  assert(uploadData.urls.length === 2, "Both images uploaded successfully");
  assert(
    uploadData.urls[0].startsWith("/uploads/products/"),
    "First image stored in /uploads/products/"
  );
  assert(
    uploadData.urls[1].startsWith("/uploads/products/"),
    "Second image stored in /uploads/products/"
  );

  // Verify files physically exist on disk
  const firstFilename = path.basename(uploadData.urls[0]);
  const diskPath = path.join(process.cwd(), "public", "uploads", "products", firstFilename);
  assert(fs.existsSync(diskPath), "Image file physically exists in public/uploads/products/");
  console.log(`  ✓ Image stored locally at: ${diskPath}\n`);

  // ------------------------------------------------------------
  // TEST 5: FOREIGN KEY VIOLATION ROOT-CAUSE & REJECTION TEST
  // ------------------------------------------------------------
  console.log("TEST 5: Foreign Key Constraint Error Prevention");

  // Attempt to create product with invalid/random category ID
  const invalidCatRes = await fetchWithRetry(`${BASE_URL}/api/seller/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sellerCookieHeader,
    },
    body: JSON.stringify({
      title: "Test Product With Invalid Category",
      categoryId: "invalid-non-existent-category-id-12345",
      price: 2500,
      description: "Testing foreign key defense",
      images: [{ url: uploadData.urls[0], isThumbnail: true }],
    }),
  });

  assert(
    invalidCatRes.status === 400,
    "Invalid category ID returns HTTP 400 validation error (NOT 500 crash)"
  );
  const invalidCatData = await invalidCatRes.json();
  assert(
    invalidCatData.error.includes("category"),
    "Returns user-friendly category error message: '" + invalidCatData.error + "'"
  );
  console.log("");

  // ------------------------------------------------------------
  // TEST 6: COMPLETE PRODUCT CREATION WITH MULTIPLE UPLOADED IMAGES
  // ------------------------------------------------------------
  console.log("TEST 6: Product Creation With Valid Category & Multiple Images");

  const productTitle = `Wireless Test Headset Pro ${Date.now()}`;
  const createProdRes = await fetchWithRetry(`${BASE_URL}/api/seller/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sellerCookieHeader,
    },
    body: JSON.stringify({
      title: productTitle,
      categoryId: sampleCategory.id, // REAL DB CATEGORY ID
      price: 4999,
      salePrice: 4499,
      stockQuantity: 35,
      description: "High-fidelity active noise-cancelling test headphones.",
      images: [
        { url: uploadData.urls[0], isThumbnail: true, sortOrder: 0 },
        { url: uploadData.urls[1], isThumbnail: false, sortOrder: 1 },
      ],
    }),
  });

  assert(createProdRes.status === 200, "Product created successfully with HTTP 200");
  const createProdData = await createProdRes.json();
  assert(createProdData.product && createProdData.product.id, "Product has valid ID");
  assert(createProdData.product.sellerId === sellerUser.sellerProfile!.id, "Seller ID correctly bound to session");
  assert(createProdData.product.categoryId === sampleCategory.id, "Category ID correctly bound");
  assert(createProdData.product.images.length === 2, "All 2 images saved to ProductImage relation");
  assert(createProdData.product.images[0].isThumbnail === true, "First image marked as isThumbnail: true");

  const createdProductId = createProdData.product.id;
  const createdProductSlug = createProdData.product.slug;
  console.log(`  ✓ Created Product: "${productTitle}" (ID: ${createdProductId})\n`);

  // ------------------------------------------------------------
  // TEST 7: PRODUCT VISIBILITY IN SELLER DASHBOARD
  // ------------------------------------------------------------
  console.log("TEST 7: Product Visibility in Seller Dashboard (GET /api/seller/products)");
  const sellerListRes = await fetchWithRetry(`${BASE_URL}/api/seller/products`, {
    headers: { Cookie: sellerCookieHeader },
  });
  assert(sellerListRes.status === 200, "Seller products list returns HTTP 200");
  const sellerListData = await sellerListRes.json();
  const foundInSeller = sellerListData.products.find((p: any) => p.id === createdProductId);
  assert(!!foundInSeller, "Newly created product appears in seller's listings");
  assert(
    foundInSeller.images[0]?.url === uploadData.urls[0],
    "Main thumbnail URL matches uploaded image"
  );
  console.log("");

  // ------------------------------------------------------------
  // TEST 8: PRODUCT VISIBILITY IN PUBLIC MARKETPLACE
  // ------------------------------------------------------------
  console.log("TEST 8: Product Visibility in Public Marketplace (GET /api/products)");
  const marketRes = await fetchWithRetry(`${BASE_URL}/api/products?q=${encodeURIComponent(productTitle)}`);
  assert(marketRes.status === 200, "Marketplace products search returns HTTP 200");
  const marketData = await marketRes.json();
  const foundInMarket = marketData.products.find((p: any) => p.id === createdProductId);
  assert(!!foundInMarket, "Newly created product is indexed and searchable in marketplace");
  console.log("");

  // ------------------------------------------------------------
  // TEST 9: SELLER PRODUCT DELETION & ACCESS CONTROL
  // ------------------------------------------------------------
  console.log("TEST 9: Seller Product Deletion & Access Control");

  // Customer cannot delete seller product
  const customerDeleteRes = await fetchWithRetry(`${BASE_URL}/api/seller/products?id=${createdProductId}`, {
    method: "DELETE",
    headers: { Cookie: customerCookieHeader },
  });
  assert(customerDeleteRes.status === 403, "Customer user cannot delete seller product (HTTP 403)");

  // Authorized seller deletes their product
  const sellerDeleteRes = await fetchWithRetry(`${BASE_URL}/api/seller/products?id=${createdProductId}`, {
    method: "DELETE",
    headers: { Cookie: sellerCookieHeader },
  });
  assert(sellerDeleteRes.status === 200, "Authorized seller deleted product successfully (HTTP 200)");

  // Verify deletion in DB
  const dbCheck = await prisma.product.findUnique({ where: { id: createdProductId } });
  assert(dbCheck === null, "Product cleanly removed from PostgreSQL database");

  // Clean up test image files
  for (const url of uploadData.urls) {
    const filename = path.basename(url);
    const filePath = path.join(process.cwd(), "public", "uploads", "products", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  console.log("  ✓ Test upload files cleaned up.\n");

  // ------------------------------------------------------------
  // FINAL SUMMARY
  // ------------------------------------------------------------
  console.log("============================================================");
  console.log(`TOTAL ASSERTIONS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL SELLER PRODUCT & IMAGE SYSTEM TESTS PASSED!");
  }
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
