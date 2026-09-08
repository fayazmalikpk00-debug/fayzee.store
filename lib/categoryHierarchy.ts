/**
 * FAYZEE Authoritative Marketplace Category Hierarchy & Dynamic Attribute Specifications
 * 
 * 18 Complete Top-Level Categories
 * -> Subcategories
 *   -> Product Types
 * 
 * Provides:
 * - 3-tier taxonomy tree
 * - Category-specific dynamic attribute definitions
 * - Helper lookup functions
 */

export interface ProductTypeDefinition {
  name: string;
  slug: string;
  description?: string;
}

export interface SubcategoryDefinition {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  productTypes: ProductTypeDefinition[];
}

export interface CategoryDefinition {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  sortOrder: number;
  attributeGroup: "electronics" | "fashion" | "shoes" | "appliances" | "grocery" | "beauty" | "general";
  subcategories: SubcategoryDefinition[];
}

export interface AttributeField {
  key: string;
  label: string;
  type: "text" | "select" | "number";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export const CATEGORY_ATTRIBUTES: Record<string, AttributeField[]> = {
  fashion: [
    { key: "brand", label: "Brand", type: "text", placeholder: "e.g. Khaadi, Gul Ahmed, Levi's" },
    { key: "size", label: "Size", type: "select", options: ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "3XL"] },
    { key: "color", label: "Primary Color", type: "text", placeholder: "e.g. Navy Blue, Black, Crimson Red" },
    { key: "material", label: "Material / Fabric", type: "text", placeholder: "e.g. 100% Cotton, Lawn, Silk, Denim, Wool" },
    { key: "gender", label: "Gender", type: "select", options: ["Men", "Women", "Unisex", "Boys", "Girls"] },
    { key: "ageGroup", label: "Age Group", type: "select", options: ["Adult", "Teen", "Kids", "Toddler", "Infant"] },
  ],
  shoes: [
    { key: "brand", label: "Brand", type: "text", placeholder: "e.g. Nike, Adidas, Bata, Service, Ndure" },
    { key: "size", label: "Shoe Size", type: "select", options: ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45", "EU 46"] },
    { key: "color", label: "Color", type: "text", placeholder: "e.g. Black, White, Brown, Grey" },
    { key: "material", label: "Upper Material", type: "text", placeholder: "e.g. Genuine Leather, Synthetic, Mesh, Canvas" },
    { key: "gender", label: "Gender", type: "select", options: ["Men", "Women", "Unisex", "Kids"] },
    { key: "shoeType", label: "Shoe Type", type: "select", options: ["Sneakers", "Casual", "Formal", "Sports", "Running", "Sandals", "Boots", "Heels", "Flats"] },
  ],
  electronics: [
    { key: "brand", label: "Brand", type: "text", placeholder: "e.g. Apple, Samsung, Dell, Sony, Xiaomi, HP" },
    { key: "model", label: "Model / Series", type: "text", placeholder: "e.g. iPhone 15 Pro, Galaxy S24, XPS 15" },
    { key: "warranty", label: "Warranty", type: "select", options: ["No Warranty", "1 Month", "3 Months", "6 Months", "1 Year Official", "2 Years Official"] },
    { key: "color", label: "Color / Finish", type: "text", placeholder: "e.g. Space Black, Titanium Gray, Midnight" },
    { key: "storage", label: "Internal Storage", type: "select", options: ["N/A", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"] },
    { key: "ram", label: "RAM / Memory", type: "select", options: ["N/A", "4GB", "6GB", "8GB", "12GB", "16GB", "32GB", "64GB"] },
    { key: "connectivity", label: "Connectivity", type: "text", placeholder: "e.g. 5G, Wi-Fi 6E, Bluetooth 5.3, USB-C" },
    { key: "battery", label: "Battery Capacity", type: "text", placeholder: "e.g. 5000 mAh, 80Wh, 12-Hour Battery" },
    { key: "condition", label: "Condition", type: "select", options: ["Brand New (Box Pack)", "Open Box", "Refurbished", "Used - Like New"] },
  ],
  appliances: [
    { key: "brand", label: "Brand", type: "text", placeholder: "e.g. Dawlance, Haier, Pel, Gree, Philips, Kenwood" },
    { key: "model", label: "Model Number", type: "text", placeholder: "e.g. DW-MD-100, HSU-18HNS" },
    { key: "warranty", label: "Warranty", type: "select", options: ["1 Year Comprehensive", "3 Years Compressor", "5 Years Motor", "10 Years Inverter", "No Warranty"] },
    { key: "power", label: "Power Consumption", type: "text", placeholder: "e.g. 1500 Watts, Inverter T3" },
    { key: "capacity", label: "Capacity / Volume", type: "text", placeholder: "e.g. 1.5 Ton, 350 Liters, 8 Kg, 30L" },
    { key: "color", label: "Color", type: "text", placeholder: "e.g. Silver, Black Glass, White" },
    { key: "energyRating", label: "Energy Efficiency", type: "select", options: ["A+++ Inverter", "5 Star Energy Saver", "4 Star", "Standard"] },
  ],
  grocery: [
    { key: "brand", label: "Brand", type: "text", placeholder: "e.g. National, Shan, Olper's, Nestle, Dalda" },
    { key: "weight", label: "Weight / Net Volume", type: "text", placeholder: "e.g. 1 Kg, 500g, 1 Liter, 250ml" },
    { key: "quantity", label: "Pack Quantity", type: "text", placeholder: "e.g. Pack of 1, Pack of 6, Box of 12" },
    { key: "expiryDate", label: "Expiry Date / Shelf Life", type: "text", placeholder: "e.g. 12 Months from MFD, Dec 2027" },
    { key: "ingredients", label: "Key Ingredients", type: "text", placeholder: "e.g. Pure Basmati Rice, Refined Wheat" },
    { key: "packagingType", label: "Packaging Type", type: "select", options: ["Pouch / Bag", "Tin / Can", "Glass Bottle", "Plastic Bottle", "Carton Box", "Vacuum Pack"] },
  ],
  beauty: [
    { key: "brand", label: "Brand", type: "text", placeholder: "e.g. L'Oreal, Maybelline, The Ordinary, CeraVe, Saeed Ghani" },
    { key: "skinType", label: "Suitable Skin Type", type: "select", options: ["All Skin Types", "Dry Skin", "Oily Skin", "Sensitive Skin", "Combination", "Acne-Prone"] },
    { key: "productType", label: "Form / Texture", type: "select", options: ["Serum", "Cream", "Lotion", "Gel", "Liquid", "Powder", "Oil", "Mist"] },
    { key: "size", label: "Net Volume / Weight", type: "text", placeholder: "e.g. 30ml, 50ml, 100g, 200ml" },
    { key: "ingredients", label: "Active Ingredients", type: "text", placeholder: "e.g. Hyaluronic Acid, Niacinamide, Vitamin C, Retinol" },
    { key: "expiryDate", label: "Shelf Life", type: "text", placeholder: "e.g. 24 Months, Exp 2027" },
  ],
  general: [
    { key: "brand", label: "Brand", type: "text", placeholder: "e.g. Authentic, Generic, OEM" },
    { key: "model", label: "Model / Item Code", type: "text", placeholder: "Optional item code" },
    { key: "color", label: "Color", type: "text", placeholder: "e.g. Black, White, Natural" },
    { key: "material", label: "Material", type: "text", placeholder: "e.g. Wood, Steel, Plastic, Glass" },
    { key: "warranty", label: "Warranty", type: "select", options: ["Check Warranty", "7 Days Replacement", "1 Month", "1 Year", "No Warranty"] },
  ],
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeTypes(names: string[]): ProductTypeDefinition[] {
  return names.map((name) => ({
    name,
    slug: slugify(name),
  }));
}

export const COMPLETE_MARKETPLACE_HIERARCHY: CategoryDefinition[] = [
  // 1. ELECTRONICS
  {
    name: "Electronics",
    slug: "electronics",
    description: "Smartphones, laptops, smart gadgets, entertainment, gaming and accessories",
    icon: "Smartphone",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
    sortOrder: 1,
    attributeGroup: "electronics",
    subcategories: [
      {
        name: "Smartphones & Tablets",
        slug: "smartphones-tablets",
        description: "Flagship phones, tablets and essential mobile accessories",
        productTypes: makeTypes([
          "Smartphones",
          "Feature Phones",
          "Tablets",
          "E-Readers",
          "Smartphone Cases",
          "Screen Protectors",
          "Chargers",
          "Power Banks",
          "Cables",
          "Mobile Accessories",
        ]),
      },
      {
        name: "Laptops & Computers",
        slug: "laptops-computers",
        description: "Ultrabooks, gaming rigs, workstations and components",
        productTypes: makeTypes([
          "Laptops",
          "Desktop Computers",
          "Gaming PCs",
          "Monitors",
          "Keyboards",
          "Mice",
          "Webcams",
          "Printers",
          "Scanners",
          "Computer Components",
          "Graphics Cards",
          "RAM",
          "SSD",
          "Hard Drives",
          "USB Drives",
          "Computer Accessories",
        ]),
      },
      {
        name: "TVs & Home Entertainment",
        slug: "tvs-home-entertainment",
        description: "Smart LED TVs, projectors and home cinema audio",
        productTypes: makeTypes([
          "LED TVs",
          "Smart TVs",
          "QLED TVs",
          "OLED TVs",
          "TV Boxes",
          "Projectors",
          "Remote Controls",
          "TV Accessories",
        ]),
      },
      {
        name: "Audio",
        slug: "audio",
        description: "Wireless earbuds, noise-cancelling headphones and speakers",
        productTypes: makeTypes([
          "Headphones",
          "Earphones",
          "Wireless Earbuds",
          "Bluetooth Speakers",
          "Soundbars",
          "Home Theater Systems",
          "Microphones",
          "Audio Accessories",
        ]),
      },
      {
        name: "Cameras",
        slug: "cameras",
        description: "DSLRs, action cams, mirrorless cameras and pro lenses",
        productTypes: makeTypes([
          "Digital Cameras",
          "DSLR Cameras",
          "Mirrorless Cameras",
          "Action Cameras",
          "Security Cameras",
          "Camera Lenses",
          "Camera Bags",
          "Tripods",
          "Camera Accessories",
        ]),
      },
      {
        name: "Gaming",
        slug: "gaming",
        description: "Consoles, controllers, PC peripherals and video games",
        productTypes: makeTypes([
          "Gaming Consoles",
          "PlayStation",
          "Xbox",
          "Nintendo",
          "Gaming Controllers",
          "Gaming Headsets",
          "Gaming Keyboards",
          "Gaming Mice",
          "Gaming Chairs",
          "Gaming Accessories",
          "Video Games",
        ]),
      },
      {
        name: "Smart Devices",
        slug: "smart-devices",
        description: "Smartwatches, fitness bands and home automation",
        productTypes: makeTypes([
          "Smart Watches",
          "Fitness Bands",
          "Smart Glasses",
          "Smart Home Devices",
          "Smart Lighting",
          "Smart Sensors",
          "Smart Accessories",
        ]),
      },
    ],
  },

  // 2. MEN'S FASHION
  {
    name: "Men's Fashion",
    slug: "mens-fashion",
    description: "Men's clothing, traditional wear, footwear, watches and accessories",
    icon: "Shirt",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800",
    sortOrder: 2,
    attributeGroup: "fashion",
    subcategories: [
      {
        name: "Men's Clothing",
        slug: "mens-clothing",
        description: "Everyday casuals, formal suits and traditional Shalwar Kameez",
        productTypes: makeTypes([
          "T-Shirts",
          "Shirts",
          "Polo Shirts",
          "Jeans",
          "Trousers",
          "Pants",
          "Shorts",
          "Hoodies",
          "Sweatshirts",
          "Jackets",
          "Coats",
          "Suits",
          "Blazers",
          "Shalwar Kameez",
          "Kurta",
          "Waistcoats",
          "Traditional Clothing",
          "Underwear",
          "Socks",
          "Nightwear",
        ]),
      },
      {
        name: "Men's Footwear",
        slug: "mens-footwear",
        description: "Sneakers, formal shoes, sports shoes and ethnic footwear",
        productTypes: makeTypes([
          "Sneakers",
          "Casual Shoes",
          "Formal Shoes",
          "Sports Shoes",
          "Running Shoes",
          "Sandals",
          "Slippers",
          "Boots",
          "Loafers",
          "Traditional Footwear",
        ]),
      },
      {
        name: "Men's Accessories",
        slug: "mens-accessories",
        description: "Leather wallets, belts, caps, sunglasses and cufflinks",
        productTypes: makeTypes([
          "Wallets",
          "Belts",
          "Caps",
          "Hats",
          "Sunglasses",
          "Scarves",
          "Gloves",
          "Ties",
          "Cufflinks",
          "Keychains",
        ]),
      },
      {
        name: "Men's Watches",
        slug: "mens-watches",
        description: "Chronograph, sports and luxury wristwatches",
        productTypes: makeTypes([
          "Casual Watches",
          "Formal Watches",
          "Sports Watches",
          "Smart Watches",
          "Luxury Watches",
        ]),
      },
    ],
  },

  // 3. WOMEN'S FASHION
  {
    name: "Women's Fashion",
    slug: "womens-fashion",
    description: "Women's clothing, eastern wear, footwear, bags, jewelry and accessories",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
    sortOrder: 3,
    attributeGroup: "fashion",
    subcategories: [
      {
        name: "Women's Clothing",
        slug: "womens-clothing",
        description: "Dresses, western apparel, kurtis, abayas and formal suits",
        productTypes: makeTypes([
          "Dresses",
          "Tops",
          "Shirts",
          "T-Shirts",
          "Jeans",
          "Trousers",
          "Pants",
          "Skirts",
          "Shorts",
          "Hoodies",
          "Sweaters",
          "Jackets",
          "Coats",
          "Suits",
          "Abayas",
          "Hijabs",
          "Shalwar Kameez",
          "Kurtis",
          "Sarees",
          "Traditional Clothing",
          "Nightwear",
          "Undergarments",
        ]),
      },
      {
        name: "Women's Footwear",
        slug: "womens-footwear",
        description: "Heels, flats, sneakers, boots and festive footwear",
        productTypes: makeTypes([
          "Sneakers",
          "Casual Shoes",
          "Formal Shoes",
          "Sandals",
          "Slippers",
          "Heels",
          "Flats",
          "Boots",
          "Traditional Footwear",
        ]),
      },
      {
        name: "Women's Bags",
        slug: "womens-bags",
        description: "Handbags, shoulder bags, crossbody totes and clutches",
        productTypes: makeTypes([
          "Handbags",
          "Shoulder Bags",
          "Crossbody Bags",
          "Tote Bags",
          "Backpacks",
          "Clutches",
          "Wallets",
          "Travel Bags",
        ]),
      },
      {
        name: "Jewelry",
        slug: "jewelry",
        description: "Necklaces, rings, earrings, bangles and bridal sets",
        productTypes: makeTypes([
          "Rings",
          "Necklaces",
          "Earrings",
          "Bracelets",
          "Bangles",
          "Anklets",
          "Jewelry Sets",
          "Artificial Jewelry",
        ]),
      },
      {
        name: "Women's Accessories",
        slug: "womens-accessories",
        description: "Sunglasses, scarves, hijab pins, hair accessories and belts",
        productTypes: makeTypes([
          "Sunglasses",
          "Scarves",
          "Hijab Accessories",
          "Hair Accessories",
          "Belts",
          "Gloves",
          "Fashion Accessories",
        ]),
      },
      {
        name: "Women's Watches",
        slug: "womens-watches",
        description: "Designer, casual and luxury timepieces",
        productTypes: makeTypes([
          "Casual Watches",
          "Formal Watches",
          "Smart Watches",
          "Luxury Watches",
        ]),
      },
    ],
  },

  // 4. KIDS & BABIES
  {
    name: "Kids & Babies",
    slug: "kids-babies",
    description: "Boys' and girls' fashion, baby care, toys, and nursery products",
    icon: "Baby",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800",
    sortOrder: 4,
    attributeGroup: "fashion",
    subcategories: [
      {
        name: "Boys' Clothing",
        slug: "boys-clothing",
        description: "T-shirts, pants, ethnic kurta and winter wear",
        productTypes: makeTypes([
          "T-Shirts",
          "Shirts",
          "Jeans",
          "Pants",
          "Shorts",
          "Hoodies",
          "Jackets",
          "Suits",
          "Shalwar Kameez",
          "Kurta",
          "Traditional Clothing",
          "Nightwear",
        ]),
      },
      {
        name: "Girls' Clothing",
        slug: "girls-clothing",
        description: "Frocks, dresses, kurtis, pants and party wear",
        productTypes: makeTypes([
          "Dresses",
          "Tops",
          "Shirts",
          "Jeans",
          "Pants",
          "Skirts",
          "Hoodies",
          "Jackets",
          "Traditional Clothing",
          "Shalwar Kameez",
          "Kurtis",
          "Nightwear",
        ]),
      },
      {
        name: "Boys' Footwear",
        slug: "boys-footwear",
        description: "Sneakers, school shoes, sandals and sports shoes",
        productTypes: makeTypes([
          "Sneakers",
          "School Shoes",
          "Sandals",
          "Slippers",
          "Boots",
          "Sports Shoes",
        ]),
      },
      {
        name: "Girls' Footwear",
        slug: "girls-footwear",
        description: "Flats, sandals, school shoes and party boots",
        productTypes: makeTypes([
          "Sneakers",
          "School Shoes",
          "Sandals",
          "Slippers",
          "Flats",
          "Boots",
        ]),
      },
      {
        name: "Baby Clothing",
        slug: "baby-clothing",
        description: "Bodysuits, rompers, mittens, socks and sleepwear",
        productTypes: makeTypes([
          "Baby Bodysuits",
          "Baby Dresses",
          "Baby Shirts",
          "Baby Pants",
          "Baby Sets",
          "Baby Sleepwear",
          "Baby Socks",
          "Baby Accessories",
        ]),
      },
      {
        name: "Baby Products",
        slug: "baby-products",
        description: "Diapers, feeding bottles, strollers, carriers and nursery",
        productTypes: makeTypes([
          "Diapers",
          "Baby Feeding",
          "Baby Bottles",
          "Baby Strollers",
          "Baby Carriers",
          "Baby Furniture",
          "Baby Care",
          "Baby Toys",
        ]),
      },
      {
        name: "Toys",
        slug: "toys",
        description: "Educational puzzles, action figures, dolls and board games",
        productTypes: makeTypes([
          "Educational Toys",
          "Action Figures",
          "Dolls",
          "Remote Control Toys",
          "Building Blocks",
          "Board Games",
          "Outdoor Toys",
          "Kids Games",
          "Musical Toys",
        ]),
      },
    ],
  },

  // 5. BEAUTY & PERSONAL CARE
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description: "Makeup, skincare, haircare, fragrances and grooming",
    icon: "Heart",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
    sortOrder: 5,
    attributeGroup: "beauty",
    subcategories: [
      {
        name: "Makeup",
        slug: "makeup",
        description: "Lipsticks, foundation, eye palettes, brushes and tools",
        productTypes: makeTypes([
          "Foundation",
          "Concealer",
          "Face Powder",
          "Blush",
          "Lipstick",
          "Lip Gloss",
          "Mascara",
          "Eyeliner",
          "Eyeshadow",
          "Makeup Kits",
          "Makeup Brushes",
          "Makeup Accessories",
        ]),
      },
      {
        name: "Skincare",
        slug: "skincare",
        description: "Cleansers, moisturizers, serums, sunscreens and masks",
        productTypes: makeTypes([
          "Face Wash",
          "Moisturizers",
          "Serums",
          "Sunscreen",
          "Face Masks",
          "Toners",
          "Cleansers",
          "Body Care",
        ]),
      },
      {
        name: "Hair Care",
        slug: "hair-care",
        description: "Shampoo, conditioners, oils, hair masks and styling appliances",
        productTypes: makeTypes([
          "Shampoo",
          "Conditioner",
          "Hair Oil",
          "Hair Masks",
          "Hair Styling Products",
          "Hair Dryers",
          "Hair Straighteners",
          "Hair Curlers",
          "Hair Accessories",
        ]),
      },
      {
        name: "Fragrances",
        slug: "fragrances",
        description: "Designer perfumes, body mists, deodorants and attars",
        productTypes: makeTypes([
          "Perfumes",
          "Body Sprays",
          "Deodorants",
          "Attars",
          "Fragrance Sets",
        ]),
      },
      {
        name: "Men's Grooming",
        slug: "mens-grooming",
        description: "Beard oils, trimmers, razors, shaving foam and kits",
        productTypes: makeTypes([
          "Shaving Products",
          "Razors",
          "Beard Care",
          "Trimmers",
          "Grooming Kits",
          "Aftershave",
        ]),
      },
      {
        name: "Personal Care",
        slug: "personal-care",
        description: "Oral care, body wash, bath soaks and sanitary hygiene",
        productTypes: makeTypes([
          "Oral Care",
          "Bath & Body",
          "Hand Care",
          "Foot Care",
          "Personal Hygiene",
          "Beauty Accessories",
        ]),
      },
    ],
  },

  // 6. HOME & LIVING
  {
    name: "Home & Living",
    slug: "home-living",
    description: "Furniture, home decor, bedding, kitchen essentials, bathroom and storage",
    icon: "Home",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
    sortOrder: 6,
    attributeGroup: "general",
    subcategories: [
      {
        name: "Furniture",
        slug: "furniture",
        description: "Living room sofas, beds, dining sets and office desks",
        productTypes: makeTypes([
          "Sofas",
          "Beds",
          "Mattresses",
          "Tables",
          "Chairs",
          "Cabinets",
          "Wardrobes",
          "Desks",
          "Shelves",
          "TV Units",
        ]),
      },
      {
        name: "Home Decor",
        slug: "home-decor",
        description: "Wall paintings, mirrors, clocks, vases, candles and rugs",
        productTypes: makeTypes([
          "Wall Art",
          "Paintings",
          "Mirrors",
          "Clocks",
          "Vases",
          "Decorative Items",
          "Artificial Plants",
          "Candles",
          "Rugs",
          "Carpets",
        ]),
      },
      {
        name: "Bedding",
        slug: "bedding",
        description: "Cotton bedsheets, comforters, pillows and curtains",
        productTypes: makeTypes([
          "Bedsheets",
          "Blankets",
          "Pillows",
          "Comforters",
          "Mattress Protectors",
          "Curtains",
        ]),
      },
      {
        name: "Kitchen & Dining",
        slug: "kitchen-dining",
        description: "Cookware sets, dinnerware, cutlery, glasses and food containers",
        productTypes: makeTypes([
          "Cookware",
          "Dinner Sets",
          "Plates",
          "Cups & Mugs",
          "Glasses",
          "Cutlery",
          "Kitchen Tools",
          "Storage Containers",
          "Water Bottles",
        ]),
      },
      {
        name: "Bathroom",
        slug: "bathroom",
        description: "Luxury towels, bath mats, shower curtains and organizers",
        productTypes: makeTypes([
          "Towels",
          "Bath Mats",
          "Shower Accessories",
          "Bathroom Storage",
          "Bathroom Accessories",
        ]),
      },
      {
        name: "Storage & Organization",
        slug: "storage-organization",
        description: "Storage bins, shoe racks, closet organizers and hangers",
        productTypes: makeTypes([
          "Storage Boxes",
          "Organizers",
          "Shelves",
          "Shoe Racks",
          "Clothes Storage",
        ]),
      },
      {
        name: "Lighting",
        slug: "lighting",
        description: "Ceiling chandeliers, table lamps, LED strips and smart bulbs",
        productTypes: makeTypes([
          "Ceiling Lights",
          "Wall Lights",
          "Table Lamps",
          "Floor Lamps",
          "LED Lights",
          "Decorative Lights",
          "Smart Lights",
        ]),
      },
    ],
  },

  // 7. HOME APPLIANCES
  {
    name: "Home Appliances",
    slug: "home-appliances",
    description: "Refrigerators, ACs, washing machines, kitchen and small appliances",
    icon: "Tv",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800",
    sortOrder: 7,
    attributeGroup: "appliances",
    subcategories: [
      {
        name: "Large Appliances",
        slug: "large-appliances",
        description: "Inverter ACs, double door fridges, washing machines and deep freezers",
        productTypes: makeTypes([
          "Refrigerators",
          "Freezers",
          "Washing Machines",
          "Dryers",
          "Air Conditioners",
          "Water Dispensers",
        ]),
      },
      {
        name: "Kitchen Appliances",
        slug: "kitchen-appliances",
        description: "Air fryers, microwaves, blenders, juicers and coffee machines",
        productTypes: makeTypes([
          "Microwave Ovens",
          "Ovens",
          "Air Fryers",
          "Blenders",
          "Juicers",
          "Food Processors",
          "Electric Kettles",
          "Coffee Machines",
          "Toasters",
          "Sandwich Makers",
          "Rice Cookers",
        ]),
      },
      {
        name: "Small Appliances",
        slug: "small-appliances",
        description: "Steam irons, vacuum cleaners, room heaters and humidifiers",
        productTypes: makeTypes([
          "Vacuum Cleaners",
          "Irons",
          "Fans",
          "Heaters",
          "Air Purifiers",
          "Humidifiers",
        ]),
      },
    ],
  },

  // 8. GROCERY & FOOD
  {
    name: "Grocery & Food",
    slug: "grocery-food",
    description: "Fresh produce, cooking essentials, snacks, beverages and packaged foods",
    icon: "ShoppingBag",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    sortOrder: 8,
    attributeGroup: "grocery",
    subcategories: [
      {
        name: "Fresh Food",
        slug: "fresh-food",
        description: "Organic vegetables, fresh fruits, chicken, meat and dairy",
        productTypes: makeTypes([
          "Fruits",
          "Vegetables",
          "Meat",
          "Chicken",
          "Fish",
          "Eggs",
          "Dairy Products",
        ]),
      },
      {
        name: "Snacks",
        slug: "snacks",
        description: "Chips, cookies, chocolates, premium dry fruits and nuts",
        productTypes: makeTypes([
          "Chips",
          "Biscuits",
          "Chocolates",
          "Candy",
          "Nuts",
          "Dry Fruits",
          "Popcorn",
        ]),
      },
      {
        name: "Beverages",
        slug: "beverages",
        description: "Black tea, green tea, roast coffee, juices and soda",
        productTypes: makeTypes([
          "Soft Drinks",
          "Juices",
          "Water",
          "Tea",
          "Coffee",
          "Energy Drinks",
        ]),
      },
      {
        name: "Cooking Essentials",
        slug: "cooking-essentials",
        description: "Basmati rice, pure cooking oil, flour, spices and sauces",
        productTypes: makeTypes([
          "Rice",
          "Flour",
          "Sugar",
          "Salt",
          "Spices",
          "Cooking Oil",
          "Sauces",
          "Pickles",
        ]),
      },
      {
        name: "Bakery",
        slug: "bakery",
        description: "Fresh bread, buns, celebration cakes and pastries",
        productTypes: makeTypes([
          "Bread",
          "Cakes",
          "Cookies",
          "Pastries",
          "Bakery Items",
        ]),
      },
      {
        name: "Packaged Food",
        slug: "packaged-food",
        description: "Instant noodles, canned olives, cereals and breakfast oats",
        productTypes: makeTypes([
          "Instant Noodles",
          "Canned Food",
          "Frozen Food",
          "Breakfast Foods",
        ]),
      },
    ],
  },

  // 9. SPORTS & FITNESS
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description: "Sportswear, cricket, football, gym equipment, outdoor gear",
    icon: "Activity",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
    sortOrder: 9,
    attributeGroup: "fashion",
    subcategories: [
      {
        name: "Sportswear",
        slug: "sportswear",
        description: "Athletic tracksuits, gym shirts, shorts and running socks",
        productTypes: makeTypes([
          "T-Shirts",
          "Shorts",
          "Tracksuits",
          "Sports Jackets",
          "Sports Shoes",
          "Sports Socks",
        ]),
      },
      {
        name: "Cricket",
        slug: "cricket",
        description: "English willow bats, balls, batting gloves, pads and helmets",
        productTypes: makeTypes([
          "Cricket Bats",
          "Cricket Balls",
          "Cricket Gloves",
          "Cricket Helmets",
          "Cricket Pads",
          "Cricket Kits",
          "Cricket Accessories",
        ]),
      },
      {
        name: "Football",
        slug: "football",
        description: "Match footballs, club jerseys, studs and goalie gloves",
        productTypes: makeTypes([
          "Footballs",
          "Football Shoes",
          "Jerseys",
          "Goalkeeper Equipment",
          "Football Accessories",
        ]),
      },
      {
        name: "Gym & Fitness",
        slug: "gym-fitness",
        description: "Dumbbells, resistance bands, yoga mats and pull-up bars",
        productTypes: makeTypes([
          "Dumbbells",
          "Barbells",
          "Resistance Bands",
          "Yoga Mats",
          "Exercise Equipment",
          "Fitness Accessories",
        ]),
      },
      {
        name: "Outdoor",
        slug: "outdoor",
        description: "Camping tents, sleeping bags, hiking backpacks and gear",
        productTypes: makeTypes([
          "Camping Equipment",
          "Tents",
          "Hiking Equipment",
          "Travel Accessories",
          "Outdoor Gear",
        ]),
      },
      {
        name: "Other Sports",
        slug: "other-sports",
        description: "Badminton rackets, tennis balls, basketballs and swimming goggles",
        productTypes: makeTypes([
          "Basketball",
          "Tennis",
          "Badminton",
          "Volleyball",
          "Swimming",
          "Cycling",
        ]),
      },
    ],
  },

  // 10. AUTOMOTIVE
  {
    name: "Automotive",
    slug: "automotive",
    description: "Car accessories, motorcycle gear, car care, spare parts and tools",
    icon: "Car",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    sortOrder: 10,
    attributeGroup: "general",
    subcategories: [
      {
        name: "Car Accessories",
        slug: "car-accessories",
        description: "Seat covers, car phone holders, dash cams and air fresheners",
        productTypes: makeTypes([
          "Car Covers",
          "Seat Covers",
          "Floor Mats",
          "Car Chargers",
          "Phone Holders",
          "Car Cameras",
          "Air Fresheners",
          "Interior Accessories",
        ]),
      },
      {
        name: "Motorcycle",
        slug: "motorcycle",
        description: "DOT helmets, riding gloves, bike covers and security locks",
        productTypes: makeTypes([
          "Helmets",
          "Motorcycle Covers",
          "Motorcycle Accessories",
          "Gloves",
          "Riding Gear",
        ]),
      },
      {
        name: "Car Care",
        slug: "car-care",
        description: "Shampoo, ceramic wax, scratch removers and microfiber towels",
        productTypes: makeTypes([
          "Car Cleaning",
          "Car Polish",
          "Car Wax",
          "Cleaning Tools",
        ]),
      },
      {
        name: "Tools",
        slug: "car-tools",
        description: "Jack stands, tire inflators, jumper cables and toolkits",
        productTypes: makeTypes([
          "Car Tools",
          "Emergency Tools",
          "Tire Tools",
          "Battery Accessories",
        ]),
      },
      {
        name: "Spare Parts",
        slug: "spare-parts",
        description: "LED headlights, oil filters, brake pads and spark plugs",
        productTypes: makeTypes([
          "Engine Parts",
          "Brake Parts",
          "Electrical Parts",
          "Filters",
          "Lights",
          "Other Spare Parts",
        ]),
      },
    ],
  },

  // 11. BOOKS & STATIONERY
  {
    name: "Books & Stationery",
    slug: "books-stationery",
    description: "Fiction, educational books, school supplies, art and craft materials",
    icon: "BookOpen",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
    sortOrder: 11,
    attributeGroup: "general",
    subcategories: [
      {
        name: "Books",
        slug: "books",
        description: "Bestselling novels, academic textbooks, Islamic books and self-help",
        productTypes: makeTypes([
          "Fiction",
          "Non-Fiction",
          "Educational Books",
          "Computer Books",
          "Business Books",
          "Children's Books",
          "Religious Books",
          "Exam Preparation",
        ]),
      },
      {
        name: "School Supplies",
        slug: "school-supplies",
        description: "Notebooks, ballpoints, geometry boxes and school backpacks",
        productTypes: makeTypes([
          "Notebooks",
          "Pens",
          "Pencils",
          "School Bags",
          "Geometry Sets",
          "Art Supplies",
        ]),
      },
      {
        name: "Office Supplies",
        slug: "office-supplies",
        description: "A4 paper, staplers, punch machines, desk organizers and files",
        productTypes: makeTypes([
          "Files",
          "Folders",
          "Paper",
          "Staplers",
          "Office Organizers",
          "Calculators",
        ]),
      },
      {
        name: "Art & Craft",
        slug: "art-craft",
        description: "Acrylic paints, canvases, sketch pads and watercolor brushes",
        productTypes: makeTypes([
          "Drawing Supplies",
          "Paints",
          "Brushes",
          "Craft Materials",
          "Sketchbooks",
        ]),
      },
    ],
  },

  // 12. TOOLS & HARDWARE
  {
    name: "Tools & Hardware",
    slug: "tools-hardware",
    description: "Hand tools, power tools, electrical wiring, hardware and safety equipment",
    icon: "Wrench",
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800",
    sortOrder: 12,
    attributeGroup: "general",
    subcategories: [
      {
        name: "Hand Tools",
        slug: "hand-tools",
        description: "Screwdriver sets, claw hammers, pliers, spanners and tape measures",
        productTypes: makeTypes([
          "Screwdrivers",
          "Hammers",
          "Pliers",
          "Wrenches",
          "Measuring Tools",
        ]),
      },
      {
        name: "Power Tools",
        slug: "power-tools",
        description: "Cordless drills, angle grinders, circular saws and sanders",
        productTypes: makeTypes([
          "Drills",
          "Grinders",
          "Saws",
          "Sanders",
          "Power Tool Accessories",
        ]),
      },
      {
        name: "Electrical",
        slug: "electrical",
        description: "Circuit breakers, copper cables, extension boards and sockets",
        productTypes: makeTypes([
          "Switches",
          "Sockets",
          "Wires",
          "Cables",
          "Electrical Accessories",
        ]),
      },
      {
        name: "Hardware",
        slug: "hardware",
        description: "Door locks, handles, hinges, stainless steel screws and fasteners",
        productTypes: makeTypes([
          "Screws",
          "Nails",
          "Locks",
          "Hinges",
          "Door Hardware",
        ]),
      },
      {
        name: "Safety Equipment",
        slug: "safety-equipment",
        description: "Safety helmets, goggles, high-grip gloves and boots",
        productTypes: makeTypes([
          "Safety Gloves",
          "Safety Goggles",
          "Protective Equipment",
        ]),
      },
    ],
  },

  // 13. PET SUPPLIES
  {
    name: "Pet Supplies",
    slug: "pet-supplies",
    description: "Dog food, cat food, accessories, grooming and pet toys",
    icon: "Heart",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
    sortOrder: 13,
    attributeGroup: "general",
    subcategories: [
      {
        name: "Dog Supplies",
        slug: "dog-supplies",
        description: "Nutritious dog food, chew toys, collars and orthopedic beds",
        productTypes: makeTypes([
          "Dog Food",
          "Dog Toys",
          "Dog Beds",
          "Dog Collars",
          "Dog Leashes",
          "Dog Grooming",
        ]),
      },
      {
        name: "Cat Supplies",
        slug: "cat-supplies",
        description: "Cat kibble, wet food, clumping litter, scratchers and collars",
        productTypes: makeTypes([
          "Cat Food",
          "Cat Toys",
          "Cat Beds",
          "Cat Litter",
          "Cat Collars",
          "Cat Accessories",
        ]),
      },
      {
        name: "Other Pets",
        slug: "other-pets",
        description: "Bird cages, seed feeds, aquarium filters and fish food",
        productTypes: makeTypes([
          "Bird Supplies",
          "Fish Supplies",
          "Small Animal Supplies",
        ]),
      },
      {
        name: "Pet Accessories",
        slug: "pet-accessories",
        description: "Stainless steel bowls, pet travel carriers and grooming shampoos",
        productTypes: makeTypes([
          "Pet Bowls",
          "Pet Carriers",
          "Pet Grooming",
          "Pet Toys",
        ]),
      },
    ],
  },

  // 14. TRAVEL & LUGGAGE
  {
    name: "Travel & Luggage",
    slug: "travel-luggage",
    description: "Suitcases, duffel bags, backpacks, travel pillows and organizers",
    icon: "Package",
    image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800",
    sortOrder: 14,
    attributeGroup: "general",
    subcategories: [
      {
        name: "Suitcases & Trolleys",
        slug: "suitcases-trolleys",
        description: "Cabin trolleys, spinner suitcases and hard-shell luggage",
        productTypes: makeTypes([
          "Suitcases",
          "Hard Shell Luggage",
          "Soft Luggage",
          "Kids Luggage",
        ]),
      },
      {
        name: "Travel Bags & Backpacks",
        slug: "travel-bags-backpacks",
        description: "Weekender duffels, trekking backpacks and anti-theft laptop bags",
        productTypes: makeTypes([
          "Travel Bags",
          "Backpacks",
          "Duffel Bags",
          "Laptop Bags",
        ]),
      },
      {
        name: "Travel Accessories",
        slug: "travel-accessories",
        description: "Neck pillows, luggage tags, passport covers and packing cubes",
        productTypes: makeTypes([
          "Travel Accessories",
          "Travel Organizers",
          "Passport Holders",
          "Travel Pillows",
          "Luggage Accessories",
        ]),
      },
    ],
  },

  // 15. OFFICE & BUSINESS
  {
    name: "Office & Business",
    slug: "office-business",
    description: "Office furniture, business electronics, POS systems and packaging materials",
    icon: "Briefcase",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    sortOrder: 15,
    attributeGroup: "general",
    subcategories: [
      {
        name: "Office Furniture",
        slug: "office-furniture",
        description: "Ergonomic mesh chairs, executive desks and filing cabinets",
        productTypes: makeTypes([
          "Office Chairs",
          "Office Desks",
          "Filing Cabinets",
          "Conference Tables",
          "Reception Desks",
        ]),
      },
      {
        name: "Office Electronics",
        slug: "office-electronics",
        description: "Laser printers, document scanners, conference projectors and shredders",
        productTypes: makeTypes([
          "Printers",
          "Scanners",
          "Projectors",
          "Shredders",
          "Office Electronics",
        ]),
      },
      {
        name: "Business Equipment",
        slug: "business-equipment",
        description: "POS receipt printers, barcode readers and bubble mailers",
        productTypes: makeTypes([
          "Office Supplies",
          "Business Accessories",
          "POS Equipment",
          "Barcode Scanners",
          "Packaging Materials",
        ]),
      },
    ],
  },

  // 16. GARDEN & OUTDOOR
  {
    name: "Garden & Outdoor",
    slug: "garden-outdoor",
    description: "Gardening tools, plants, seeds, fertilizers and outdoor lighting",
    icon: "Sun",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    sortOrder: 16,
    attributeGroup: "general",
    subcategories: [
      {
        name: "Gardening Essentials",
        slug: "gardening-essentials",
        description: "Ceramic pots, pruning shears, indoor plants and organic seeds",
        productTypes: makeTypes([
          "Gardening Tools",
          "Plant Pots",
          "Seeds",
          "Plants",
          "Fertilizers",
          "Watering Equipment",
        ]),
      },
      {
        name: "Outdoor Living",
        slug: "outdoor-living",
        description: "Patio sets, solar garden lamps, lawn chairs and BBQ grills",
        productTypes: makeTypes([
          "Outdoor Furniture",
          "Outdoor Lighting",
          "Garden Accessories",
          "Barbecue & Grills",
        ]),
      },
    ],
  },

  // 17. FASHION ACCESSORIES
  {
    name: "Fashion Accessories",
    slug: "fashion-accessories",
    description: "Sunglasses, watches, wallets, belts, caps, scarves, fashion jewelry",
    icon: "Watch",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
    sortOrder: 17,
    attributeGroup: "fashion",
    subcategories: [
      {
        name: "Eyewear & Watches",
        slug: "eyewear-watches",
        description: "UV400 sunglasses, prescription frames and fashion timepieces",
        productTypes: makeTypes([
          "Sunglasses",
          "Reading Glasses",
          "Watches",
          "Smart Watch Straps",
        ]),
      },
      {
        name: "Leather & Wearable Goods",
        slug: "leather-wearable-goods",
        description: "Genuine leather belts, bifold wallets, beanies and silk scarves",
        productTypes: makeTypes([
          "Wallets",
          "Belts",
          "Caps",
          "Hats",
          "Scarves",
          "Gloves",
          "Keychains",
        ]),
      },
      {
        name: "Jewelry & Styling",
        slug: "jewelry-styling",
        description: "Statement necklaces, trendy earrings, bracelets and hair clips",
        productTypes: makeTypes([
          "Jewelry",
          "Hair Accessories",
          "Fashion Accessories",
        ]),
      },
    ],
  },

  // 18. OTHER
  {
    name: "Other",
    slug: "other",
    description: "Miscellaneous items and custom specialty products",
    icon: "Package",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800",
    sortOrder: 18,
    attributeGroup: "general",
    subcategories: [
      {
        name: "General Merchandise",
        slug: "general-merchandise",
        description: "Assorted products, novelty items and unclassified specialty goods",
        productTypes: makeTypes([
          "Miscellaneous",
          "Other Products",
        ]),
      },
    ],
  },
];

export function getAttributesForCategory(categorySlug: string): AttributeField[] {
  const cat = COMPLETE_MARKETPLACE_HIERARCHY.find((c) => c.slug === categorySlug);
  const group = cat?.attributeGroup || "general";
  return CATEGORY_ATTRIBUTES[group] || CATEGORY_ATTRIBUTES.general;
}


