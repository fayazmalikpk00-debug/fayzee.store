import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    return NextResponse.json({ coupons });
  } catch (err: any) {
    console.error("Failed to fetch coupons:", err);
    return NextResponse.json({ error: err.message || "Failed to load coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      isActive,
    } = body;

    if (!code || !discountValue || !endDate) {
      return NextResponse.json(
        { error: "Coupon code, discount value, and end date are required." },
        { status: 400 }
      );
    }

    const cleanCode = String(code).trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Coupon code '${cleanCode}' already exists.` },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description ? String(description).trim() : null,
        discountType: discountType === "FIXED" ? "FIXED" : "PERCENTAGE",
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount ?? 0),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usageLimit: Number(usageLimit ?? 100),
        perUserLimit: Number(perUserLimit ?? 1),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ message: "Coupon created successfully!", coupon }, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create coupon:", err);
    return NextResponse.json({ error: err.message || "Failed to create coupon" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, isActive, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, endDate } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required." }, { status: 400 });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        discountValue: discountValue !== undefined ? Number(discountValue) : undefined,
        minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : undefined,
        maxDiscountAmount: maxDiscountAmount !== undefined ? (maxDiscountAmount ? Number(maxDiscountAmount) : null) : undefined,
        usageLimit: usageLimit !== undefined ? Number(usageLimit) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    return NextResponse.json({ message: "Coupon updated successfully!", coupon: updated });
  } catch (err: any) {
    console.error("Failed to update coupon:", err);
    return NextResponse.json({ error: err.message || "Failed to update coupon" }, { status: 500 });
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
      return NextResponse.json({ error: "Coupon ID is required." }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ message: "Coupon deleted successfully!" });
  } catch (err: any) {
    console.error("Failed to delete coupon:", err);
    return NextResponse.json({ error: err.message || "Failed to delete coupon" }, { status: 500 });
  }
}
