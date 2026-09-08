import prisma from "../lib/db";
import { addToCart as serviceAddToCart, getOrCreateCart } from "./cartService";
import {
  ChatMessage,
  ProductCardData,
  AIResponseMetadata,
  ComparisonData,
  CartActionData,
  CartContentsData,
  OrderSummaryData,
} from "./ai/types";
import { buildFayzeeSystemPrompt } from "./ai/systemPrompt";
import { executeAIWithFallback, groqProvider } from "./ai/providers";

// Re-export all types so existing callers have full compatibility
export * from "./ai/types";

// -----------------------------------------------------------------------------
// 1. Authoritative Database Tools
// -----------------------------------------------------------------------------

/**
 * Searches products in PostgreSQL using case-insensitive contains filters,
 * category normalization, brand resolution, and price constraints.
 */
export async function toolSearchProducts(args: {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  limit?: number;
}): Promise<ProductCardData[]> {
  const where: any = { status: "ACTIVE" };

  if (args.query && args.query.trim()) {
    const q = args.query.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { brand: { name: { contains: q, mode: "insensitive" } } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  // Category normalization: fix hierarchy slugs <-> top-level marketplace categories
  if (args.category && args.category.trim()) {
    const cat = args.category.trim().toLowerCase();
    if (
      cat.includes("kitchen") ||
      cat.includes("appliance") ||
      cat.includes("home")
    ) {
      where.category = {
        OR: [
          { slug: "home-appliances" },
          { slug: "kitchen-appliances" },
          { name: { contains: "appliances", mode: "insensitive" } },
          { name: { contains: "kitchen", mode: "insensitive" } },
          { name: { contains: "home", mode: "insensitive" } },
        ],
      };
    } else if (cat.includes("phone") || cat.includes("mobile") || cat.includes("smartphone")) {
      where.category = {
        OR: [
          { slug: "electronics" },
          { slug: "smartphones-tablets" },
          { slug: { contains: "phone", mode: "insensitive" } },
          { name: { contains: "electronic", mode: "insensitive" } },
          { name: { contains: "smartphone", mode: "insensitive" } },
          { name: { contains: "phone", mode: "insensitive" } },
        ],
      };
    } else if (cat.includes("laptop") || cat.includes("computer")) {
      where.category = {
        OR: [
          { slug: "electronics" },
          { slug: "laptops-computers" },
          { name: { contains: "electronic", mode: "insensitive" } },
          { name: { contains: "laptop", mode: "insensitive" } },
          { name: { contains: "computer", mode: "insensitive" } },
        ],
      };
    } else if (cat.includes("audio") || cat.includes("headphone")) {
      where.category = {
        OR: [
          { slug: "electronics" },
          { slug: "audio-headphones" },
          { name: { contains: "electronic", mode: "insensitive" } },
          { name: { contains: "audio", mode: "insensitive" } },
          { name: { contains: "headphone", mode: "insensitive" } },
        ],
      };
    } else if (cat.includes("footwear") || cat.includes("shoe") || cat.includes("sneaker")) {
      where.category = {
        OR: [
          { slug: "mens-fashion" },
          { slug: "mens-footwear" },
          { slug: "womens-fashion" },
          { name: { contains: "fashion", mode: "insensitive" } },
          { name: { contains: "footwear", mode: "insensitive" } },
          { name: { contains: "sneakers", mode: "insensitive" } },
          { name: { contains: "shoe", mode: "insensitive" } },
        ],
      };
    } else {
      where.category = {
        OR: [
          { name: { contains: args.category, mode: "insensitive" } },
          { slug: { contains: args.category, mode: "insensitive" } },
        ],
      };
    }
  }

  if (args.brand && args.brand.trim()) {
    where.brand = {
      OR: [
        { name: { contains: args.brand.trim(), mode: "insensitive" } },
        { slug: { contains: args.brand.trim(), mode: "insensitive" } },
      ],
    };
  }

  if (args.minPrice !== undefined || args.maxPrice !== undefined) {
    where.price = {};
    if (args.minPrice !== undefined) where.price.gte = args.minPrice;
    if (args.maxPrice !== undefined) where.price.lte = args.maxPrice;
  }

  if (args.inStockOnly) {
    where.stockQuantity = { gt: 0 };
  }

  const products = await prisma.product.findMany({
    where,
    take: args.limit || 6,
    include: {
      images: {
        orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
      seller: { select: { storeName: true, rating: true } },
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.salePrice || p.price,
    originalPrice: p.salePrice ? p.price : null,
    discountPercent: p.discountPercent,
    stockQuantity: p.stockQuantity,
    inStock: p.stockQuantity > 0,
    rating: p.rating,
    reviewCount: p.reviewCount,
    category: p.category.name,
    brand: p.brand?.name,
    seller: p.seller.storeName,
    image: p.images[0]?.url,
    shortDescription: p.shortDescription,
  }));
}

/**
 * Retrieves deep specifications, variants, and gallery for a single product.
 */
export async function toolGetProduct(slugOrId: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: slugOrId },
        { slug: slugOrId },
        { title: { contains: slugOrId, mode: "insensitive" } },
      ],
    },
    include: {
      images: true,
      variants: true,
      category: true,
      brand: true,
      seller: { select: { storeName: true, rating: true, reviewCount: true } },
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: product.salePrice || product.price,
    originalPrice: product.salePrice ? product.price : null,
    discountPercent: product.discountPercent,
    stockQuantity: product.stockQuantity,
    inStock: product.stockQuantity > 0,
    rating: product.rating,
    reviewCount: product.reviewCount,
    category: product.category.name,
    brand: product.brand?.name,
    seller: product.seller.storeName,
    specifications: product.specifications ? JSON.parse(product.specifications) : {},
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.salePrice || v.price,
      stock: v.stockQuantity,
    })),
    images: product.images.map((img) => img.url),
    description: product.description,
    shortDescription: product.shortDescription,
  };
}

