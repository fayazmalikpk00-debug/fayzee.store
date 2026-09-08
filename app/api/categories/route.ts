import { getCategories } from "@/services/productService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}
