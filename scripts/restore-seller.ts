import prisma from "../lib/db";

async function main() {
  const email = "fayazmalikpk00@gmail.com";
  console.log(`Checking user: ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { sellerProfile: true, applications: true },
  });

  if (!user) {
    console.error(`User with email ${email} not found!`);
    return;
  }

  console.log(`Found user: ${user.name} (${user.id}), Role: ${user.role}`);

  // Create or update Seller Profile & Seller Application
  const storeName = "FAYZEE Store";
  const storeSlug = "fayzee-store";

  const application = await prisma.sellerApplication.create({
    data: {
      userId: user.id,
      storeName,
      businessName: "FAYZEE Retail",
      businessAddress: "Lahore / Peshawar, Pakistan",
      phone: user.phone || "03265750126",
      email: user.email,
      cnic: "12345-1234567-1",
      isPhoneVerified: true,
      isEmailVerified: true,
      status: "PENDING",
      notes: "Official Store Seller Application",
    },
  });

  console.log("Created Seller Application:", application.id);

  const profile = await prisma.sellerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      storeName,
      businessName: "FAYZEE Retail",
      storeSlug,
      description: "Official FAYZEE Store — Quality products with fast nationwide delivery.",
      phone: user.phone || "03265750126",
      address: "Lahore / Peshawar, Pakistan",
      cnic: "12345-1234567-1",
      bankName: "Meezan Bank Limited",
      accountTitle: "Fayaz Ullah",
      accountNumber: "01020304050607",
      iban: "PK36MEZN0001020304050607",
      isPhoneVerified: true,
      isEmailVerified: true,
      commissionRate: 10.0,
      status: "PENDING",
    },
    update: {
      storeName,
      storeSlug,
      status: "PENDING",
    },
  });

  console.log("Created / Updated Seller Profile:", profile.id, "Status:", profile.status);

  // Ensure user has role SELLER
  await prisma.user.update({
    where: { id: user.id },
    data: { role: "SELLER" },
  });

  console.log("✅ Successfully restored seller profile and application in database!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
