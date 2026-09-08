import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import prisma from "../lib/db";
import { toolSearchProducts, handleFayzeeAIChat } from "../services/aiService";
import fs from "fs";
import path from "path";

const WATCH_URL_SNIPPET = "photo-1523275335684-37898b6baf30";

async function verifyProductImages() {
  console.log("=================================================================");
  console.log("🔍 FAYZEE PRODUCT IMAGE FIX — VERIFICATION SUITE");
  console.log("=================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      if (details) console.log(`     -> ${details}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      if (details) console.error(`     -> ${details}`);
      failed++;
    }
  }

  try {
    // Warmup database
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await prisma.$queryRawUnsafe("SELECT 1");
        break;
      } catch {
        if (attempt === 5) throw new Error("Could not reach database server after 5 attempts.");
        console.log(`Connecting to database (attempt ${attempt}/5)...`);
        await new Promise((resolve) => setTimeout(resolve, 3500));
      }
    }

    // 1. Direct PostgreSQL inspection of Product and ProductImage tables
    console.log("\n[VERIFICATION 1] PostgreSQL Database Records:");
    const productsInDb = await prisma.product.findMany({
      include: {
        images: {
          orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
        },
      },
    });

    assert(productsInDb.length >= 4, "Database contains all 4 target catalog products");

    const samsung = productsInDb.find((p) => p.title.toLowerCase().includes("samsung"));
    const sony = productsInDb.find((p) => p.title.toLowerCase().includes("sony"));
    const nike = productsInDb.find((p) => p.title.toLowerCase().includes("nike"));
    const philips = productsInDb.find((p) => p.title.toLowerCase().includes("philips"));

    assert(!!samsung && samsung.images.length > 0, "Samsung Galaxy S24 Ultra has ProductImage in PostgreSQL", samsung?.images[0]?.url);
    assert(!!sony && sony.images.length > 0, "Sony WH-1000XM5 has ProductImage in PostgreSQL", sony?.images[0]?.url);
    assert(!!nike && nike.images.length > 0, "Nike Air Max 270 has ProductImage in PostgreSQL", nike?.images[0]?.url);
    assert(!!philips && philips.images.length > 0, "Philips Digital Air Fryer XL has ProductImage in PostgreSQL", philips?.images[0]?.url);

    // 2. Product Specificity: Each product has a DIFFERENT authentic image
    console.log("\n[VERIFICATION 2] Product Image Distinctness & Specificity:");
    const urls = [
      samsung?.images[0]?.url,
      sony?.images[0]?.url,
      nike?.images[0]?.url,
      philips?.images[0]?.url,
    ].filter(Boolean);

    const uniqueUrls = new Set(urls);
    assert(
      uniqueUrls.size === 4,
      "All 4 products have unique, distinct product-specific image URLs",
      `4 unique out of 4: ${Array.from(uniqueUrls).join(", ")}`
    );

    assert(
      samsung?.images[0]?.url !== sony?.images[0]?.url,
      "Samsung Galaxy S24 Ultra and Sony WH-1000XM5 DO NOT share the same image"
    );

    // 3. Absolute Absence of Watch Placeholder in Database
    console.log("\n[VERIFICATION 3] Old Watch Placeholder Deprecation in Database:");
    const anyWatchInDb = await prisma.productImage.findMany({
      where: { url: { contains: WATCH_URL_SNIPPET } },
    });
    assert(
      anyWatchInDb.length === 0,
      "No ProductImage records in PostgreSQL contain the old watch placeholder URL"
    );

    // 4. Verification of toolSearchProducts returning correct image URLs
    console.log("\n[VERIFICATION 4] Search Products Tool Image Resolution:");
    const searchSamsung = await toolSearchProducts({ query: "samsung" });
    const searchSony = await toolSearchProducts({ query: "sony" });

    assert(
      !!searchSamsung[0]?.image && searchSamsung[0].image.includes("photo-1610945265064"),
      "Samsung search result includes actual Samsung smartphone image",
      searchSamsung[0]?.image
    );
    assert(
      !!searchSony[0]?.image && searchSony[0].image.includes("photo-1546435770"),
      "Sony search result includes actual Sony headphones image",
      searchSony[0]?.image
    );

    // 5. Verification of /api/chat (handleFayzeeAIChat) Product Cards
    console.log("\n[VERIFICATION 5] /api/chat Product Card Metadata Response:");
    const chatResult = await handleFayzeeAIChat({
      messages: [{ role: "user", content: "Show me Samsung Galaxy S24 Ultra and Sony WH-1000XM5" }],
    });

    const chatProducts = chatResult.metadata?.products || [];
    assert(chatProducts.length >= 2, "Chat returned 2 product cards in metadata");

    const chatSamsung = chatProducts.find((p) => p.title.toLowerCase().includes("samsung"));
    const chatSony = chatProducts.find((p) => p.title.toLowerCase().includes("sony"));

    assert(
      !!chatSamsung?.image && !chatSamsung.image.includes(WATCH_URL_SNIPPET),
      "Chat Samsung card uses authentic image (not the watch)",
      chatSamsung?.image
    );
    assert(
      !!chatSony?.image && !chatSony.image.includes(WATCH_URL_SNIPPET),
      "Chat Sony card uses authentic image (not the watch)",
      chatSony?.image
    );
    assert(
      chatSamsung?.image !== chatSony?.image,
      "Chat Samsung card and Sony card have DIFFERENT images"
    );

    // 6. Frontend Placeholder Asset Verification
    console.log("\n[VERIFICATION 6] Frontend Neutral Placeholder Asset:");
    const placeholderPath = path.join(process.cwd(), "public", "images", "product-placeholder.svg");
    const placeholderExists = fs.existsSync(placeholderPath);
    assert(placeholderExists, "public/images/product-placeholder.svg exists on filesystem");

    // 7. Verify codebase contains NO hardcoded watch fallbacks
    console.log("\n[VERIFICATION 7] Frontend Fallback Code Audit:");
    const filesToCheck = [
      "components/marketplace/ProductCard.tsx",
      "components/marketplace/ProductDetailView.tsx",
      "components/ai/FayzeeAIAssistant.tsx",
      "app/cart/page.tsx",
      "app/orders/page.tsx",
      "app/orders/[id]/page.tsx",
      "app/checkout/page.tsx",
      "app/seller/dashboard/page.tsx",
    ];

    for (const file of filesToCheck) {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const hasWatch = content.includes(WATCH_URL_SNIPPET);
        assert(!hasWatch, `${file} does not contain watch image fallback`);
      }
    }

  } catch (err: any) {
    console.error("Verification encountered an unexpected error:", err);
    failed++;
  }

  console.log("\n=================================================================");
  console.log(`IMAGE VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyProductImages()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
