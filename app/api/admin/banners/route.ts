import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const banners = await prisma.siteBanner.findMany({
      orderBy: [{ position: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ banners });
  } catch (err: any) {
    console.error("Failed to fetch banners:", err);
    return NextResponse.json({ error: err.message || "Failed to load banners" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { title, subtitle, badge, imageUrl, linkUrl, position, order, isActive } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Banner title and image URL are required." }, { status: 400 });
    }

    const banner = await prisma.siteBanner.create({
      data: {
        title: String(title).trim(),
        subtitle: subtitle ? String(subtitle).trim() : null,
        badge: badge ? String(badge).trim() : null,
        imageUrl: String(imageUrl).trim(),
        linkUrl: linkUrl ? String(linkUrl).trim() : "/products",
        position: position || "HERO",
        order: Number(order ?? 0),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ message: "Banner created successfully!", banner }, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create banner:", err);
    return NextResponse.json({ error: err.message || "Failed to create banner" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, subtitle, badge, imageUrl, linkUrl, position, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Banner ID is required." }, { status: 400 });
    }

    const updated = await prisma.siteBanner.update({
      where: { id },
      data: {
        title: title !== undefined ? String(title).trim() : undefined,
        subtitle: subtitle !== undefined ? (subtitle ? String(subtitle).trim() : null) : undefined,
        badge: badge !== undefined ? (badge ? String(badge).trim() : null) : undefined,
        imageUrl: imageUrl !== undefined ? String(imageUrl).trim() : undefined,
        linkUrl: linkUrl !== undefined ? String(linkUrl).trim() : undefined,
        position: position !== undefined ? String(position).trim() : undefined,
        order: order !== undefined ? Number(order) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ message: "Banner updated successfully!", banner: updated });
  } catch (err: any) {
    console.error("Failed to update banner:", err);
    return NextResponse.json({ error: err.message || "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Banner ID is required." }, { status: 400 });
    }

    await prisma.siteBanner.delete({ where: { id } });

    return NextResponse.json({ message: "Banner deleted successfully!" });
  } catch (err: any) {
    console.error("Failed to delete banner:", err);
    return NextResponse.json({ error: err.message || "Failed to delete banner" }, { status: 500 });
  }
}
