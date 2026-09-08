import prisma from "../lib/db";
import { COMPLETE_MARKETPLACE_HIERARCHY, getAttributesForCategory } from "../lib/categoryHierarchy";
import { getCategories, getProducts, getProductBySlug } from "../services/productService";

async function runTests() {
  console.log("🚀 Starting Fayzee Category Marketplace Verification...\n");

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
    // Test 1: Category Count in Database
    console.log("TEST SUITE 1: Neon Database Hierarchy Integrity");
    const catCount = await prisma.category.count();
    assert(catCount >= 18, `Database has ${catCount} categories (expected at least 18)`);

    const subcatCount = await prisma.subcategory.count();
    assert(subcatCount >= 80, `Database has ${subcatCount} subcategories (expected at least 80)`);

    const ptCount = await prisma.productType.count();
    assert(ptCount >= 250, `Database has ${ptCount} product types (expected at least 250)`);

    // Test 2: Check all 18 Departments exist by slug
    console.log("\nTEST SUITE 2: Complete 18-Department Verification");
    const requiredSlugs = [
      "electronics",
      "mens-fashion",
      "womens-fashion",
      "kids-babies",
      "beauty-personal-care",
      "home-living",
      "home-appliances",
      "grocery-food",
      "sports-fitness",
      "automotive",
      "books-stationery",
      "tools-hardware",
      "pet-supplies",
      "travel-luggage",
      "office-business",
      "garden-outdoor",
      "fashion-accessories",
      "other",
    ];

    const existingCats = await prisma.category.findMany({
      where: { slug: { in: requiredSlugs } },
      include: {
        subcategories: {
          include: { productTypes: true },
        },
      },
    });

    assert(
      existingCats.length === requiredSlugs.length,
      `All ${requiredSlugs.length} required marketplace departments exist in database`
    );

    // Test 3: Subcategories and Product Types linking
    const electronics = existingCats.find((c) => c.slug === "electronics");
    assert(
      Boolean(electronics && electronics.subcategories.length >= 7),
      `Electronics department has ${electronics?.subcategories.length || 0} subcategories`
    );

    const smartphonesSubcat = electronics?.subcategories.find(
      (s) => s.slug === "smartphones-tablets"
    );
    assert(
      Boolean(smartphonesSubcat && smartphonesSubcat.productTypes.length >= 5),
      `Smartphones & Tablets subcategory has ${smartphonesSubcat?.productTypes.length || 0} product types`
    );

    // Test 4: Dynamic Category Attributes
    console.log("\nTEST SUITE 3: Dynamic Category Specifications & Attributes");
    const elecAttrs = getAttributesForCategory("electronics");
    assert(
      elecAttrs.length >= 4,
      `Electronics has ${elecAttrs.length} dynamic attributes defined (RAM, Storage, Brand, Warranty, etc.)`
    );

    const fashionAttrs = getAttributesForCategory("mens-fashion");
    assert(
      fashionAttrs.length >= 4,
      `Men's Fashion has ${fashionAttrs.length} dynamic attributes defined (Size, Color, Material, etc.)`
    );

    const groceryAttrs = getAttributesForCategory("groceries-pets");
    assert(
      groceryAttrs.length >= 3,
      `Groceries has ${groceryAttrs.length} dynamic attributes defined (Weight, Shelf Life, Diet, etc.)`
    );

    // Test 5: Product Service Integration
    console.log("\nTEST SUITE 4: Product Service Integration");
    const serviceCats = await getCategories();
    assert(
      serviceCats.length >= 18,
      `getCategories() returns ${serviceCats.length} categories with nested tree`
    );

    const { products: elecProducts } = await getProducts({
      categorySlug: "electronics",
      limit: 10,
    });
    assert(
      Array.isArray(elecProducts),
      `getProducts({ categorySlug: "electronics" }) successfully returns products array (count: ${elecProducts.length})`
    );

    const firstProduct = await prisma.product.findFirst({
      include: { subcategory: true, productType: true, variants: true },
    });
    if (firstProduct) {
      const productBySlug = await getProductBySlug(firstProduct.slug);
      assert(
        Boolean(productBySlug && productBySlug.subcategory && productBySlug.productType),
        `Product "${productBySlug?.title}" correctly resolved subcategory and productType`
      );
    } else {
      console.log("ℹ️ No catalog products currently in DB (catalog clean for real listings)");
    }

    console.log(`\n========================================`);
    console.log(`📊 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
