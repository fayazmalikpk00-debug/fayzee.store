export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id?: string;
  role: MessageRole;
  content: string;
  metadata?: AIResponseMetadata;
  createdAt?: string | Date;
}

export interface ProductCardData {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  stockQuantity: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  category: string;
  brand?: string | null;
  seller: string;
  image?: string;
  shortDescription?: string | null;
}

export interface ComparisonData {
  products: any[];
  highlights: string[];
  specsMatrix?: Record<string, Record<string, string>>;
}

export interface CartActionData {
  success: boolean;
  productTitle: string;
  quantity: number;
  price?: number;
  cartTotal?: number;
  cartItemCount?: number;
  error?: string;
}

export interface CartContentsData {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
  totalItems: number;
}

export interface OrderItemData {
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderSummaryData {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  date: string;
  items: OrderItemData[];
}

export interface AIResponseMetadata {
  products?: ProductCardData[];
  comparison?: ComparisonData;
  cartAction?: CartActionData;
  cartContents?: CartContentsData;
  orders?: OrderSummaryData[];
  configNotice?: string;
  providerUsed?: string;
}

export interface AIProviderOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface AIProvider {
  readonly name: string;
  isAvailable(): boolean;
  generateResponse(
    messages: ChatMessage[],
    systemPrompt: string,
    options?: AIProviderOptions
  ): Promise<string>;
}

export interface ChatRequestPayload {
  message?: string;
  messages?: ChatMessage[];
  conversation?: ChatMessage[];
  sessionToken?: string;
  userId?: string;
}

export interface ChatResponsePayload {
  success: boolean;
  message: string;
  role: "assistant";
  content: string;
  metadata?: AIResponseMetadata;
  conversationId?: string;
  error?: string;
}
