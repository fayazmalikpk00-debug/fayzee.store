import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductDetailView } from "@/components/marketplace/ProductDetailView";
import prisma from "@/lib/db";
import { getProductBySlug } from "@/services/productService";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "ACTIVE") {
    return { title: "Product Not Found — Fayzee", robots: { index: false, follow: false } };
  }

  // Clean raw product text: strip HTML and normalize whitespace
  const rawText = (product.shortDescription || product.description || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let description: string;

  if (rawText.length >= 110) {
    if (rawText.length <= 160) {
      description = rawText;
    } else {
      const sub = rawText.slice(0, 160);
      const sentenceEndMatches = Array.from(sub.matchAll(/[.!?](?=\s|$)/g));
      if (sentenceEndMatches.length > 0) {
        const lastMatch = sentenceEndMatches[sentenceEndMatches.length - 1];
        const endPos = (lastMatch.index ?? 0) + 1;
        if (endPos >= 110) {
          description = sub.slice(0, endPos).trim();
        } else {
          const lastSpace = sub.lastIndexOf(" ");
          description = (lastSpace > 110 ? sub.slice(0, lastSpace) : sub).replace(/[.,;:\s]+$/, "") + ".";
        }
      } else {
        const lastSpace = sub.lastIndexOf(" ");
        description = (lastSpace > 110 ? sub.slice(0, lastSpace) : sub).replace(/[.,;:\s]+$/, "") + ".";
      }
    }
  } else {
    // If description is thin, augment with real verified fields (title, category, seller)
    const catPart = product.category?.name ? `in ${product.category.name} ` : "";
    const sellerPart = product.seller?.storeName ? `from ${product.seller.storeName} ` : "";
    const textPart = rawText && rawText.length >= 20 ? `${rawText.replace(/\.+$/, "")}. ` : "";

    const combined = `Buy ${product.title} ${catPart}online on Fayzee Store. ${textPart}Explore available marketplace options, product details, and listings ${sellerPart}in Pakistan.`.replace(/\s+/g, " ").trim();

    if (combined.length <= 160) {
      description = combined;
    } else {
      const sub = combined.slice(0, 160);
      const sentenceEndMatches = Array.from(sub.matchAll(/[.!?](?=\s|$)/g));
      if (sentenceEndMatches.length > 0) {
        const lastMatch = sentenceEndMatches[sentenceEndMatches.length - 1];
        const endPos = (lastMatch.index ?? 0) + 1;
        if (endPos >= 110) {
          description = sub.slice(0, endPos).trim();
        } else {
          const lastSpace = sub.lastIndexOf(" ");
          description = (lastSpace > 110 ? sub.slice(0, lastSpace) : sub).replace(/[.,;:\s]+$/, "") + ".";
        }
      } else {
        const lastSpace = sub.lastIndexOf(" ");
        description = (lastSpace > 110 ? sub.slice(0, lastSpace) : sub).replace(/[.,;:\s]+$/, "") + ".";
      }
    }
  }

  const pageTitle = `${product.title} — Buy Online on Fayzee`;
  const canonicalUrl = `https://www.fayzee.store/products/${slug}`;
  const ogImageUrl = product.images[0]?.url || "https://www.fayzee.store/logo.png";
  const ogImageAlt = product.images[0]?.alt || product.title;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "FAYZEE",
      locale: "en_PK",
      images: [
        {
          url: ogImageUrl,
          alt: ogImageAlt,
        },
      ],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ProductDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "ACTIVE") {
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
