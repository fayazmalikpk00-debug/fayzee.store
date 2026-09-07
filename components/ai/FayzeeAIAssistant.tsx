"use client";

import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Plus,
  Send,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    products?: any[];
    comparison?: {
      products: any[];
      highlights: string[];
    };
    cartAction?: {
      success: boolean;
      productTitle: string;
      quantity: number;
    };
    orders?: any[];
  };
}

export function FayzeeAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const { addToCart } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Welcome to Fayzee! I'm **Fayzee AI**, your intelligent shopping co-pilot. Ask me for recommendations, specs comparisons, budget finds, or order tracking.",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.content,
          metadata: data.metadata,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I had trouble reaching the Fayzee servers. Please try again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (productId: string) => {
    setAddedIds((prev) => ({ ...prev, [productId]: true }));
    await addToCart(productId, undefined, 1);
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [productId]: false }));
    }, 2500);
  };

  const quickPrompts = [
    "📱 Flagship phone for gaming & photography",
    "👟 Show me Nike sneakers",
    "⚖️ Compare S24 Ultra vs iPhone 15 Pro",
    "📦 Where is my order?",
  ];

  return (
    <>
      {/* Floating Entry Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-brand-600 via-fayzee-cyan to-indigo-700 text-white font-bold text-sm shadow-floating hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-md"
      >
        <Sparkles className="w-5 h-5 animate-spin-slow text-yellow-300" />
        <span>Fayzee AI</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </button>

      {/* Slide-in Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[94vw] sm:w-[440px] h-[600px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-fayzee-dark to-brand-900 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fayzee-cyan to-brand-500 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">Fayzee AI Assistant</h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Connected to authentic database inventory</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: "welcome",
                      role: "assistant",
                      content: "Chat cleared. What can I help you find on Fayzee today?",
                    },
                  ])
                }
                title="Clear conversation"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>

                {/* Rich metadata cards: Products */}
                {m.metadata?.products && m.metadata.products.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      Verified Matching Products
                    </p>
                    <div className="space-y-2">
                      {m.metadata.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 hover:border-brand-400 transition shadow-xs group"
                        >
                          <img
                            src={prod.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                            alt={prod.title}
                            className="w-14 h-14 object-cover rounded-lg shrink-0 bg-slate-100"
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${prod.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="text-xs font-semibold text-slate-900 hover:text-brand-600 truncate block"
                            >
                              {prod.title}
                            </Link>
                            <p className="text-[11px] text-slate-500 truncate">
                              Seller: <span className="font-medium text-slate-700">{prod.seller}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-brand-700">
                                {formatPrice(prod.price)}
                              </span>
                              {prod.originalPrice && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  {formatPrice(prod.originalPrice)}
                                </span>
                              )}
                              <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-700 rounded font-bold">
                                In Stock
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleQuickAdd(prod.id)}
                            className={`p-2 rounded-xl text-xs font-medium transition shrink-0 ${
                              addedIds[prod.id]
                                ? "bg-emerald-600 text-white"
                                : "bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white"
                            }`}
                            title="Add to Cart"
                          >
                            {addedIds[prod.id] ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <ShoppingBag className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rich metadata cards: Comparison */}
                {m.metadata?.comparison && (
                  <div className="mt-2.5 w-full bg-white p-3 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <p className="text-[11px] font-bold text-brand-700">Specification Comparison</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {m.metadata.comparison.products.map((p) => (
                        <div key={p.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <img src={p.image} alt={p.title} className="w-full h-16 object-cover rounded mb-1" />
                          <p className="font-bold text-slate-900 truncate">{p.title}</p>
                          <p className="text-brand-600 font-bold">{formatPrice(p.price)}</p>
                          <p className="text-[10px] text-slate-500">⭐ {p.rating} / 5.0</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orders snapshot */}
                {m.metadata?.orders && (
                  <div className="mt-2 w-full space-y-1.5">
                    {m.metadata.orders.map((o) => (
                      <div key={o.orderNumber} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>Order #{o.orderNumber}</span>
                          <span className="text-emerald-600">{o.status}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Total: {formatPrice(o.grandTotal)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 w-fit">
                <Bot className="w-4 h-4 animate-bounce text-brand-600" />
                <span>Searching Fayzee catalog & reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          {messages.length <= 2 && (
            <div className="p-2 bg-slate-100 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {quickPrompts.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 bg-white hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-medium rounded-full border border-slate-200 shrink-0 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Fayzee AI (e.g. phone for PUBG, track order)..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 rounded-full border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-full transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
