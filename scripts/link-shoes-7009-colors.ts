import prisma from "../lib/db";

async function main() {
  const p = await prisma.product.findFirst({
    where: { slug: "shoes-7009" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });

  if (!p) {
    console.log("shoes-7009 not found!");
    return;
  }

  console.log(`Updating shoes-7009: ${p.images.length} images, ${p.variants.length} variants.`);

  const images = p.images;
  const mintGreenImg = images[0]?.url || "";
  const oliveGreenImg = images[2]?.url || "";
  const tanBrownImg = images[5]?.url || images[4]?.url || "";
  const stoneGreyImg = images[6]?.url || "";

  // 1. Update Variant Images
  for (const v of p.variants) {
    let imgUrl = "";
    const colorLower = (v.color || "").toLowerCase();
    if (colorLower.includes("mint")) imgUrl = mintGreenImg;
    else if (colorLower.includes("olive")) imgUrl = oliveGreenImg;
    else if (colorLower.includes("tan") || colorLower.includes("brown")) imgUrl = tanBrownImg;
    else if (colorLower.includes("grey") || colorLower.includes("gray") || colorLower.includes("stone")) imgUrl = stoneGreyImg;

    if (imgUrl) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { image: imgUrl },
      });
      console.log(`Updated variant ${v.name} -> image set.`);
    }
  }

  // 2. Update Image Alt Tags to Color Names
  const colorMap = [
    "Mint Green",
    "Mint Green",
    "Olive Green",
    "Olive Green",
    "Tan Brown",
    "Tan Brown",
    "Stone Grey",
    "Stone Grey",
  ];

  for (let i = 0; i < images.length; i++) {
    const color = colorMap[i];
    if (color) {
      await prisma.productImage.update({
        where: { id: images[i].id },
        data: { alt: color },
      });
      console.log(`Updated image [${i}] alt -> "${color}"`);
    }
  }

  console.log("shoes-7009 colors and pictures successfully mapped!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