/**
 * Compares two or more specific products requested by the user.
 * Searches and retrieves the exact products rather than picking randomly.
 */
export async function toolCompareProducts(queriesOrIds: string[]) {
  const resolvedProducts: any[] = [];

  for (const q of queriesOrIds) {
    const trimmed = q.trim();
    if (!trimmed) continue;

    const words = trimmed.split(/\s+/).filter((w) => w.length >= 2);

    const matched = await prisma.product.findFirst({
      where: ({
        OR: [
          { id: trimmed },
          { slug: trimmed },
          { title: { contains: trimmed, mode: "insensitive" } },
          { brand: { name: { contains: trimmed, mode: "insensitive" } } },
          ...(words.length > 1
            ? [
                {
                  AND: words.map((w) => ({
                    OR: [
                      { title: { contains: w, mode: "insensitive" } },
                      { description: { contains: w, mode: "insensitive" } },
                      { shortDescription: { contains: w, mode: "insensitive" } },
                      { brand: { name: { contains: w, mode: "insensitive" } } },
                    ],
                  })),
                },
              ]
            : []),
        ],
      } as any),
      include: {
        images: {
          orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
          take: 1,
        },
        brand: true,
        category: true,
      },
    });

    if (matched && !resolvedProducts.some((p) => p.id === matched.id)) {
      resolvedProducts.push(matched);
    }
  }

  // Fallback: If less than 2 products were matched by exact terms, try splitting terms
  if (resolvedProducts.length < 2 && queriesOrIds.length >= 1) {
    const allMatches = await prisma.product.findMany({
      where: {
        OR: queriesOrIds.map((term) => ({
          title: { contains: term, mode: "insensitive" },
        })),
      },
      take: 2,
      include: {
        images: {
          orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
          take: 1,
        },
        brand: true,
        category: true,
      },
    });
    for (const p of allMatches) {
      if (!resolvedProducts.some((item) => item.id === p.id)) {
        resolvedProducts.push(p);
      }
    }
  }

  const comparisonData = resolvedProducts.map((p) => {
    let specs: Record<string, string> = {};
    try {
      specs = p.specifications ? JSON.parse(p.specifications) : {};
    } catch {
      specs = {};
    }

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.salePrice || p.price,
      originalPrice: p.salePrice ? p.price : null,
      rating: p.rating,
      stockQuantity: p.stockQuantity,
      inStock: p.stockQuantity > 0,
      brand: p.brand?.name || "Authentic",
      category: p.category.name,
      image: p.images[0]?.url,
      specs,
    };
  });

  const highlights: string[] = [];
  if (comparisonData.length >= 2) {
    const [first, second] = comparisonData;
    if (first.price < second.price) {
      highlights.push(`💰 **Price Advantage**: ${first.title} is more budget-friendly by Rs. ${(second.price - first.price).toLocaleString()}.`);
    } else if (second.price < first.price) {
      highlights.push(`💰 **Price Advantage**: ${second.title} is more affordable by Rs. ${(first.price - second.price).toLocaleString()}.`);
    }

    if (first.rating >= second.rating) {
      highlights.push(`⭐ **Customer Satisfaction**: ${first.title} holds a stellar ${first.rating}/5.0 rating.`);
    } else {
      highlights.push(`⭐ **Customer Satisfaction**: ${second.title} leads in customer reviews with a ${second.rating}/5.0 rating.`);
    }
  }

  return {
    products: comparisonData,
    highlights,
  };
}

/**
 * Adds an item to the cart for either authenticated users or anonymous sessions.
 */
