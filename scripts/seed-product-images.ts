import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import prisma from "../lib/db";

const PRODUCT_IMAGE_MAPPINGS: Record<
  string,
  { url: string; alt: string }
> = {
  samsung: {
    url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    alt: "Samsung Galaxy S24 Ultra Smartphone",
  },
  sony: {
    url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    alt: "Sony WH-1000XM5 Noise Canceling Headphones",
  },
  nike: {
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    alt: "Nike Air Max 270 Sneakers",
  },
  philips: {
    url: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80",
    alt: "Philips Digital Air Fryer XL",
  },
};

async function seedProductImages() {
  console.log("==================================================");
  console.log("📸 SEEDING AUTHENTIC PRODUCT IMAGES IN POSTGRESQL");
  console.log("==================================================");

  // Database connection warmup (Neon cold starts)
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

  const products = await prisma.product.findMany({
    include: { images: true },
  });

  console.log(`Found ${products.length} products in database.`);

  for (const product of products) {
    const titleLower = product.title.toLowerCase();
    let mappingKey = "";

    if (titleLower.includes("samsung") || titleLower.includes("s24")) {
      mappingKey = "samsung";
    } else if (titleLower.includes("sony") || titleLower.includes("wh-1000xm5") || titleLower.includes("headphones")) {
      mappingKey = "sony";
    } else if (titleLower.includes("nike") || titleLower.includes("air max") || titleLower.includes("sneakers")) {
      mappingKey = "nike";
    } else if (titleLower.includes("philips") || titleLower.includes("air fryer")) {
      mappingKey = "philips";
    }

    if (!mappingKey) {
      console.log(`⚠️ No specific mapping for product: "${product.title}" (${product.id})`);
      continue;
    }

    const mapping = PRODUCT_IMAGE_MAPPINGS[mappingKey];

    // Check if product already has images
    const existingWatchImages = product.images.filter((img) =>
      img.url.includes("photo-1523275335684-37898b6baf30")
    );

    if (existingWatchImages.length > 0) {
      console.log(`🗑️ Removing ${existingWatchImages.length} incorrect watch image(s) from "${product.title}"...`);
      await prisma.productImage.deleteMany({
        where: {
          productId: product.id,
          url: { contains: "photo-1523275335684-37898b6baf30" },
        },
      });
    }

    // Check if the authentic image already exists
    const hasAuthenticImage = product.images.some((img) => img.url === mapping.url);

    if (!hasAuthenticImage) {
      console.log(`✨ Adding authentic image for "${product.title}"...`);
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: mapping.url,
          alt: mapping.alt,
          isThumbnail: true,
          sortOrder: 0,
        },
      });
      console.log(`   -> Attached: ${mapping.url}`);
    } else {
      // Ensure it is set as thumbnail
      await prisma.productImage.updateMany({
        where: { productId: product.id, url: mapping.url },
        data: { isThumbnail: true, sortOrder: 0 },
      });
      console.log(`   -> Verified authentic image for "${product.title}"`);
    }
  }

  // Verification step
  console.log("\n--- VERIFYING UPDATED PRODUCT IMAGES ---");
  const updatedProducts = await prisma.product.findMany({
    include: {
      images: {
        orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
      },
    },
  });

  for (const p of updatedProducts) {
    const primaryImg = p.images[0]?.url || "NONE";
    console.log(`Product: [${p.title}]`);
    console.log(`  Primary Image: ${primaryImg}`);
    console.log(`  Total Images: ${p.images.length}`);
  }

  console.log("\n✅ Product image seeding complete!");
}

seedProductImages()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
