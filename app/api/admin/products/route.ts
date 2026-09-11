import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied. Administrator only." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("q") || "";

    const where: any = {};
    if (searchQuery.trim()) {
      where.OR = [
        { title: { contains: searchQuery.trim(), mode: "insensitive" } },
        { sku: { contains: searchQuery.trim(), mode: "insensitive" } },
        { seller: { storeName: { contains: searchQuery.trim(), mode: "insensitive" } } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        seller: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
          },
        },
      },
      orderBy: [
        { isTrending: "desc" },
        { isFeatured: "desc" },
        { updatedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: 200,
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied. Administrator only." }, { status: 403 });
    }

    const body = await req.json();
    const { productId, isTrending, isFeatured, status } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const dataToUpdate: any = {};

    if (typeof isTrending === "boolean") {
      dataToUpdate.isTrending = isTrending;
    }

    if (typeof isFeatured === "boolean") {
      dataToUpdate.isFeatured = isFeatured;
    }

    if (status) {
      dataToUpdate.status = status;
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
      include: {
        seller: { select: { storeName: true, storeSlug: true } },
      },
    });

    // Record Audit Log for platform governance
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: `PRODUCT_PROMOTION_UPDATE`,
        targetType: "PRODUCT",
        targetId: productId,
        details: JSON.stringify({
          title: updated.title,
          isTrending: updated.isTrending,
          isFeatured: updated.isFeatured,
          sellerStore: updated.seller?.storeName,
        }),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Admin products update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}