export async function toolAddToCart(params: {
  userId?: string;
  sessionToken?: string;
  productIdOrSlug: string;
  quantity?: number;
}) {
  const { userId, sessionToken, productIdOrSlug, quantity = 1 } = params;

  if (!userId && !sessionToken) {
    throw new Error("User session or authentication is required to modify cart.");
  }

  // Resolve product
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: productIdOrSlug },
        { slug: productIdOrSlug },
        { title: { contains: productIdOrSlug, mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, price: true, salePrice: true, stockQuantity: true },
  });

  if (!product) {
    throw new Error(`Product "${productIdOrSlug}" could not be found in our database.`);
  }

  await serviceAddToCart({
    userId,
    sessionToken,
    productId: product.id,
    quantity,
  });

  // Calculate updated cart count & total
  const cart = await getOrCreateCart(userId, sessionToken);
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + (item.variant?.price || item.product.salePrice || item.product.price) * item.quantity,
    0
  );
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    success: true,
    productTitle: product.title,
    quantity,
    price: product.salePrice || product.price,
    cartTotal: totalAmount,
    cartItemCount: totalItems,
  };
}

/**
 * Retrieves the current cart contents for the user.
 */
export async function toolGetCart(params: {
  userId?: string;
  sessionToken?: string;
}) {
  const { userId, sessionToken } = params;
  if (!userId && !sessionToken) {
    return { items: [], totalAmount: 0, totalItems: 0 };
  }

  const cart = await getOrCreateCart(userId, sessionToken);
  const items = cart.items.map((item) => ({
    id: item.product.id,
    title: item.product.title,
    quantity: item.quantity,
    price: item.variant?.price || item.product.salePrice || item.product.price,
    image: item.product.images[0]?.url,
  }));

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, totalAmount, totalItems };
}

/**
 * Retrieves past orders strictly scoped to the authenticated user.
 */
export async function toolGetUserOrders(userId?: string) {
  if (!userId) {
    return {
      authenticated: false,
      orders: [],
      message: "Please sign in to view your orders and track delivery status.",
    };
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  return {
    authenticated: true,
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      grandTotal: o.grandTotal,
      date: o.createdAt.toLocaleDateString(),
      items: o.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
        image: i.product?.images[0]?.url,
      })),
    })),
    message: orders.length === 0 ? "You have not placed any orders yet." : undefined,
  };
}

// -----------------------------------------------------------------------------
// 2. Intelligent Grounded Intent Parsing (Context-Aware Multi-Turn Reasoning)
// -----------------------------------------------------------------------------

function extractPriceConstraint(text: string): { minPrice?: number; maxPrice?: number } {
  const lower = text.toLowerCase();
  let maxPrice: number | undefined;
  let minPrice: number | undefined;

  // e.g. "under 60,000", "under 50k", "less than 100k", "below 400000"
  const underMatch = lower.match(/(?:under|below|less than|within|max|budget)\s*(?:rs\.?|pkr)?\s*([\d,]+)\s*(k|hazar)?/i);
  if (underMatch) {
    let val = parseInt(underMatch[1].replace(/,/g, ""), 10);
    if (underMatch[2] === "k" || underMatch[2] === "hazar") val *= 1000;
    maxPrice = val;
  }

  // e.g. "50 hazar ke andar", "100k ke andar" (Roman Urdu)
  const urduUnderMatch = lower.match(/([\d,]+)\s*(?:k|hazar)?\s*(?:ke andar|se kam|tak)/i);
  if (urduUnderMatch) {
    let val = parseInt(urduUnderMatch[1].replace(/,/g, ""), 10);
    if (lower.includes("hazar") || lower.includes("k")) {
      if (val < 1000) val *= 1000;
    }
    maxPrice = val;
  }

  return { minPrice, maxPrice };
}

function resolveContextualCategory(text: string, previousContext?: string): string | undefined {
  const combined = `${previousContext || ""} ${text}`.toLowerCase();

  if (combined.includes("phone") || combined.includes("mobile") || combined.includes("galaxy") || combined.includes("iphone") || combined.includes("smartphone")) {
    return "smartphones-tablets";
  }
  if (combined.includes("laptop") || combined.includes("computer") || combined.includes("notebook") || combined.includes("dell") || combined.includes("macbook")) {
    return "laptops-computers";
  }
  if (combined.includes("headphone") || combined.includes("audio") || combined.includes("earphone") || combined.includes("sony") || combined.includes("sound")) {
    return "audio-headphones";
  }
  if (combined.includes("sneaker") || combined.includes("shoe") || combined.includes("nike") || combined.includes("jordan") || combined.includes("footwear")) {
    return "mens-footwear";
  }
  if (combined.includes("fryer") || combined.includes("kitchen") || combined.includes("appliance") || combined.includes("airfryer") || combined.includes("philips")) {
    return "home-appliances";
  }
  return undefined;
}

