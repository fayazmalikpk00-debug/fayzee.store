import { ProductCard } from "@/components/marketplace/ProductCard";
import prisma from "@/lib/db";
import { getProducts } from "@/services/productService";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      children: {
        include: { _count: { select: { products: true } } },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const { products, total } = await getProducts({
    categorySlug: params.slug,
    limit: 24,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-900 text-white p-6 sm:p-10 rounded-3xl space-y-3">
        <span className="text-xs font-bold text-fayzee-cyan uppercase tracking-wider">
          Department
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold">{category.name}</h1>
        {category.description && (
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{category.description}</p>
        )}
        <p className="text-xs text-amber-400 font-semibold">{total} products available</p>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Products in {category.name}</h2>
        {products.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
            <p className="text-sm text-slate-500">No products listed in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                slug={product.slug}
                price={product.price}
                salePrice={product.salePrice}
                discountPercent={product.discountPercent}
                rating={product.rating}
                reviewCount={product.reviewCount}
                image={product.images[0]?.url}
                category={category.name}
                seller={product.seller}
                inStock={product.stockQuantity > 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
