import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { COMPLETE_MARKETPLACE_HIERARCHY } from "../lib/categoryHierarchy";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Fayzee Marketplace Database with 18-Category Hierarchy...");

  // Clean existing transactional and catalog data
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.flashSaleItem.deleteMany();
  await prisma.flashSale.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productType.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.sellerApplication.deleteMany();
  await prisma.address.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Core Users (Super Admin and Customer)
  const adminPassword = await bcrypt.hash("Apple##21", 10);
  const customerPassword = await bcrypt.hash("Customer@123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "itsfayzeepk00@gmail.com",
      name: "Fayzee Super Admin",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      phone: "+92 300 1234567",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@gmail.com",
      name: "Zubair Ahmed",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      phone: "+92 312 3456789",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      addresses: {
        create: [
          {
            label: "Home",
            fullName: "Zubair Ahmed",
            phone: "+92 312 3456789",
            street: "House 42, Sector Y, Phase 3, DHA",
            city: "Lahore",
            state: "Punjab",
            postalCode: "54000",
            country: "Pakistan",
            isDefault: true,
          },
          {
            label: "Office",
            fullName: "Zubair Ahmed",
            phone: "+92 312 3456789",
            street: "Suite 502, Tricon Corporate Center, Gulberg II",
            city: "Lahore",
            state: "Punjab",
            postalCode: "54660",
            country: "Pakistan",
            isDefault: false,
          },
        ],
      },
    },
  });

  // 2. Seed Complete 18-Category Hierarchy (Categories -> Subcategories -> Product Types)
  console.log("📂 Seeding 18 Categories, Subcategories & Product Types...");
  const categoryMap = new Map<string, any>();
  const subcategoryMap = new Map<string, any>();
  const productTypeMap = new Map<string, any>();

  for (const catDef of COMPLETE_MARKETPLACE_HIERARCHY) {
    const category = await prisma.category.create({
      data: {
        name: catDef.name,
        slug: catDef.slug,
        description: catDef.description,
        icon: catDef.icon,
        image: catDef.image,
        sortOrder: catDef.sortOrder,
        isActive: true,
      },
    });
    categoryMap.set(catDef.slug, category);

    for (let sIdx = 0; sIdx < catDef.subcategories.length; sIdx++) {
      const subDef = catDef.subcategories[sIdx];
      const subcategory = await prisma.subcategory.create({
        data: {
          categoryId: category.id,
          name: subDef.name,
          slug: subDef.slug,
          description: subDef.description,
          icon: subDef.icon || category.icon,
          sortOrder: sIdx + 1,
          isActive: true,
        },
      });
      subcategoryMap.set(subDef.slug, subcategory);

      for (let pIdx = 0; pIdx < subDef.productTypes.length; pIdx++) {
        const ptDef = subDef.productTypes[pIdx];
        const productType = await prisma.productType.create({
          data: {
            subcategoryId: subcategory.id,
            name: ptDef.name,
            slug: ptDef.slug,
            description: ptDef.description,
            sortOrder: pIdx + 1,
            isActive: true,
          },
        });
        productTypeMap.set(`${subDef.slug}_${ptDef.slug}`, productType);
      }
    }
  }

  console.log(`✅ Seeded ${categoryMap.size} Categories and ${subcategoryMap.size} Subcategories!`);

  // 3. Brands
  await prisma.brand.createMany({
    data: [
      { name: "Samsung", slug: "samsung", description: "Global leader in consumer electronics" },
      { name: "Apple", slug: "apple", description: "Innovative personal tech & hardware" },
      { name: "Sony", slug: "sony", description: "Audio fidelity and entertainment" },
      { name: "Dell", slug: "dell", description: "Premium laptops and computing" },
      { name: "Nike", slug: "nike", description: "Just Do It — athletic footwear and apparel" },
      { name: "Philips", slug: "philips", description: "Meaningful smart home solutions" },
    ],
  });

  // 4. Coupons
  const now = new Date();
  await prisma.coupon.create({
    data: {
      code: "FAYZEE10",
      description: "10% off on all eligible orders over Rs. 2,000",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 2000,
      maxDiscountAmount: 3000,
      usageLimit: 500,
      perUserLimit: 2,
      startDate: now,
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "WELCOME500",
      description: "Flat Rs. 500 discount on your first order over Rs. 3,000",
      discountType: "FIXED",
      discountValue: 500,
      minOrderAmount: 3000,
      usageLimit: 1000,
      perUserLimit: 1,
      startDate: now,
      endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  console.log("✅ Fayzee Marketplace Database initialized cleanly without demo products or demo sellers!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