// Helper functions for intent resolution
function extractCategoryFromIntent(text: string): string | undefined {
  return resolveContextualCategory(text);
}
function extractBrandFromIntent(text: string): string | undefined {
  const brands = ["samsung", "apple", "sony", "dell", "nike", "philips"];
  return brands.find(b => text.toLowerCase().includes(b));
}
function extractPriceCeiling(text: string): number | undefined {
  return extractPriceConstraint(text).maxPrice;
}
function extractPriceFloor(text: string): number | undefined {
  return extractPriceConstraint(text).minPrice;
}

/**
 * Classifies whether a user's message is seeking products/shopping assistance
 * versus general conversational queries (greetings, math, platform info, small talk).
 */
export function isProductSeekingQuery(query: string, hasProductsInContext: boolean = false): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;

  // 1. Definite general/non-product signals (math, company info, pure greetings, identity)
  const isPureMath =
    /^(?:what\s+is\s+|calculate\s+|solve\s+)?[\d\s\+\-\*\/\(\)\^\.\%]{2,}(?:\s*\?)?$/i.test(q) ||
    /(?:what\s+is\s+)?\d+\s*[\+\-\*\/]\s*\d+/i.test(q);
  const isCompanyQuestion =
    /^(?:what|who|tell\s+me\s+about)\s+is\s+(?:fayzee|this\s+website|this\s+store|this\s+app)/i.test(q) ||
    /^(?:how\s+does\s+fayzee\s+work|what\s+does\s+fayzee\s+sell)/i.test(q);
  const isPureGreeting =
    /^(?:hello|hi|hey|salam|assalam\s*o\s*alaikum|good\s+(?:morning|afternoon|evening)|hola|namaste)(?:[!\.\s]+)?$/i.test(q);
  const isSelfIntro = /^(?:my\s+name\s+is|i\s+am|i'm)\s+[a-z\s]+$/i.test(q);
  const isBotMeta =
    /^(?:who\s+are\s+you|what\s+is\s+your\s+name|what\s+can\s+you\s+do|how\s+can\s+you\s+help\s+me|help\s*me|help)(?:\s*\?)?$/i.test(q);

  if (isPureMath || isCompanyQuestion || isPureGreeting || isSelfIntro || isBotMeta) {
    // If it also contains specific product nouns like "phone", "laptop", "samsung", "shoes", then it's product seeking
    const hasExplicitProductNoun = /\b(?:phone|mobile|smartphone|laptop|computer|headphone|earphone|shoe|shoes|sneaker|sneakers|appliance|airfryer|watch|samsung|apple|iphone|nike|sony|philips|dell)\b/i.test(q);
    if (!hasExplicitProductNoun) {
      return false;
    }
  }

  // 2. Product Categories & Nouns
  const productNouns = [
    "phone", "mobile", "smartphone", "iphone", "android",
    "laptop", "notebook", "computer", "pc", "macbook",
    "headphone", "earphone", "airpods", "earbuds", "audio", "speaker",
    "sneaker", "sneakers", "shoe", "shoes", "footwear", "boots", "sandals",
    "appliance", "appliances", "airfryer", "fryer", "oven", "microwave", "blender", "juicer",
    "tv", "television", "camera", "tablet", "ipad", "smartwatch", "watch",
    "shirt", "t-shirt", "jeans", "pants", "dress", "jacket", "hoodie", "clothes", "clothing",
    "product", "products", "item", "items", "merchandise", "goods"
  ];
  const hasProductNoun = productNouns.some((n) => new RegExp(`\\b${n}s?\\b`, "i").test(q));

  // 3. Known Brands
  const knownBrands = [
    "samsung", "apple", "sony", "dell", "hp", "lenovo", "nike", "adidas",
    "philips", "dawlance", "haier", "infinix", "tecno", "xiaomi", "redmi",
    "realme", "oppo", "vivo", "asus", "acer"
  ];
  const hasBrand = knownBrands.some((b) => new RegExp(`\\b${b}\\b`, "i").test(q));

  // 4. Shopping & Commercial Intent verbs/phrases
  const shoppingVerbs = [
    "buy", "purchase", "price", "cost", "how much", "rate", "discount", "discounts",
    "sale", "deal", "deals", "offer", "offers", "cheap", "expensive", "budget",
    "under", "below", "rs", "pkr", "in stock", "out of stock", "available",
    "recommend", "recommendation", "recommendations", "show me", "find me",
    "looking for", "search for", "browse", "catalog", "inventory",
    "compare", "spec", "specs", "specification", "specifications", "features",
    "add to cart"
  ];
  const hasShoppingVerb = shoppingVerbs.some((v) => q.includes(v));

  // 5. Roman Urdu Shopping Intent
  const urduShoppingTerms = [
    "chahiye", "dikhao", "sasta", "sasti", "mehenga", "mehengi", "kitne ka",
    "kitne ki", "qemat", "rate kya", "kuch acha", "kuch achi", "kharidna",
    "lena hai", "le loon", "pasand", "wala", "wali"
  ];
  const hasUrduShopping = urduShoppingTerms.some((u) => q.includes(u));

  // 6. Follow-up context when products were previously shown
  if (hasProductsInContext) {
    const followUpPatterns = [
      "which one", "first one", "second one", "third one",
      "tell me more about", "what about", "is it good", "how is the",
      "does it have", "better", "best of these", "compare them", "battery", "camera"
    ];
    if (followUpPatterns.some((f) => q.includes(f))) {
      return true;
    }
  }

  return hasProductNoun || hasBrand || hasShoppingVerb || hasUrduShopping;
}

