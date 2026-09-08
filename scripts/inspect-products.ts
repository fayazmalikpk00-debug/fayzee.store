import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      seller: true,
      category: true,
      images: true,
      variants: true,
      reviews: true,
      flashSaleItems: true,
      orderItems: true,
      cartItems: true,
      wishlistItems: true,
    },
  });

  console.log(`TOTAL_PRODUCTS_IN_DB: ${products.length}`);
  for (const p of products) {
    console.log(JSON.stringify({
      id: p.id,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      price: p.price,
      seller: p.seller?.storeName || p.sellerId,
      category: p.category?.name || p.categoryId,
      createdAt: p.createdAt,
      imagesCount: p.images.length,
      variantsCount: p.variants.length,
      reviewsCount: p.reviews.length,
      flashSaleCount: p.flashSaleItems.length,
      orderItemsCount: p.orderItems.length,
      cartItemsCount: p.cartItems.length,
    }, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
