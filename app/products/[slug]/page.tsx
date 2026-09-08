import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductDetailView } from "@/components/marketplace/ProductDetailView";
import prisma from "@/lib/db";
import { getProductBySlug } from "@/services/productService";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product Not Found — Fayzee" };

  return {
    title: `${product.title} — Buy Online on Fayzee`,
    description: product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.shortDescription || product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIVE",
    },
    take: 4,
    include: {
      images: {
        orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
      category: true,
      seller: { select: { storeName: true, storeSlug: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Interactive Detail View */}
      <ProductDetailView product={product} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Customers Also Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                id={rel.id}
                title={rel.title}
                slug={rel.slug}
                price={rel.price}
                salePrice={rel.salePrice}
                discountPercent={rel.discountPercent}
                rating={rel.rating}
                reviewCount={rel.reviewCount}
                image={rel.images[0]?.url}
                category={rel.category.name}
                seller={rel.seller}
                inStock={rel.stockQuantity > 0}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
