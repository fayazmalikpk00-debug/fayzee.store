import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Fayzee Marketplace Database...");

  // Clean existing data
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
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.sellerApplication.deleteMany();
  await prisma.address.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const adminPassword = await bcrypt.hash("Apple##21", 10);
  const sellerPassword = await bcrypt.hash("Seller@123", 10);
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

  const seller1User = await prisma.user.create({
    data: {
      email: "seller@techhub.com",
      name: "Malik Farhan",
      passwordHash: sellerPassword,
      role: "SELLER",
      phone: "+92 321 9876543",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  });

  const seller2User = await prisma.user.create({
    data: {
      email: "seller@urbanstyle.com",
      name: "Ayesha Khan",
      passwordHash: sellerPassword,
      role: "SELLER",
      phone: "+92 333 4567890",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
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

  // 2. Create Seller Profiles
  const techHubSeller = await prisma.sellerProfile.create({
    data: {
      userId: seller1User.id,
      businessName: "TechHub Electronics Pvt Ltd",
      storeName: "TechHub Official",
      storeSlug: "techhub-official",
      description: "Premier authorized seller for flagship smartphones, premium audio, and ultrabooks.",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
      bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200",
      taxNumber: "NTN-7892341-2",
      cnic: "35201-1234567-1",
      address: "Hafeez Center, Main Boulevard, Gulberg III, Lahore",
      phone: "+92 321 9876543",
      rating: 4.9,
      reviewCount: 234,
      status: "APPROVED",
    },
  });

  const urbanStyleSeller = await prisma.sellerProfile.create({
    data: {
      userId: seller2User.id,
      businessName: "UrbanStyle Apparel Ltd",
      storeName: "UrbanStyle Store",
      storeSlug: "urbanstyle-store",
      description: "Curated contemporary streetwear, authentic activewear, and everyday essentials.",
      logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
      bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
      taxNumber: "NTN-6543219-8",
      cnic: "35202-9876543-2",
      address: "Mall of Lahore, Cantt, Lahore",
      phone: "+92 333 4567890",
      rating: 4.8,
      reviewCount: 165,
      status: "APPROVED",
    },
  });

  // 3. Hierarchical Categories
  const catElectronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
      description: "Smartphones, laptops, smart accessories, and next-gen audio",
      icon: "Smartphone",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600",
      sortOrder: 1,
    },
  });

  const catMobiles = await prisma.category.create({
    data: {
      name: "Smartphones & Tablets",
      slug: "smartphones-tablets",
      parentId: catElectronics.id,
      sortOrder: 1,
    },
  });

  const catLaptops = await prisma.category.create({
    data: {
      name: "Laptops & Computers",
      slug: "laptops-computers",
      parentId: catElectronics.id,
      sortOrder: 2,
    },
  });

  const catAudio = await prisma.category.create({
    data: {
      name: "Audio & Headphones",
      slug: "audio-headphones",
      parentId: catElectronics.id,
      sortOrder: 3,
    },
  });

  const catFashion = await prisma.category.create({
    data: {
      name: "Fashion & Apparel",
      slug: "fashion-apparel",
      description: "Men's, Women's, and kids' footwear and wardrobe",
      icon: "Shirt",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600",
      sortOrder: 2,
    },
  });

  const catFootwear = await prisma.category.create({
    data: {
      name: "Men's Footwear & Sneakers",
      slug: "mens-footwear",
      parentId: catFashion.id,
      sortOrder: 1,
    },
  });

  const catMenFashion = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: "mens-clothing",
      parentId: catFashion.id,
      sortOrder: 2,
    },
  });

  const catHome = await prisma.category.create({
    data: {
      name: "Home & Appliances",
      slug: "home-appliances",
      description: "Smart kitchen appliances, interior lighting, and home decor",
      icon: "Home",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600",
      sortOrder: 3,
    },
  });

  const catKitchen = await prisma.category.create({
    data: {
      name: "Kitchen Appliances",
      slug: "kitchen-appliances",
      parentId: catHome.id,
      sortOrder: 1,
    },
  });

  // 4. Brands
  const brandSamsung = await prisma.brand.create({
    data: { name: "Samsung", slug: "samsung", description: "Global leader in consumer electronics" },
  });
  const brandApple = await prisma.brand.create({
    data: { name: "Apple", slug: "apple", description: "Innovative personal tech & hardware" },
  });
  const brandSony = await prisma.brand.create({
    data: { name: "Sony", slug: "sony", description: "Audio fidelity and entertainment" },
  });
  const brandDell = await prisma.brand.create({
    data: { name: "Dell", slug: "dell", description: "Premium laptops and computing" },
  });
  const brandNike = await prisma.brand.create({
    data: { name: "Nike", slug: "nike", description: "Just Do It — athletic footwear and apparel" },
  });
  const brandPhilips = await prisma.brand.create({
    data: { name: "Philips", slug: "philips", description: "Meaningful smart home solutions" },
  });

  // 5. Products
  // Product 1: Samsung Galaxy S24 Ultra
  const pGalaxyS24 = await prisma.product.create({
    data: {
      sellerId: techHubSeller.id,
      categoryId: catMobiles.id,
      brandId: brandSamsung.id,
      title: "Samsung Galaxy S24 Ultra 5G (12GB RAM, 256GB Storage)",
      slug: "samsung-galaxy-s24-ultra-5g-256gb",
      sku: "SAM-S24U-256-BLK",
      shortDescription: "Flagship Galaxy AI smartphone with 200MP camera, Snapdragon 8 Gen 3, and integrated S-Pen.",
      description: `Experience the pinnacle of mobile innovation with the Samsung Galaxy S24 Ultra. Powered by Galaxy AI, circle to search, live translation, and pro-visual engine. Features a 6.8-inch Dynamic AMOLED 2X flat display with 2600 nits peak brightness and titanium frame. Ideal for power users, creators, and high-FPS gaming.`,
      price: 399999,
      salePrice: 369999,
      discountPercent: 8,
      stockQuantity: 18,
      status: "ACTIVE",
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 84,
      weight: 0.233,
      dimensions: "162.3 x 79 x 8.6 mm",
      shippingFee: 0,
      warrantyInfo: "1 Year Official PTA Approved Brand Warranty",
      specifications: JSON.stringify({
        Display: "6.8 inch Dynamic AMOLED 2X, 120Hz, 2600 nits",
        Processor: "Qualcomm Snapdragon 8 Gen 3 (4nm)",
        RAM: "12GB LPDDR5X",
        Storage: "256GB UFS 4.0",
        RearCamera: "200MP Main + 50MP Periscope + 10MP Telephoto + 12MP Ultrawide",
        Battery: "5000mAh with 45W Fast Charging",
        Stylus: "Integrated S-Pen Included",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
            alt: "Samsung Galaxy S24 Ultra Front & Back",
            isThumbnail: true,
            sortOrder: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800",
            alt: "Samsung Galaxy Display View",
            isThumbnail: false,
            sortOrder: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Titanium Black (12GB/256GB)",
            sku: "SAM-S24U-BLK-256",
            price: 399999,
            salePrice: 369999,
            stockQuantity: 10,
            attributes: JSON.stringify({ Color: "Titanium Black", Storage: "256GB" }),
          },
          {
            name: "Titanium Gray (12GB/512GB)",
            sku: "SAM-S24U-GRY-512",
            price: 439999,
            salePrice: 409999,
            stockQuantity: 8,
            attributes: JSON.stringify({ Color: "Titanium Gray", Storage: "512GB" }),
          },
        ],
      },
    },
  });

  // Product 2: Apple iPhone 15 Pro Max
  const pIphone15 = await prisma.product.create({
    data: {
      sellerId: techHubSeller.id,
      categoryId: catMobiles.id,
      brandId: brandApple.id,
      title: "Apple iPhone 15 Pro Max (256GB, Natural Titanium)",
      slug: "apple-iphone-15-pro-max-256gb-natural-titanium",
      sku: "APL-IP15PM-256-NAT",
      shortDescription: "Forged in aerospace-grade titanium with A17 Pro chip and customizable Action button.",
      description: `iPhone 15 Pro Max is the first iPhone with an aerospace-grade titanium design, using the same alloy that spacecraft use for missions to Mars. The A17 Pro chip brings console gaming to iPhone with hardware-accelerated ray tracing. 5x Optical zoom with the 120mm lens provides the longest optical zoom of any iPhone ever.`,
      price: 489999,
      salePrice: 459999,
      discountPercent: 6,
      stockQuantity: 12,
      status: "ACTIVE",
      isFeatured: true,
      isTrending: true,
      rating: 5.0,
      reviewCount: 65,
      weight: 0.221,
      dimensions: "159.9 x 76.7 x 8.25 mm",
      shippingFee: 0,
      warrantyInfo: "1 Year Official Apple Warranty, PTA Approved",
      specifications: JSON.stringify({
        Display: "6.7 inch Super Retina XDR with ProMotion 120Hz",
        Processor: "Apple A17 Pro Bionic (3nm)",
        RAM: "8GB",
        Storage: "256GB NVMe",
        Camera: "48MP Main + 12MP 5x Telephoto + 12MP Ultra Wide",
        Connector: "USB-C with USB 3 Speeds (up to 10Gb/s)",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
            alt: "iPhone 15 Pro Max Natural Titanium",
            isThumbnail: true,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Natural Titanium (256GB)",
            sku: "APL-15PM-NAT-256",
            price: 489999,
            salePrice: 459999,
            stockQuantity: 7,
            attributes: JSON.stringify({ Color: "Natural Titanium", Storage: "256GB" }),
          },
          {
            name: "Blue Titanium (512GB)",
            sku: "APL-15PM-BLU-512",
            price: 549999,
            salePrice: 519999,
            stockQuantity: 5,
            attributes: JSON.stringify({ Color: "Blue Titanium", Storage: "512GB" }),
          },
        ],
      },
    },
  });

  // Product 3: Sony WH-1000XM5
  const pSonyXM5 = await prisma.product.create({
    data: {
      sellerId: techHubSeller.id,
      categoryId: catAudio.id,
      brandId: brandSony.id,
      title: "Sony WH-1000XM5 Wireless Industry-Leading Noise Canceling Headphones",
      slug: "sony-wh-1000xm5-wireless-noise-canceling-headphones",
      sku: "SNY-WH1000XM5-BLK",
      shortDescription: "Unprecedented noise cancellation powered by two processors and eight microphones with 30-hr battery.",
      description: `The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. With two processors controlling eight microphones, Auto NC Optimizer for automatically optimizing noise canceling based on your wearing conditions and environment, and a specially designed driver unit.`,
      price: 89999,
      salePrice: 74999,
      discountPercent: 17,
      stockQuantity: 25,
      status: "ACTIVE",
      isFeatured: true,
      isTrending: true,
      rating: 4.8,
      reviewCount: 43,
      shippingFee: 0,
      specifications: JSON.stringify({
        BatteryLife: "Up to 30 hours with ANC on",
        Connectivity: "Bluetooth 5.2, LDAC, Multipoint connection",
        Microphones: "8 microphones with AI beamforming",
        Charging: "3 min quick charge provides 3 hours playback",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            alt: "Sony WH-1000XM5 Premium Headphones",
            isThumbnail: true,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // Product 4: Dell XPS 13
  const pDellXPS = await prisma.product.create({
    data: {
      sellerId: techHubSeller.id,
      categoryId: catLaptops.id,
      brandId: brandDell.id,
      title: "Dell XPS 13 (Intel Core Ultra 7, 16GB RAM, 512GB SSD, FHD+)",
      slug: "dell-xps-13-intel-core-ultra-7-16gb-512gb",
      sku: "DEL-XPS13-U7-512",
      shortDescription: "Ultra-thin, featherlight CNC machined aluminum laptop with Intel Core Ultra AI processor.",
      description: `Crafted with CNC machined aluminum and Gorilla Glass 3, the Dell XPS 13 is minimalist perfection. The InfinityEdge display brings your projects to life with vibrant clarity, while Intel Core Ultra processors provide on-device AI acceleration for productivity and battery longevity.`,
      price: 365000,
      salePrice: 339000,
      discountPercent: 7,
      stockQuantity: 10,
      status: "ACTIVE",
      isFeatured: true,
      rating: 4.7,
      reviewCount: 29,
      specifications: JSON.stringify({
        CPU: "Intel Core Ultra 7 155H (16 cores)",
        Display: "13.4 inch FHD+ (1920 x 1200) 120Hz 500 nits",
        RAM: "16GB LPDDR5x 7467 MT/s",
        Storage: "512GB PCIe 4.0 NVMe SSD",
        Weight: "1.19 kg",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
            alt: "Dell XPS 13 Ultrabook",
            isThumbnail: true,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // Product 5: Nike Air Max 270
  const pNikeSneakers = await prisma.product.create({
    data: {
      sellerId: urbanStyleSeller.id,
      categoryId: catFootwear.id,
      brandId: brandNike.id,
      title: "Nike Air Max 270 Breathable Cushion Running Sneakers",
      slug: "nike-air-max-270-breathable-cushion-running-sneakers",
      sku: "NKE-AM270-BLK",
      shortDescription: "Nike's biggest heel Air unit yet delivers super-soft ride that feels as impossible as it looks.",
      description: `Boasting Nike's biggest heel Air unit yet, the Nike Air Max 270 delivers visible cushioning under every step. Inspired by iconic Air Max icons from 1991 and 1993, modernizing comfort with breathable engineered mesh and a snug bootie construction.`,
      price: 28500,
      salePrice: 22999,
      discountPercent: 19,
      stockQuantity: 45,
      status: "ACTIVE",
      isFeatured: true,
      isTrending: true,
      rating: 4.8,
      reviewCount: 112,
      shippingFee: 250,
      specifications: JSON.stringify({
        Upper: "Engineered mesh and synthetic upper",
        Sole: "Rubber outsole with dual-density foam",
        Cushioning: "270-degree Max Air heel unit",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
            alt: "Nike Air Max 270 Red and Black",
            isThumbnail: true,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Size 41 EU / Black Red",
            sku: "NKE-270-41",
            price: 28500,
            salePrice: 22999,
            stockQuantity: 15,
            attributes: JSON.stringify({ Size: "41 EU", Color: "Black/Red" }),
          },
          {
            name: "Size 42 EU / Black Red",
            sku: "NKE-270-42",
            price: 28500,
            salePrice: 22999,
            stockQuantity: 18,
            attributes: JSON.stringify({ Size: "42 EU", Color: "Black/Red" }),
          },
          {
            name: "Size 43 EU / Black Red",
            sku: "NKE-270-43",
            price: 28500,
            salePrice: 22999,
            stockQuantity: 12,
            attributes: JSON.stringify({ Size: "43 EU", Color: "Black/Red" }),
          },
        ],
      },
    },
  });

  // Product 6: Philips Airfryer XXL
  const pAirfryer = await prisma.product.create({
    data: {
      sellerId: urbanStyleSeller.id,
      categoryId: catKitchen.id,
      brandId: brandPhilips.id,
      title: "Philips Premium Airfryer XXL Smart Sensing (7.3L, 2225W)",
      slug: "philips-premium-airfryer-xxl-smart-sensing-7-3l",
      sku: "PHL-AF-XXL-73L",
      shortDescription: "Fat Removal technology with smart chef programs for effortless, guilt-free family meals.",
      description: `The Philips Airfryer XXL uses hot air to fry your favorite foods with little or no added oil. Twin TurboStar technology removes fat from food, while Smart Sensing technology automatically adjusts time and temperature during cooking for perfectly done dishes.`,
      price: 68000,
      salePrice: 54999,
      discountPercent: 19,
      stockQuantity: 14,
      status: "ACTIVE",
      isFeatured: false,
      isTrending: true,
      rating: 4.9,
      reviewCount: 52,
      shippingFee: 0,
      specifications: JSON.stringify({
        Capacity: "7.3 Liters / 1.4 kg of fries",
        Power: "2225 Watts",
        Technology: "Twin TurboStar & Smart Sensing",
        KeepWarm: "Up to 30 minutes",
      }),
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800",
            alt: "Philips Airfryer XXL",
            isThumbnail: true,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // 6. Flash Sale Setup
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const flashSale = await prisma.flashSale.create({
    data: {
      title: "⚡ Fayzee Super Flash Deal — Up to 35% Off",
      description: "Limited-time flash sale on trending tech and authentic apparel. Grab yours before stocks run dry!",
      bannerImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400",
      startTime: now,
      endTime: tomorrow,
      isActive: true,
      items: {
        create: [
          {
            productId: pSonyXM5.id,
            discountPrice: 69999,
            stockLimit: 15,
            soldCount: 8,
          },
          {
            productId: pNikeSneakers.id,
            discountPrice: 19999,
            stockLimit: 25,
            soldCount: 14,
          },
          {
            productId: pAirfryer.id,
            discountPrice: 49999,
            stockLimit: 8,
            soldCount: 4,
          },
        ],
      },
    },
  });

  // 7. Coupons
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

  // 8. Product Reviews
  await prisma.review.create({
    data: {
      productId: pGalaxyS24.id,
      userId: customer.id,
      rating: 5,
      title: "Phenomenal display and camera performance!",
      comment: "Delivered within 2 days in Lahore. S-pen integration is extremely responsive and the titanium build feels ultra-premium. Verified authentic PTA approved product.",
      isVerifiedPurchase: true,
      isApproved: true,
      sellerResponse: "Thank you for shopping with TechHub Official! Enjoy your Galaxy AI experience.",
    },
  });

  await prisma.review.create({
    data: {
      productId: pNikeSneakers.id,
      userId: customer.id,
      rating: 5,
      title: "100% Original and insanely comfortable",
      comment: "Was hesitant at first buying shoes online, but UrbanStyle delivered authentic Nike sneakers with original packaging. The Air Max heel cushion makes walking all day effortless.",
      isVerifiedPurchase: true,
      isApproved: true,
    },
  });

  console.log("✅ Fayzee Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
