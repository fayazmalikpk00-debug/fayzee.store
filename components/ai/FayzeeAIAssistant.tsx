"use client";

import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

interface ProductCardData {
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    products?: ProductCardData[];
    comparison?: {
      products: any[];
      highlights: string[];
    };
    cartAction?: {
      success: boolean;
      productTitle: string;
      quantity: number;
      price?: number;
      cartTotal?: number;
      cartItemCount?: number;
    };
    cartContents?: {
      items: Array<{
        id: string;
        title: string;
        quantity: number;
        price: number;
        image?: string;
      }>;
      totalAmount: number;
      totalItems: number;
    };
    orders?: any[];
    configNotice?: string;
  };
  createdAt?: string | Date;
}

// -----------------------------------------------------------------------------
// Lightweight Zero-Dependency Markdown Formatter
// -----------------------------------------------------------------------------
function MarkdownContent({ text }: { text: string }) {
  // Process lines for bullet points, headers, bold, italics, links, and code
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-xs leading-relaxed break-words">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line spacer
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Bullet point
        if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.replace(/^[•\-\*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-brand-500 font-black mt-0.5">•</span>
              <span className="flex-1">{formatInlineMarkdown(content)}</span>
            </div>
          );
        }

        // Regular line
        return <p key={idx}>{formatInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function formatInlineMarkdown(str: string): React.ReactNode[] {
  // Regex to detect **bold**, *italic*, `code`, and [link](url)
  const tokens = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);

  return tokens.map((tok, i) => {
    if (tok.startsWith("**") && tok.endsWith("**") && tok.length >= 4) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    if (tok.startsWith("*") && tok.endsWith("*") && tok.length >= 2) {
      return <em key={i} className="italic">{tok.slice(1, -1)}</em>;
    }
    if (tok.startsWith("`") && tok.endsWith("`") && tok.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 bg-slate-100 text-brand-700 font-mono text-[11px] rounded"
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = tok.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <Link
          key={i}
          href={linkMatch[2]}
          className="text-[#FF5E00] underline hover:text-[#FF8C00] font-medium inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
        </Link>
      );
    }
    return tok;
  });
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------
export function FayzeeAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { addToCart } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasEverFocusedInputRef = useRef(false);

  // Helper to safely focus the input without scroll jumps
  const focusInput = () => {
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }
      });
    }
  };

  const defaultWelcomeMessage: Message = {
    id: "welcome",
    role: "assistant",
    content:
      "👋 Welcome to Fayzee! I'm **Fayzee AI**, your intelligent shopping co-pilot.\n\n" +
      "Ask me anything:\n" +
      "• Compare phones or laptops side-by-side\n" +
      "• Find best products within your budget\n" +
      "• Ask in English or Roman Urdu (*'50 hazar ke andar acha phone'*)\n" +
      "• Add items directly to your cart or track your orders!",
  };

  const [messages, setMessages] = useState<Message[]>([defaultWelcomeMessage]);

  // Auto focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        focusInput();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      hasEverFocusedInputRef.current = false;
    }
  }, [isOpen]);

  // Auto focus input whenever AI finishes responding (loading becomes false)
  useEffect(() => {
    if (!loading && isOpen) {
      const timer = setTimeout(() => {
        focusInput();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading, isOpen]);

  // Load conversation history on initial open
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        setHistoryLoading(true);
        const res = await fetch("/api/ai/history");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.warn("Could not load AI history:", err);
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    }

    if (isOpen) {
      loadHistory();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  // Send query
  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    hasEverFocusedInputRef.current = true;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput("");
    setLoading(true);

    // Keep input immediately focused after user sends
    focusInput();

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation: chatHistory,
        }),
      });

      const data = await res.json();
      const assistantText =
        data.message ||
        data.content ||
        (data.error ? `Notice: ${data.error}` : "Sorry, I could not process your request.");

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: assistantText,
          metadata: data.metadata,
          createdAt: new Date(),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I ran into a network issue reaching the Fayzee servers. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
      // Automatically refocus input right when reply arrives
      setTimeout(() => {
        focusInput();
      }, 50);
    }
  };

  // Clear chat history
  const handleClearChat = async () => {
    try {
      await fetch("/api/ai/history", { method: "DELETE" });
    } catch (e) {
      console.warn("Could not clear AI history:", e);
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: "Chat cleared. What authentic products are you looking for today?",
      },
    ]);
    focusInput();
  };

  // Quick Add to Cart from rich product card
  const handleQuickAdd = async (product: ProductCardData) => {
    try {
      setAddingCartId(product.id);
      await addToCart(product.id, undefined, 1);
      setAddedIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product.id]: false }));
      }, 3000);
    } catch (err) {
      console.error("Failed to add product to cart:", err);
    } finally {
      setAddingCartId(null);
    }
  };

  // Copy response text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Regenerate last response
  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      // Remove last assistant response if present
      setMessages((prev) => {
        const lastIdx = prev.length - 1;
        if (prev[lastIdx]?.role === "assistant") {
          return prev.slice(0, lastIdx);
        }
        return prev;
      });
      handleSend(lastUser.content);
      focusInput();
    }
  };

  const quickPrompts = [
    "📱 Search latest smartphones",
    "💻 Laptops and computing deals",
    "🎧 Best noise-canceling headphones",
    "🍳 Kitchen and home appliances",
    "👟 Men's and women's footwear",
    "📦 Where is my order?",
    "🛒 Show my cart",
  ];

  return (
    <>
      {/* Floating Entry Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-[#FF5E00] hover:bg-[#FF8C00] text-white font-bold text-xs sm:text-sm shadow-floating hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-md group"
        aria-label="Open Fayzee AI Shopping Assistant"
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 shrink-0 group-hover:rotate-12 transition-transform" />
        <span className="font-extrabold tracking-tight">Fayzee AI</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
      </button>

      {/* Slide-in Chat Window */}
      {isOpen && (
        <div className="fixed bottom-16 sm:bottom-24 left-2 right-2 sm:left-auto sm:right-6 sm:w-[420px] max-w-full sm:max-w-[420px] h-[calc(100dvh-95px)] sm:h-[620px] max-h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#DDE2E6] z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-[#1C2A39] p-3.5 sm:p-4 text-white flex items-center justify-between shadow-md shrink-0 border-b border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FF5E00] flex items-center justify-center shadow-inner shrink-0 ring-2 ring-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white tracking-tight truncate">
                    Fayzee AI Co-Pilot
                  </h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 shrink-0">
                    Live
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                  Grounded in authentic marketplace inventory
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                aria-label="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-[#F7F9FA]"
          >
            {historyLoading && (
              <div className="flex justify-center py-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-white/80 px-3 py-1.5 rounded-full border border-[#DDE2E6]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5E00]" />
                  <span>Loading conversation history...</span>
                </div>
              </div>
            )}

            {messages.map((m, index) => {
              const isUser = m.role === "user";
              const isLastAssistant = !isUser && index === messages.length - 1;

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  {/* Bubble */}
                  <div
                    className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs relative group ${
                      isUser
                        ? "bg-orange-50 border border-orange-200 text-[#333333] rounded-tr-xs"
                        : "bg-white text-[#333333] border border-[#DDE2E6] rounded-tl-xs"
                    }`}
                  >
                    <MarkdownContent text={m.content} />

                    {/* Copy & Regenerate Actions */}
                    {!isUser && (
                      <div className="flex items-center justify-end gap-1 mt-1 pt-1 border-t border-slate-100/80 text-[10px] text-slate-400">
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="hover:text-[#FF5E00] flex items-center gap-1 transition px-1 py-0.5 rounded"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {isLastAssistant && (
                          <button
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="hover:text-[#FF5E00] flex items-center gap-1 transition px-1 py-0.5 rounded ml-1"
                            title="Regenerate response"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Configuration notice banner if API key is not configured */}
                  {m.metadata?.configNotice && (
                    <div className="mt-1.5 w-full max-w-[88%] sm:max-w-[85%] p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                      <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900">Gemini Setup Notice</p>
                        <p className="text-[10px] text-amber-700 leading-tight">
                          Set <code className="bg-amber-100 px-1 rounded font-mono">GEMINI_API_KEY</code> in <code className="bg-amber-100 px-1 rounded font-mono">.env</code> to activate full generative LLM capability.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rich Metadata: Product Cards */}
                  {m.metadata?.products && m.metadata.products.length > 0 && (
                    <div className="mt-2.5 w-full space-y-2">
                      <div className="flex items-center justify-between px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        <span>Authentic Database Matches ({m.metadata.products.length})</span>
                        <span className="text-[#FF5E00] font-bold">100% Genuine</span>
                      </div>

                      <div className="space-y-2">
                        {m.metadata.products.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-2.5 bg-white rounded-xl border border-slate-200/90 hover:border-brand-400 hover:shadow-sm transition-all flex gap-3 group"
                          >
                            {/* Image */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 relative border border-slate-100">
                              <img
                                src={prod.image || "/images/product-placeholder.svg"}
                                alt={prod.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <Link
                                  href={`/products/${prod.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="text-xs font-bold text-[#1C2A39] hover:text-[#FF5E00] line-clamp-1 block leading-snug"
                                >
                                  {prod.title}
                                </Link>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                  <span>Seller: <strong className="text-slate-700">{prod.seller}</strong></span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {prod.rating.toFixed(1)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xs font-black text-[#FF5E00]">
                                    {formatPrice(prod.price)}
                                  </span>
                                  {prod.originalPrice && (
                                    <span className="text-[10px] text-[#777777] line-through">
                                      {formatPrice(prod.originalPrice)}
                                    </span>
                                  )}
                                  {prod.discountPercent && (
                                    <span className="text-[9px] font-bold text-[#FF5E00] bg-orange-50 px-1 rounded">
                                      -{prod.discountPercent}%
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Link
                                    href={`/products/${prod.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    className="px-2 py-1 text-[10px] font-bold text-[#333333] hover:text-[#FF5E00] rounded hover:bg-slate-50 transition"
                                  >
                                    View
                                  </Link>

                                  <button
                                    onClick={() => handleQuickAdd(prod)}
                                    disabled={addingCartId === prod.id}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 min-h-[28px] ${
                                      addedIds[prod.id]
                                        ? "bg-emerald-600 text-white"
                                        : "bg-[#FF5E00] hover:bg-[#FF8C00] text-white shadow-xs"
                                    }`}
                                    aria-label="Add product to cart"
                                  >
                                    {addingCartId === prod.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : addedIds[prod.id] ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Added</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingBag className="w-3 h-3" />
                                        <span>Add</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rich Metadata: Comparison Card */}
                  {m.metadata?.comparison && m.metadata.comparison.products.length >= 2 && (
                    <div className="mt-2.5 w-full bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-2.5">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="font-extrabold text-xs text-[#1C2A39] flex items-center gap-1.5">
                          <span>⚖️ Side-by-Side Comparison</span>
                        </span>
                        <span className="text-[10px] font-semibold text-[#FF5E00]">
                          {m.metadata.comparison.products.length} Products
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {m.metadata.comparison.products.map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between"
                          >
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1">{p.title}</p>
                              <p className="text-xs font-black text-[#FF5E00] mt-1">{formatPrice(p.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rich Metadata: Cart Action Toast */}
                  {m.metadata?.cartAction && (
                    <div className="mt-2 w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-900">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-emerald-900 truncate">
                            {m.metadata.cartAction.productTitle}
                          </p>
                          <p className="text-[10px] text-emerald-700">
                            Added to your cart • Total: Rs. {m.metadata.cartAction.cartTotal?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/cart"
                        onClick={() => setIsOpen(false)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold rounded-lg shrink-0 transition"
                      >
                        View Cart →
                      </Link>
                    </div>
                  )}

                  {/* Rich Metadata: Cart Contents Snapshot */}
                  {m.metadata?.cartContents && (
                    <div className="mt-2.5 w-full bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold pb-2 border-b border-slate-100">
                        <span className="text-[#1C2A39] flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-[#FF5E00]" />
                          <span>Cart Updated ({m.metadata.cartContents.totalItems} items)</span>
                        </span>
                        <span className="text-[#FF5E00]">Active</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <div className="text-[11px] text-[#777777]">
                          <span>Subtotal: </span>
                          <span className="font-bold text-[#1C2A39]">
                            {formatPrice(m.metadata.cartContents.totalAmount)}
                          </span>
                        </div>
                        <Link
                          href="/checkout"
                          onClick={() => setIsOpen(false)}
                          className="px-3 py-1.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-[11px] font-bold rounded-lg transition"
                        >
                          Checkout →
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Rich Metadata: Orders Snapshot */}
                  {m.metadata?.orders && m.metadata.orders.length > 0 && (
                    <div className="mt-2 w-full space-y-1.5">
                      {m.metadata.orders.map((o) => (
                        <div
                          key={o.orderNumber}
                          className="p-3 bg-white rounded-2xl border border-slate-200 text-xs shadow-xs space-y-1.5"
                        >
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-[#1C2A39] truncate">Order #{o.orderNumber}</span>
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-emerald-100 text-emerald-800">
                              {o.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Placed: {o.date}</span>
                            <span className="font-bold text-[#1C2A39]">{formatPrice(o.grandTotal)}</span>
                          </div>
                          {o.items && o.items[0] && (
                            <p className="text-[10px] text-slate-600 truncate border-t border-slate-100 pt-1">
                              Item: {o.items[0].title} ({o.items[0].quantity}x)
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-slate-200/90 text-xs text-[#333333] w-fit shadow-xs animate-in fade-in">
                <Bot className="w-4 h-4 text-[#FF5E00] animate-spin" />
                <span className="font-medium">Searching catalog & reasoning...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          {messages.length <= 3 && (
            <div className="p-2 bg-slate-100/90 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] shrink-0">
              {quickPrompts.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    handleSend(q);
                    focusInput();
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-[#FF5E00] hover:border-[#FF5E00] text-[#333333] font-medium rounded-full border border-slate-200/80 shrink-0 transition whitespace-nowrap active:scale-95 shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            onClick={() => focusInput()}
            className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 cursor-text"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => {
                hasEverFocusedInputRef.current = true;
              }}
              placeholder={
                loading
                  ? "Fayzee AI is thinking..."
                  : "Ask Fayzee AI (e.g. phone under 50k, compare S24 vs iPhone)..."
              }
              readOnly={loading}
              className={`flex-1 px-3.5 py-2 text-xs bg-slate-50 rounded-full border border-slate-200 focus:outline-none focus:border-[#FF5E00] focus:ring-2 focus:ring-[#FF5E00]/15 min-w-0 transition-all ${
                loading ? "opacity-75 cursor-wait" : ""
              }`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 sm:p-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] disabled:opacity-40 text-white rounded-full transition shadow-sm shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95"
              aria-label="Send query"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
