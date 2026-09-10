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
      cnicFrontUrl,
      cnicBackUrl,
      bankProofUrl,
      bankName,
      accountTitle,
      accountNumber,
      iban,
      isPhoneVerified,
    } = body;

    if (!storeName || !businessName || !cnic || !phone || !businessAddress) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (!cnicFrontUrl || !cnicBackUrl) {
      return NextResponse.json(
        { error: "Government CNIC Front and Back photos are required for seller verification." },
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
          isPhoneVerified: Boolean(isPhoneVerified),
          cnicFrontUrl: cnicFrontUrl || null,
          cnicBackUrl: cnicBackUrl || null,
          bankProofUrl: bankProofUrl || null,
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
          cnicFrontUrl: cnicFrontUrl || null,
          cnicBackUrl: cnicBackUrl || null,
          bankProofUrl: bankProofUrl || null,
          bankName: bankName || null,
          accountTitle: accountTitle || null,
          accountNumber: accountNumber || null,
          iban: iban || null,
          isPhoneVerified: Boolean(isPhoneVerified),
          rejectionReason: null,
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
          cnicFrontUrl: cnicFrontUrl || null,
          cnicBackUrl: cnicBackUrl || null,
          bankProofUrl: bankProofUrl || null,
          bankName: bankName || null,
          accountTitle: accountTitle || null,
          accountNumber: accountNumber || null,
          iban: iban || null,
          isPhoneVerified: Boolean(isPhoneVerified),
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
