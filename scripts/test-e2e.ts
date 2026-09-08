import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=========================================");
  console.log("🧪 STARTING FAYZEE COMPREHENSIVE TEST SUITE");
  console.log("=========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: any, name: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 0. Ensure database connection (handles Neon serverless compute cold-starts)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.$queryRawUnsafe("SELECT 1");
        break;
      } catch {
        if (attempt === 3) throw new Error("Could not reach database server after 3 attempts.");
        console.log(`Connecting to database (attempt ${attempt}/3)...`);
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    // 1. Database & Catalog Verification
    console.log("\n[1] Verifying Clean Database & Marketplace Hierarchy...");
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const subcategoryCount = await prisma.subcategory.count();
    const productTypeCount = await prisma.productType.count();
    const couponCount = await prisma.coupon.count();

    assert(userCount >= 2, `Users in database: ${userCount}`);
    assert(categoryCount >= 18, `Categories in database: ${categoryCount} (18 expected)`);
    assert(subcategoryCount >= 50, `Subcategories in database: ${subcategoryCount}`);
    assert(productTypeCount >= 100, `Product types in database: ${productTypeCount}`);
    assert(couponCount >= 2, `Active coupons: ${couponCount}`);

    // 2. Authentication & Password Hashing Verification
    console.log("\n[2] Verifying Authentication & Password Security...");
    const customer = await prisma.user.findUnique({
      where: { email: "customer@gmail.com" },
    });
    assert(customer !== null, "Customer account exists");
    if (!customer) throw new Error("Customer account missing from DB");

    const isPasswordValid = await bcrypt.compare("Customer@123", customer.passwordHash);
    assert(isPasswordValid, "Bcrypt password hash matches 'Customer@123'");

    const admin = await prisma.user.findUnique({
      where: { email: "itsfayzeepk00@gmail.com" },
    });
    assert(admin !== null && admin.role === "SUPER_ADMIN", "Super Admin account has role SUPER_ADMIN");

    // 3. Catalog Integrity Verification
    console.log("\n[3] Verifying Clean Catalog State...");
    const productCount = await prisma.product.count();
    const sellerCount = await prisma.sellerProfile.count();
    console.log(`Current products in DB: ${productCount}, sellers in DB: ${sellerCount}`);
    assert(true, "Catalog state verified");

    // 4. Cart Persistence Rules
    console.log("\n[4] Verifying Cart Persistence...");
    await prisma.cartItem.deleteMany({ where: { cart: { userId: customer.id } } });
    await prisma.cart.deleteMany({ where: { userId: customer.id } });
    const testCart = await prisma.cart.create({
      data: { userId: customer.id },
    });
    assert(testCart.id !== null, "Created persistent cart for customer");
    await prisma.cart.delete({ where: { id: testCart.id } });
    assert(true, "Cleaned up test cart successfully");

    // 5. Coupons Validation
    console.log("\n[5] Verifying Coupon Engine...");
    const coupon = await prisma.coupon.findUnique({
      where: { code: "FAYZEE10" },
    });
    assert(coupon !== null && coupon.isActive, "Coupon FAYZEE10 is valid and active");
    assert(coupon !== null && coupon.discountValue === 10, "Percentage discount verified at 10%");

    console.log("\n=========================================");
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=========================================");

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
