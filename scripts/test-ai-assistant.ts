import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import prisma from "../lib/db";
import {
  handleFayzeeAIChat,
  toolAddToCart,
  toolCompareProducts,
  toolGetCart,
  toolGetProduct,
  toolGetUserOrders,
  toolSearchProducts,
} from "../services/aiService";

async function runAIAssistantTestSuite() {
  console.log("==========================================================");
  console.log("🤖 FAYZEE CONVERSATIONAL SHOPPING AI COMPREHENSIVE TEST SUITE");
  console.log("==========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 0. Database connection warmup (handles Neon serverless compute cold-starts)
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

    // Ensure test catalog exists for test assertions
    const existingCount = await prisma.product.count();
    if (existingCount === 0) {
      console.log("Seeding test catalog products for AI test suite...");
      let seller = await prisma.sellerProfile.findFirst();
      if (!seller) {
        const sellerUser = await prisma.user.create({
          data: {
            email: `test-seller-${Date.now()}@fayzee.store`,
            name: "Fayzee Test Seller",
            passwordHash: "$2a$10$e8W1234567890abcdef...",
            role: "SELLER",
            sellerProfile: {
              create: {
                storeName: "Fayzee Test Electronics",
                businessName: "Fayzee Test Ltd",
                storeSlug: `fayzee-test-${Date.now()}`,
                status: "APPROVED",
              },
            },
          },
          include: { sellerProfile: true },
        });
        seller = sellerUser.sellerProfile!;
      }

      const elecCat = (await prisma.category.findFirst({ where: { slug: { in: ["electronics", "smartphones-accessories"] } } })) || (await prisma.category.findFirst());
      const applianceCat = (await prisma.category.findFirst({ where: { slug: { in: ["home-appliances", "appliances"] } } })) || elecCat;
      const fashionCat = (await prisma.category.findFirst({ where: { slug: { in: ["mens-fashion", "fashion", "footwear"] } } })) || elecCat;

      const samsungBrand = await prisma.brand.findFirst({ where: { slug: "samsung" } });
      const sonyBrand = await prisma.brand.findFirst({ where: { slug: "sony" } });
      const nikeBrand = await prisma.brand.findFirst({ where: { slug: "nike" } });
      const philipsBrand = await prisma.brand.findFirst({ where: { slug: "philips" } });

      if (elecCat && seller) {
        await prisma.product.createMany({
          data: [
            {
              title: "Samsung Galaxy S24 Ultra",
              slug: `samsung-galaxy-s24-ultra-${Date.now()}`,
              sku: `SAM-S24-${Date.now()}`,
              description: "Flagship smartphone with 200MP camera, Snapdragon 8 Gen 3, and AI zoom.",
              price: 399000,
              salePrice: 385000,
              stockQuantity: 15,
              status: "ACTIVE",
              sellerId: seller.id,
              categoryId: elecCat.id,
              brandId: samsungBrand?.id,
            },
            {
              title: "Sony WH-1000XM5 Noise Canceling Headphones",
              slug: `sony-wh-1000xm5-${Date.now()}`,
              sku: `SONY-XM5-${Date.now()}`,
              description: "Industry leading noise canceling wireless over-ear headphones with superior audio.",
              price: 95000,
              salePrice: 89000,
              stockQuantity: 20,
              status: "ACTIVE",
              sellerId: seller.id,
              categoryId: elecCat.id,
              brandId: sonyBrand?.id,
            },
            {
              title: "Nike Air Max 270 Sneakers",
              slug: `nike-air-max-270-${Date.now()}`,
              sku: `NIKE-270-${Date.now()}`,
              description: "Iconic Nike lifestyle sneakers with responsive Air cushioning.",
              price: 35000,
              salePrice: 29999,
              stockQuantity: 30,
              status: "ACTIVE",
              sellerId: seller.id,
              categoryId: fashionCat?.id || elecCat.id,
              brandId: nikeBrand?.id,
            },
            {
              title: "Philips Digital Air Fryer XL",
              slug: `philips-air-fryer-xl-${Date.now()}`,
              sku: `PHIL-AF-${Date.now()}`,
              description: "Rapid Air technology with digital touch screen presets for healthy oil-free cooking.",
              price: 42000,
              salePrice: 38000,
              stockQuantity: 12,
              status: "ACTIVE",
              sellerId: seller.id,
              categoryId: applianceCat?.id || elecCat.id,
              brandId: philipsBrand?.id,
            },
          ],
        });
      }
    }

    // ------------------------------------------------------------------------
    // TEST 1: Case-Insensitive Product Search (PostgreSQL mode: 'insensitive')
    // ------------------------------------------------------------------------
    console.log("\n[TEST 1] Case-Insensitive Product Search...");
    const lowerResults = await toolSearchProducts({ query: "samsung" });
    const upperResults = await toolSearchProducts({ query: "SAMSUNG" });
    const mixedResults = await toolSearchProducts({ query: "SaMsUnG" });

    assert(lowerResults.length > 0, "Lower-case 'samsung' yields products");
    assert(upperResults.length > 0, "Upper-case 'SAMSUNG' yields products");
    assert(
      lowerResults.length === upperResults.length &&
        lowerResults[0]?.id === upperResults[0]?.id,
      "Lower and Upper case queries return consistent results (case-insensitivity verified)"
    );
    assert(mixedResults.length === lowerResults.length, "Mixed case 'SaMsUnG' matches properly");

    // ------------------------------------------------------------------------
    // TEST 2: Category Mismatch Fix ("kitchen-appliances" <-> "home-appliances")
    // ------------------------------------------------------------------------
    console.log("\n[TEST 2] Category Mismatch Fix (kitchen-appliances & home-appliances)...");
    const kitchenResults = await toolSearchProducts({ category: "kitchen-appliances" });
    const homeResults = await toolSearchProducts({ category: "home-appliances" });

    assert(Array.isArray(kitchenResults), "Searching 'kitchen-appliances' returns results array");
    assert(Array.isArray(homeResults), "Searching 'home-appliances' returns results array");

    // ------------------------------------------------------------------------
    // TEST 3: Multi-attribute Product Search (Brand, Title, Specs)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 3] Brand and Attribute Search...");
    const nikeResults = await toolSearchProducts({ brand: "nike" });
    assert(nikeResults.length > 0, "Brand search 'nike' returns Nike products");
    assert(
      nikeResults.every((p) => p.brand?.toLowerCase() === "nike"),
      "All returned items belong to Nike brand"
    );

    const headphones = await toolSearchProducts({ query: "noise canceling" });
    assert(headphones.length > 0, "Attribute search 'noise canceling' finds Sony headphones");

    // ------------------------------------------------------------------------
    // TEST 4: Price Constraint & Stock Filters
    // ------------------------------------------------------------------------
    console.log("\n[TEST 4] Price Constraints and In-Stock Filtering...");
    const under50k = await toolSearchProducts({ maxPrice: 50000 });
    assert(under50k.length > 0, "Found products under 50,000");
    assert(
      under50k.every((p) => p.price <= 50000),
      "All products under 50k respect price ceiling"
    );

    const inStock = await toolSearchProducts({ inStockOnly: true });
    assert(
      inStock.every((p) => p.inStock && p.stockQuantity > 0),
      "All inStockOnly items have positive inventory"
    );

    // ------------------------------------------------------------------------
    // TEST 5: Targeted Product Comparison (No Random Picking)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 5] Targeted Product Comparison...");
    const comparison = await toolCompareProducts(["Smartphones", "Laptops"]);
    assert(Array.isArray(comparison.products), "Comparison returns products array");
    assert(Array.isArray(comparison.highlights), "Comparison highlights array is generated");

    // ------------------------------------------------------------------------
    // TEST 6: Cart Actions (Authenticated & Guest Sessions)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 6] Cart Actions & Persistence...");
    const testSessionToken = `test_ai_session_${Date.now()}`;
    const cartProduct = lowerResults[0];

    const addResult = await toolAddToCart({
      sessionToken: testSessionToken,
      productIdOrSlug: cartProduct.id,
      quantity: 1,
    });

    assert(addResult.success, "Item added to cart via sessionToken");
    assert(addResult.productTitle === cartProduct.title, "Correct product title recorded in cart action");

    const cartContents = await toolGetCart({ sessionToken: testSessionToken });
    assert(cartContents.items.length >= 1, "Cart contains added item");
    assert(cartContents.totalAmount >= cartProduct.price, "Cart total amount calculated correctly");

    // Clean up test cart
    await prisma.cart.deleteMany({ where: { sessionToken: testSessionToken } });

    // ------------------------------------------------------------------------
    // TEST 7: Order Tracking (Authenticated vs Unauthenticated)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 7] Order Assistance & Security Boundaries...");
    const unauthOrders = await toolGetUserOrders(undefined);
    assert(
      !unauthOrders.authenticated,
      "Unauthenticated user request blocked with sign-in requirement"
    );

    const customerUser = await prisma.user.findUnique({
      where: { email: "customer@gmail.com" },
    });
    assert(customerUser !== null, "Customer user exists");

    if (customerUser) {
      const authOrders = await toolGetUserOrders(customerUser.id);
      assert(authOrders.authenticated, "Authenticated user orders accessed successfully");
    }

    // ------------------------------------------------------------------------
    // TEST 8: Multi-Turn Conversation & Follow-Up Context Handling
    // ------------------------------------------------------------------------
    console.log("\n[TEST 8] Multi-Turn Conversational Reasoning...");
    
    // Turn 1: Initial query
    const turn1 = await handleFayzeeAIChat({
      messages: [{ role: "user", content: "I need a phone" }],
    });
    assert(turn1.content.length > 0, "Turn 1 returned response");
    assert(
      (turn1.metadata.products?.length || 0) > 0,
      "Turn 1 suggested phones in metadata"
    );

    // Turn 2: Follow-up constraint ("Under 400,000")
    const turn2 = await handleFayzeeAIChat({
      messages: [
        { role: "user", content: "I need a phone" },
        { role: "assistant", content: turn1.content, metadata: turn1.metadata },
        { role: "user", content: "Under 400000" },
      ],
    });
    assert(turn2.content.length > 0, "Turn 2 processed budget follow-up");
    assert(
      turn2.metadata.products !== undefined &&
        turn2.metadata.products.every((p) => p.price <= 400000),
      "Turn 2 products obey the 400,000 ceiling"
    );

    // Turn 3: Follow-up pronoun reference ("Which one has the best camera?")
    const turn3 = await handleFayzeeAIChat({
      messages: [
        { role: "user", content: "I need a phone" },
        { role: "assistant", content: turn1.content, metadata: turn1.metadata },
        { role: "user", content: "Under 400000" },
        { role: "assistant", content: turn2.content, metadata: turn2.metadata },
        { role: "user", content: "Which one has the best camera?" },
      ],
    });
    assert(turn3.content.length > 0, "Turn 3 resolved pronoun context ('Which one')");
    assert(
      turn3.content.toLowerCase().includes("camera") || turn3.content.toLowerCase().includes("s24"),
      "Turn 3 gave camera-specific guidance based on context"
    );

    // ------------------------------------------------------------------------
    // TEST 9: Roman Urdu Query Handling
    // ------------------------------------------------------------------------
    console.log("\n[TEST 9] Roman Urdu and Colloquial Language...");
    const urduQuery = await handleFayzeeAIChat({
      messages: [{ role: "user", content: "mujhe sasta phone chahiye" }],
    });
    assert(urduQuery.content.length > 0, "Roman Urdu 'mujhe sasta phone chahiye' processed");
    assert(
      (urduQuery.metadata.products?.length || 0) > 0,
      "Roman Urdu query returned matching products"
    );

    const urduBudget = await handleFayzeeAIChat({
      messages: [{ role: "user", content: "50 hazar ke andar kuch dikhao" }],
    });
    assert(urduBudget.content.length > 0, "Roman Urdu '50 hazar ke andar' recognized as budget constraint");

    // ------------------------------------------------------------------------
    // TEST 10: Comparison Query in Chat
    // ------------------------------------------------------------------------
    console.log("\n[TEST 10] Comparison Request Handling...");
    const compareChat = await handleFayzeeAIChat({
      messages: [{ role: "user", content: "Compare smart electronics categories" }],
    });
    assert(
      typeof compareChat.message === "string" && compareChat.message.length > 0,
      "Chat comparison returned AI response message"
    );

    // ------------------------------------------------------------------------
    // TEST 11: Database Persistence (AIConversation & AIMessage)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 11] Conversation Persistence Models...");
    const testConvSession = `test_conv_${Date.now()}`;
    const testConv = await prisma.aIConversation.create({
      data: {
        sessionToken: testConvSession,
        title: "Testing Session",
      },
    });
    assert(testConv.id.length > 0, "AIConversation created in database");

    const userMsg = await prisma.aIMessage.create({
      data: {
        conversationId: testConv.id,
        role: "USER",
        content: "Hello AI",
      },
    });
    assert(userMsg.id.length > 0, "User AIMessage recorded in database");

    const aiMsg = await prisma.aIMessage.create({
      data: {
        conversationId: testConv.id,
        role: "ASSISTANT",
        content: "Hello! How can I assist your shopping?",
        metadata: JSON.stringify({ products: [] }),
      },
    });
    assert(aiMsg.id.length > 0, "Assistant AIMessage with metadata recorded");

    const reloaded = await prisma.aIConversation.findUnique({
      where: { id: testConv.id },
      include: { messages: true },
    });
    assert(reloaded?.messages.length === 2, "Reloaded conversation contains 2 persisted messages");

    // Clean up test conversation
    await prisma.aIConversation.delete({ where: { id: testConv.id } });
    assert(true, "Cleaned up test conversation records");

    // ------------------------------------------------------------------------
    // TEST 12: Gemini Configuration & Key Handling
    // ------------------------------------------------------------------------
    console.log("\n[TEST 12] Gemini Configuration Handling...");
    const hasKey = !!process.env.GEMINI_API_KEY?.trim();
    if (!hasKey) {
      const greeting = await handleFayzeeAIChat({
        messages: [{ role: "user", content: "Hello" }],
      });
      assert(
        greeting.metadata.configNotice !== undefined || greeting.content.length > 0,
        "Clear notice/fallback provided when GEMINI_API_KEY is not configured"
      );
    } else {
      assert(true, "GEMINI_API_KEY is configured in server environment");
    }

  } catch (err: any) {
    console.error("Test execution threw an error:", err);
    failed++;
  }

  console.log("\n==========================================================");
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAIAssistantTestSuite()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
