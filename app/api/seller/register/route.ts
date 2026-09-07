import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeName,
      businessName,
      cnic,
      taxNumber,
      businessAddress,
      phone,
      description,
    } = body;

    if (!storeName || !businessName || !cnic || !phone || !businessAddress) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const baseSlug = slugify(storeName);
    const storeSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // Create Application and Profile in transaction
    const profile = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { role: "SELLER" },
      });

      await tx.sellerApplication.create({
        data: {
          userId: user.id,
          businessName,
          storeName,
          businessAddress,
          taxNumber: taxNumber || null,
          cnic,
          phone,
          notes: description,
          status: "PENDING",
        },
      });

      return tx.sellerProfile.upsert({
        where: { userId: user.id },
        update: {
          storeName,
          businessName,
          storeSlug,
          description,
          phone,
          address: businessAddress,
          cnic,
          taxNumber,
          status: "PENDING",
        },
        create: {
          userId: user.id,
          storeName,
          businessName,
          storeSlug,
          description,
          phone,
          address: businessAddress,
          cnic,
          taxNumber,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json({
      message: "Seller application submitted successfully.",
      profile,
    });
  } catch (error: any) {
    console.error("Seller registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
