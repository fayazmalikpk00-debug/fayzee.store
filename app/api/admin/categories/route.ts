import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { slugify } from "@/lib/categoryHierarchy";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Admin Category Management API
 * Manage 3-tier hierarchy: Category -> Subcategory -> ProductType
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: {
          orderBy: { sortOrder: "asc" },
          include: {
            productTypes: {
              orderBy: { sortOrder: "asc" },
              include: {
                _count: { select: { products: true } },
              },
            },
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load categories." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const body = await req.json();
    const { target, name, description, image, icon, sortOrder, categoryId, subcategoryId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const trimmedName = name.trim();
    const baseSlug = body.slug ? slugify(body.slug) : slugify(trimmedName);

    if (target === "category") {
      // Ensure unique slug
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      const category = await prisma.category.create({
        data: {
          name: trimmedName,
          slug: uniqueSlug,
          description: description?.trim() || null,
          image: image?.trim() || null,
          icon: icon?.trim() || "Package",
          sortOrder: Number(sortOrder) || 0,
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, item: category });
    }

    if (target === "subcategory") {
      if (!categoryId) {
        return NextResponse.json({ error: "Parent category is required." }, { status: 400 });
      }

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (
        await prisma.subcategory.findFirst({
          where: { categoryId, slug: uniqueSlug },
        })
      ) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      const subcategory = await prisma.subcategory.create({
        data: {
          categoryId,
          name: trimmedName,
          slug: uniqueSlug,
          description: description?.trim() || null,
          image: image?.trim() || null,
          icon: icon?.trim() || null,
          sortOrder: Number(sortOrder) || 0,
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, item: subcategory });
    }

    if (target === "productType") {
      if (!subcategoryId) {
        return NextResponse.json({ error: "Parent subcategory is required." }, { status: 400 });
      }

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (
        await prisma.productType.findFirst({
          where: { subcategoryId, slug: uniqueSlug },
        })
      ) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }

      const productType = await prisma.productType.create({
        data: {
          subcategoryId,
          name: trimmedName,
          slug: uniqueSlug,
          description: description?.trim() || null,
          sortOrder: Number(sortOrder) || 0,
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, item: productType });
    }

    return NextResponse.json({ error: "Invalid target specified." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create category item." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const body = await req.json();
    const { target, id, name, slug, description, image, icon, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) updateData.slug = slugify(slug);
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (image !== undefined) updateData.image = image?.trim() || null;
    if (icon !== undefined) updateData.icon = icon?.trim() || null;
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (target === "category") {
      const updated = await prisma.category.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, item: updated });
    }

    if (target === "subcategory") {
      const updated = await prisma.subcategory.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, item: updated });
    }

    if (target === "productType") {
      const updated = await prisma.productType.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ error: "Invalid target specified." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin categories PATCH error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update category item." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const target = searchParams.get("target");
    const id = searchParams.get("id");

    if (!id || !target) {
      return NextResponse.json({ error: "Target and ID are required." }, { status: 400 });
    }

    if (target === "category") {
      const productCount = await prisma.product.count({ where: { categoryId: id } });
      if (productCount > 0) {
        // Soft deactivate instead of hard delete to preserve foreign key constraints
        await prisma.category.update({ where: { id }, data: { isActive: false } });
        return NextResponse.json({
          success: true,
          message: `Category has ${productCount} active products. It has been deactivated instead of permanently deleted.`,
        });
      }
      await prisma.category.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Category deleted permanently." });
    }

    if (target === "subcategory") {
      const productCount = await prisma.product.count({ where: { subcategoryId: id } });
      if (productCount > 0) {
        await prisma.subcategory.update({ where: { id }, data: { isActive: false } });
        return NextResponse.json({
          success: true,
          message: `Subcategory has ${productCount} active products. It has been deactivated.`,
        });
      }
      await prisma.subcategory.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Subcategory deleted permanently." });
    }

    if (target === "productType") {
      const productCount = await prisma.product.count({ where: { productTypeId: id } });
      if (productCount > 0) {
        await prisma.productType.update({ where: { id }, data: { isActive: false } });
        return NextResponse.json({
          success: true,
          message: `Product Type has ${productCount} active products. It has been deactivated.`,
        });
      }
      await prisma.productType.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Product Type deleted permanently." });
    }

    return NextResponse.json({ error: "Invalid target specified." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin categories DELETE error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete category item." },
      { status: 500 }
    );
  }
}
