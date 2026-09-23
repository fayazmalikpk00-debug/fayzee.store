import prisma from "../lib/db";

async function main() {
  const email = process.argv[2] || "fayazmalikpk00@gmail.com";
  console.log(`Approving seller account for: ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { sellerProfile: true },
  });

  if (!user || !user.sellerProfile) {
    console.error(`Seller profile not found for ${email}`);
    return;
  }

  const updatedProfile = await prisma.sellerProfile.update({
    where: { id: user.sellerProfile.id },
    data: {
      status: "APPROVED",
      rejectionReason: null,
    },
  });

  await prisma.sellerApplication.updateMany({
    where: { userId: user.id },
    data: {
      status: "APPROVED",
      reviewedBy: "Super Admin",
      reviewedAt: new Date(),
    },
  });

  console.log(`✅ Seller profile for ${user.name} (${email}) has been APPROVED!`);
  console.log(`Store Name: ${updatedProfile.storeName}`);
  console.log(`Status: ${updatedProfile.status}`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
