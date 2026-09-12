import ProductsPage from "../products/page";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Search Products | Fayzee",
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: "https://www.fayzee.store/search",
    },
  };
}

export default ProductsPage;