// -----------------------------------------------------------------------------
// 3. Main Multi-Turn Handler with Groq (Primary), Gemini, and Grounded Engine
// -----------------------------------------------------------------------------

export async function handleFayzeeAIChat(params: {
  messages: ChatMessage[];
  userId?: string;
  sessionToken?: string;
}): Promise<{
  role: "assistant";
  content: string;
  message: string;
  metadata: AIResponseMetadata;
}> {
  const { messages = [], userId, sessionToken } = params;

  if (!messages || messages.length === 0) {
    const welcome = "Hello! Welcome to Fayzee. How can I help you find what you need today?";
    return {
      role: "assistant",
      content: welcome,
      message: welcome,
      metadata: {},
    };
  }

  const userQuery = messages[messages.length - 1]?.content || "";
  const lowerQuery = userQuery.toLowerCase().trim();

  // Combine past conversation history to form context
  const previousAssistantMessages = messages.filter((m) => m.role === "assistant");
  const previousUserMessages = messages.filter((m) => m.role === "user");
  const lastAssistantMessage = previousAssistantMessages[previousAssistantMessages.length - 1];
  const lastProductsInContext: ProductCardData[] = lastAssistantMessage?.metadata?.products || [];

  const metadata: AIResponseMetadata = {};

  // ---------------------------------------------------------------------------
  // A. Deterministic High-Precision Tool Dispatching
  // ---------------------------------------------------------------------------

  // 1. Order Tracking Intent
  if (
    lowerQuery.includes("my order") ||
    lowerQuery.includes("where is my order") ||
    lowerQuery.includes("track order") ||
    lowerQuery.includes("order status") ||
    lowerQuery.includes("recent order") ||
    lowerQuery.includes("mera order") ||
    lowerQuery.includes("order kahan hai")
  ) {
    const orderResult = await toolGetUserOrders(userId);
    if (!orderResult.authenticated) {
      const authMsg = "To check your live order tracking, delivery updates, and past purchases, please [sign in to your Fayzee account](/login).";
      return {
        role: "assistant",
        content: authMsg,
        message: authMsg,
        metadata,
      };
    }

    if (orderResult.orders.length === 0) {
      const emptyOrdersMsg = "You haven't placed any orders yet on Fayzee. Let me know what products you're looking for, and I'll find our best authentic deals for you!";
      return {
        role: "assistant",
        content: emptyOrdersMsg,
        message: emptyOrdersMsg,
        metadata,
      };
    }

    const latest = orderResult.orders[0];
    metadata.orders = orderResult.orders;
    const ordersMsg =
      `Here is your recent order **#${latest.orderNumber}** placed on ${latest.date}:\n\n` +
      `• **Status**: ${latest.status}\n` +
      `• **Payment**: ${latest.paymentStatus}\n` +
      `• **Total**: Rs. ${Math.round(latest.grandTotal).toLocaleString()}\n\n` +
      `You can view complete item details and invoice in the order card below.`;

    return {
      role: "assistant",
      content: ordersMsg,
      message: ordersMsg,
      metadata,
    };
  }

  // 2. Cart Content Query Intent ("show my cart", "what is in my cart", "cart dikhao")
  if (
    lowerQuery.includes("show my cart") ||
    lowerQuery.includes("view cart") ||
    lowerQuery.includes("what is in my cart") ||
    lowerQuery.includes("open cart") ||
    lowerQuery.includes("cart dikhao") ||
    lowerQuery === "cart"
  ) {
    const cart = await toolGetCart({ userId, sessionToken });
    metadata.cartContents = cart;

    if (cart.items.length === 0) {
      const emptyCartMsg = "Your cart is currently empty. Tell me what items you'd like to explore, and I can help you add them!";
      return {
        role: "assistant",
        content: emptyCartMsg,
        message: emptyCartMsg,
        metadata,
      };
    }

    const itemsSummary = cart.items
      .map((i) => `• **${i.title}** (Qty: ${i.quantity}) - Rs. ${(i.price * i.quantity).toLocaleString()}`)
      .join("\n");

    const cartMsg =
      `Here is what's currently in your Fayzee cart (${cart.totalItems} item${cart.totalItems > 1 ? "s" : ""}):\n\n${itemsSummary}\n\n` +
      `**Cart Total**: Rs. ${Math.round(cart.totalAmount).toLocaleString()}.\n\n` +
      `You can [proceed to checkout](/checkout) or ask me to add more items.`;

    return {
      role: "assistant",
      content: cartMsg,
      message: cartMsg,
      metadata,
    };
  }

  // 3. Cart Addition Intent ("add to cart", "add the first one", "cart mein add karo")
  if (
    lowerQuery.startsWith("add to cart") ||
    lowerQuery.includes("add this to cart") ||
    lowerQuery.includes("add this to my cart") ||
    lowerQuery.includes("add the first one") ||
    lowerQuery.includes("add the second one") ||
    lowerQuery.includes("cart mein daal do") ||
    lowerQuery.includes("cart mein add karo") ||
    lowerQuery.includes("buy this")
  ) {
    let targetProduct: ProductCardData | undefined;

    // Follow-up context: look at products previously presented
    if (lowerQuery.includes("first") && lastProductsInContext[0]) {
      targetProduct = lastProductsInContext[0];
    } else if (lowerQuery.includes("second") && lastProductsInContext[1]) {
      targetProduct = lastProductsInContext[1];
    } else if (lastProductsInContext.length > 0) {
      // Find matching item in context by name
      targetProduct = lastProductsInContext.find((p) =>
        lowerQuery.includes(p.title.toLowerCase()) ||
        (p.brand && lowerQuery.includes(p.brand.toLowerCase()))
      );
    }

    if (targetProduct) {
      try {
        const cartAction = await toolAddToCart({
          sessionToken,
          userId,
          productIdOrSlug: targetProduct.id,
          quantity: 1,
        });
        metadata.cartAction = cartAction;
        const addSuccessMsg =
          `✅ Successfully added **${targetProduct.title}** to your cart!\n\n` +
          `Your cart total is now **Rs. ${Math.round(cartAction.cartTotal || targetProduct.price).toLocaleString()}** (${cartAction.cartItemCount} item${(cartAction.cartItemCount || 1) > 1 ? "s" : ""}). You can [view your cart](/cart) or [proceed to checkout](/checkout) whenever you're ready!`;

        return {
          role: "assistant",
          content: addSuccessMsg,
          message: addSuccessMsg,
          metadata,
        };
      } catch (err: any) {
        const addErrMsg = `I could not add **${targetProduct.title}** to your cart: ${err.message}`;
        return {
          role: "assistant",
          content: addErrMsg,
          message: addErrMsg,
          metadata,
        };
      }
    } else {
      const askProductMsg = "Which product would you like me to add to your cart? Please specify the product name or tell me which one from our recommendations you prefer.";
      return {
        role: "assistant",
        content: askProductMsg,
        message: askProductMsg,
        metadata,
      };
    }
  }

  // 4. Product Comparison Intent ("compare", "versus", "vs", "dono mein se")
  if (
    lowerQuery.includes("compare") ||
    lowerQuery.includes("versus") ||
    lowerQuery.includes(" vs ") ||
    lowerQuery.includes("dono mein se")
  ) {
    // Extract candidate names from query
    let candidateTerms: string[] = [];

    // Split on 'vs', 'versus', 'and', 'with'
    const match = userQuery.match(/compare\s+(.+?)(?:\s+(?:vs\.?|versus|and|with)\s+)(.+)/i);
    if (match) {
      candidateTerms = [match[1].trim(), match[2].trim()];
    } else {
      // Check if comparing products discussed in previous messages
      if (lastProductsInContext.length >= 2) {
        candidateTerms = [lastProductsInContext[0].title, lastProductsInContext[1].title];
      } else {
        const words = userQuery.replace(/compare|versus|vs|please/gi, "").trim().split(/\s+and\s+|\s+with\s+/i);
        candidateTerms = words.filter((w) => w.length > 2);
      }
    }

    if (candidateTerms.length >= 2) {
      const comparisonResult = await toolCompareProducts(candidateTerms);

      if (comparisonResult.products.length >= 2) {
        metadata.comparison = comparisonResult;
        const [prodA, prodB] = comparisonResult.products;

        const highlightsText = comparisonResult.highlights.length > 0
          ? "\n\n" + comparisonResult.highlights.join("\n")
          : "";

        const compMsg =
          `Here is a side-by-side comparison between **${prodA.title}** and **${prodB.title}** from our verified catalog:${highlightsText}\n\n` +
          `Review the detailed specification matrix below, and let me know if you would like me to add either one to your cart!`;

        return {
          role: "assistant",
          content: compMsg,
          message: compMsg,
          metadata,
        };
      }
    }
  }

  // ---------------------------------------------------------------------------
  // B. Product Search, Filtering, Recommendations & Follow-Up Questions
  // ---------------------------------------------------------------------------

  const isProductSeeking = isProductSeekingQuery(userQuery, lastProductsInContext.length > 0);
  let foundProducts: ProductCardData[] = [];

  if (isProductSeeking) {
    const previousUserQueries = previousUserMessages.map((m) => m.content).join(" ");
    const combinedContextText = `${previousUserQueries} ${userQuery}`;

    // Extract category, brand, and constraints from conversation history
    const detectedCategory = extractCategoryFromIntent(userQuery) || extractCategoryFromIntent(combinedContextText);
    const detectedBrand = extractBrandFromIntent(userQuery) || extractBrandFromIntent(combinedContextText);
    const maxPrice = extractPriceCeiling(userQuery) ?? extractPriceCeiling(combinedContextText);
    const minPrice = extractPriceFloor(userQuery) ?? extractPriceFloor(combinedContextText);

    // Clean raw keywords for specific search
    let cleanedSearchQuery = userQuery
      .replace(/fayzee|show me|find me|recommend|can you|please|i need|i want|mujhe|chahiye|dikhao|acha|ache|achi|best|top|cheap|sasta|mehenga|kuch|high[- ]end|flagship|premium|budget|latest|new/gi, "")
      .replace(/(?:under|below|less than|within|max|budget)\s*(?:rs\.?|pkr)?\s*[\d,]+(?:\s*(?:k|hazar))?/gi, "")
      .replace(/[\d,]+\s*(?:k|hazar)?\s*(?:ke andar|se kam|tak)/gi, "")
      .replace(/\b(?:a|an|the)\b/gi, "")
      .trim();

    // If brand was detected and already passed to brand filter, remove it from raw query
    if (detectedBrand) {
      cleanedSearchQuery = cleanedSearchQuery.replace(new RegExp(`\\b${detectedBrand}\\b`, "gi"), "").trim();
    }

    // If a category was detected and the remaining query is merely a generic noun
    if (detectedCategory) {
      const isGenericNoun = /^(?:a\s+|an\s+|the\s+)?(?:phone|phones|mobile|mobiles|smartphone|smartphones|laptop|laptops|computer|computers|headphone|headphones|earphone|earphones|shoes|shoe|sneakers|sneaker|footwear|appliances|appliance|airfryer|fryer)?$/i.test(cleanedSearchQuery);
      if (isGenericNoun) {
        cleanedSearchQuery = "";
      }
    }

    // Execute database search
    foundProducts = await toolSearchProducts({
      query: cleanedSearchQuery || undefined,
      category: detectedCategory,
      brand: detectedBrand,
      minPrice,
      maxPrice,
      inStockOnly: true,
    });

    // Resilient Fallback: If query had extra keywords and found 0 products, retry with just brand/category & price
    if (foundProducts.length === 0 && cleanedSearchQuery && (detectedBrand || detectedCategory)) {
      foundProducts = await toolSearchProducts({
        category: detectedCategory,
        brand: detectedBrand,
        minPrice,
        maxPrice,
        inStockOnly: true,
      });
    }

    // Multi-product query handling (e.g., "Samsung Galaxy S24 Ultra and Sony WH-1000XM5")
    if (userQuery.includes(" and ") || userQuery.includes(",")) {
      const parts = userQuery
        .replace(/show me|find me|recommend|please|i need|i want/gi, "")
        .split(/\s+and\s+|\s*,\s*/i)
        .map((p) => p.trim())
        .filter((p) => p.length >= 3);

      if (parts.length >= 2) {
        const multiResults: ProductCardData[] = [...foundProducts];
        for (const part of parts) {
          const partResults = await toolSearchProducts({
            query: part,
            inStockOnly: true,
            limit: 2,
          });
          for (const item of partResults) {
            if (!multiResults.some((p) => p.id === item.id)) {
              multiResults.push(item);
            }
          }
        }
        if (multiResults.length > foundProducts.length) {
          foundProducts = multiResults;
        }
      }
    }

    metadata.products = foundProducts;
  } else {
    // General conversational query (greetings, math, platform questions): no database search required
    metadata.products = [];
  }

  // ---------------------------------------------------------------------------
  // C. Generative AI Synthesis (Groq Primary with Multi-Provider Fallback)
  // ---------------------------------------------------------------------------
  const systemPrompt = buildFayzeeSystemPrompt({
    inventory: foundProducts,
    isGeneralQuery: !isProductSeeking,
    userContext: {
      isAuthenticated: Boolean(userId),
    },
  });

  const aiResult = await executeAIWithFallback(messages, systemPrompt);

  if (aiResult && aiResult.text) {
    metadata.providerUsed = aiResult.providerUsed;
    return {
      role: "assistant",
      content: aiResult.text,
      message: aiResult.text,
      metadata,
    };
  }

  // ---------------------------------------------------------------------------
  // D. Grounded Catalog Reasoning Engine (Fallback / Offline / No API Key)
  // ---------------------------------------------------------------------------

  // D1. General non-product queries (Math, greetings, what is Fayzee)
  if (!isProductSeeking) {
    // Check for math expressions (e.g. 25 + 37)
    const mathMatch = userQuery.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/);
    if (mathMatch) {
      const a = parseFloat(mathMatch[1]);
      const op = mathMatch[2];
      const b = parseFloat(mathMatch[3]);
      let calcRes: number | string = 0;
      if (op === "+") calcRes = a + b;
      else if (op === "-") calcRes = a - b;
      else if (op === "*") calcRes = a * b;
      else if (op === "/") calcRes = b !== 0 ? Math.round((a / b) * 100) / 100 : "undefined";

      const nameMatch = userQuery.match(/(?:my name is|i am|i'm)\s+([a-zA-Z]+)/i);
      const nameGreeting = nameMatch ? `Hello ${nameMatch[1]}! ` : "";
      const mathText = `${nameGreeting}${a} ${op} ${b} = ${calcRes}. I'm your Fayzee AI assistant—how can I help you with shopping on Fayzee today?`;

      return {
        role: "assistant",
        content: mathText,
        message: mathText,
        metadata,
      };
    }

    // Name introduction
    const nameMatch = userQuery.match(/(?:my name is|i am|i'm)\s+([a-zA-Z]+)/i);
    if (nameMatch) {
      const introText = `Hello ${nameMatch[1]}! Welcome to Fayzee. How can I help you find what you need today? You can ask me for product recommendations, compare items, or check your orders.`;
      return {
        role: "assistant",
        content: introText,
        message: introText,
        metadata,
      };
    }

    // Question about Fayzee platform ("What is Fayzee?")
    if (lowerQuery.includes("fayzee") || lowerQuery.includes("website") || lowerQuery.includes("store")) {
      const fayzeeInfo = `Fayzee (fayzee.store) is Pakistan's premier online marketplace offering authentic electronics, fashion, home appliances, and more with fast nationwide delivery and verified seller guarantees.`;
      return {
        role: "assistant",
        content: fayzeeInfo,
        message: fayzeeInfo,
        metadata,
      };
    }

    // Default friendly conversational response
    const generalText = `Hello! I am Fayzee AI Assistant, your personal shopping companion. How can I help you today? You can ask me to find products within your budget, compare specs, or check your orders.`;
    return {
      role: "assistant",
      content: generalText,
      message: generalText,
      metadata,
    };
  }

  // D2. Product queries with matching items found in database
  if (foundProducts.length > 0) {
    let responseText = "";
    const maxPrice = extractPriceCeiling(userQuery);

    if (lowerQuery.includes("camera") || lowerQuery.includes("best camera")) {
      const topCamera =
        foundProducts.find((p) => p.title.toLowerCase().includes("s24") || p.title.toLowerCase().includes("iphone")) ||
        foundProducts[0];
      responseText = `Among these options, the **${topCamera.title}** delivers the superior camera performance with advanced optical zoom, AI image stabilization, and pro-grade sensor fidelity.`;
    } else if (lowerQuery.includes("gaming") || lowerQuery.includes("pubg") || lowerQuery.includes("fast")) {
      const topPerformance =
        foundProducts.find((p) => p.title.toLowerCase().includes("s24") || p.title.toLowerCase().includes("ultra")) ||
        foundProducts[0];
      responseText = `For intensive gaming and high-FPS titles, I recommend the **${topPerformance.title}** featuring high refresh rate display and flagship processing power with zero stutter.`;
    } else if (maxPrice) {
      responseText = `Here are our verified products matching your budget of **under Rs. ${maxPrice.toLocaleString()}**:`;
    } else {
      responseText = `I found **${foundProducts.length} authentic product${foundProducts.length > 1 ? "s" : ""}** in our database matching your request:`;
    }

    return {
      role: "assistant",
      content: responseText,
      message: responseText,
      metadata,
    };
  }

  // D3. Product query but zero products matched in database
  const maxPrice = extractPriceCeiling(userQuery);
  let fallbackMessage = `I searched our inventory, but currently we don't have products matching "${userQuery}" in stock.`;
  if (maxPrice) {
    fallbackMessage += ` You might consider increasing your budget threshold or exploring related categories like Smartphones, Laptops, Audio, or Footwear.`;
  } else {
    fallbackMessage += ` Please check back soon as our catalog is updated daily, or ask me to show our top categories like Electronics, Fashion, or Home Appliances!`;
  }

  return {
    role: "assistant",
    content: fallbackMessage,
    message: fallbackMessage,
    metadata,
  };
}
