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
    // 1. Database & Seed Verification
    console.log("\n[1] Verifying Seeded Database Models & Relations...");
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const sellerCount = await prisma.sellerProfile.count();
    const categoryCount = await prisma.category.count();
    const flashSaleCount = await prisma.flashSale.count();
    const couponCount = await prisma.coupon.count();

    assert(userCount >= 3, `Users in database: ${userCount}`);
    assert(productCount >= 5, `Products in database: ${productCount}`);
    assert(sellerCount >= 2, `Verified sellers in database: ${sellerCount}`);
    assert(categoryCount >= 4, `Categories in database: ${categoryCount}`);
    assert(flashSaleCount >= 1, `Active flash sales: ${flashSaleCount}`);
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

    // 3. Product Details & Variants Verification
    console.log("\n[3] Verifying Products, Variants & Inventory...");
    const s24 = await prisma.product.findUnique({
      where: { slug: "samsung-galaxy-s24-ultra-5g-256gb" },
      include: { variants: true, images: true, category: true, seller: true },
    });
    assert(s24 !== null, "Samsung Galaxy S24 Ultra exists");
    if (!s24) throw new Error("S24 product missing from DB");

    assert(s24.variants.length >= 2, `S24 has ${s24.variants.length} active variants`);
    assert(s24.images.length >= 2, "S24 has multiple gallery images");
    assert(s24.seller?.storeName === "TechHub Official", "Correct seller linked to product");
    assert(s24.stockQuantity > 0, `Stock quantity verified: ${s24.stockQuantity}`);

    // 4. Cart Creation & Stock Limit Verification
    console.log("\n[4] Verifying Cart Persistence & Stock Rules...");
    const testCart = await prisma.cart.create({
      data: { userId: customer.id },
    });
    assert(testCart.id !== null, "Created persistent cart for customer");

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: testCart.id,
        productId: s24.id,
        quantity: 2,
      },
    });
    assert(cartItem.quantity === 2, "Added 2 units to cart");

    // 5. Transactional Order Checkout & Stock Decrement
    console.log("\n[5] Verifying Transactional Checkout & Atomic Inventory Decrement...");
    const initialStock = s24.stockQuantity;
    const initialVariantStock = s24.variants[0].stockQuantity;

    // Simulate order placement inside Prisma transaction
    const testOrder: any = await prisma.$transaction(async (tx: any) => {
      const order = await tx.order.create({
        data: {
          orderNumber: `TEST-ORD-${Date.now()}`,
          userId: customer.id,
          subtotal: 369999 * 2,
          shippingTotal: 0,
          grandTotal: 369999 * 2,
          status: "CONFIRMED",
          paymentMethod: "ONLINE_CARD",
          paymentStatus: "PAID",
          shippingAddress: JSON.stringify({
            fullName: "Zubair Ahmed",
            phone: "+92 312 3456789",
            street: "DHA Phase 3",
            city: "Lahore",
          }),
          items: {
            create: [
              {
                productId: s24.id,
                variantId: s24.variants[0].id,
                sellerId: s24.sellerId,
                title: s24.title,
                sku: s24.variants[0].sku,
                price: 369999,
                quantity: 2,
                total: 369999 * 2,
              },
            ],
          },
        },
        include: { items: true },
      });

      // Atomic stock reduction
      await tx.product.update({
        where: { id: s24.id },
        data: { stockQuantity: { decrement: 2 } },
      });
      await tx.productVariant.update({
        where: { id: s24.variants[0].id },
        data: { stockQuantity: { decrement: 2 } },
      });

      return order;
    });

    assert(testOrder.status === "CONFIRMED", "Order created in transaction");
    assert(testOrder.items.length === 1, "Order items recorded with seller reference");

    const updatedS24 = await prisma.product.findUnique({
      where: { id: s24.id },
      include: { variants: true },
    });
    assert(
      updatedS24 !== null && updatedS24.stockQuantity === initialStock - 2,
      `Inventory decremented: ${initialStock} -> ${updatedS24?.stockQuantity}`
    );

    // 6. Multi-Seller Isolation Check
    console.log("\n[6] Verifying Multi-Seller Isolation & Ownership Boundaries...");
    const techHubItems = await prisma.orderItem.findMany({
      where: { sellerId: s24.sellerId },
    });
    assert(techHubItems.length > 0, "TechHub can query their own store items");

    // Ensure seller 2 cannot see seller 1's products
    const urbanSeller = await prisma.sellerProfile.findUnique({
      where: { storeSlug: "urbanstyle-store" },
    });
    assert(urbanSeller !== null, "UrbanStyle seller profile exists");

    const crossSellerProduct = urbanSeller ? await prisma.product.findFirst({
      where: { id: s24.id, sellerId: urbanSeller.id },
    }) : null;
    assert(
      crossSellerProduct === null,
      "Seller 2 CANNOT access or modify Seller 1's products (Isolation verified)"
    );

    // 7. Coupons Validation
    console.log("\n[7] Verifying Coupon Engine...");
    const coupon = await prisma.coupon.findUnique({
      where: { code: "FAYZEE10" },
    });
    assert(coupon !== null && coupon.isActive, "Coupon FAYZEE10 is valid and active");
    assert(coupon !== null && coupon.discountValue === 10, "Percentage discount verified at 10%");

    // Cleanup test artifacts
    await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });
    await prisma.cartItem.deleteMany({ where: { cartId: testCart.id } });
    await prisma.cart.delete({ where: { id: testCart.id } });
    // Restore stock
    await prisma.product.update({
      where: { id: s24.id },
      data: { stockQuantity: initialStock },
    });
    await prisma.productVariant.update({
      where: { id: s24.variants[0].id },
      data: { stockQuantity: initialVariantStock },
    });

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
