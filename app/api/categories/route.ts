import { getCategories } from "@/services/productService";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}
