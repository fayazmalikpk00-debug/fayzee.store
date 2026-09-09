import dns from "dns";
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

import prisma from "../lib/db";

async function main() {
  console.log("==================================================");
  console.log("🧹 REMOVING DEMO PRODUCTS & DEMO SELLER ACCOUNTS");
  console.log("==================================================");

  // Warmup connection
  for (let i = 1; i <= 6; i++) {
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      break;
    } catch (err) {
      if (i === 6) throw err;
      console.log(`Waiting for DB (attempt ${i}/6)...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // 1. Delete associated product data: Cart items, Wishlist items, Reviews, FlashSaleItems, OrderItems, ProductImages, ProductVariants
  console.log("Checking products to delete...");
  const products = await prisma.product.findMany({
    select: { id: true, title: true, slug: true },
  });
  console.log(`Found ${products.length} products in database:`);
  products.forEach((p) => console.log(`  - [${p.id}] ${p.title} (${p.slug})`));

  if (products.length > 0) {
    const productIds = products.map((p) => p.id);

    console.log("Deleting product child relations...");
    await prisma.cartItem.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.wishlistItem.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.flashSaleItem.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.review.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.productImage.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.productVariant.deleteMany({ where: { productId: { in: productIds } } });

    console.log("Deleting products...");
    const deletedProducts = await prisma.product.deleteMany({
      where: { id: { in: productIds } },
    });
    console.log(`✅ Successfully deleted ${deletedProducts.count} products!`);
  }

  // 2. Identify demo sellers
  console.log("\nChecking seller accounts to delete...");
  const sellers = await prisma.sellerProfile.findMany({
    include: { user: true },
  });
  console.log(`Found ${sellers.length} seller profile(s):`);
  sellers.forEach((s) => console.log(`  - [${s.id}] Store: "${s.storeName}" (${s.user?.email})`));

  // Find any users with role SELLER or test emails
  const testSellers = await prisma.user.findMany({
    where: {
      OR: [
        { role: "SELLER" },
        { email: { contains: "test-seller" } },
        { email: { contains: "demo" } },
      ],
      NOT: {
        email: "itsfayzeepk00@gmail.com", // Super admin safeguard
      },
    },
    include: {
      sellerProfile: true,
      applications: true,
    },
  });

  console.log(`Found ${testSellers.length} demo/seller user(s) to remove:`);
  for (const u of testSellers) {
    console.log(`  - Deleting Seller User: ${u.name} <${u.email}> (${u.role})`);
    
    // Delete related seller data
    if (u.sellerProfile) {
      await prisma.sellerProfile.delete({ where: { id: u.sellerProfile.id } });
    }
    await prisma.sellerApplication.deleteMany({ where: { userId: u.id } });
    await prisma.notification.deleteMany({ where: { userId: u.id } });
    await prisma.address.deleteMany({ where: { userId: u.id } });
    
    // Delete user
    await prisma.user.delete({ where: { id: u.id } });
  }
  console.log("✅ Demo seller accounts deleted successfully!");

  // 3. Final Verification
  console.log("\n==================================================");
  console.log("📊 POST-CLEANUP DATABASE STATE");
  console.log("==================================================");
  const remainingProducts = await prisma.product.count();
  const remainingSellers = await prisma.sellerProfile.count();
  const remainingUsers = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true },
  });

  console.log(`Total Products remaining: ${remainingProducts}`);
  console.log(`Total Sellers remaining:  ${remainingSellers}`);
  console.log(`Total Users remaining:    ${remainingUsers.length}`);
  remainingUsers.forEach((u) => console.log(`  - ${u.email} [${u.role}] (${u.name})`));
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
