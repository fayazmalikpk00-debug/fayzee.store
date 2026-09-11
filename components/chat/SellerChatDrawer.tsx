"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { formatPrice } from "@/lib/utils";
import {
  Check,
  CheckCheck,
  Loader2,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

interface SellerChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  seller: {
    id: string;
    storeName: string;
    storeSlug?: string;
    logoUrl?: string | null;
    rating?: number;
  };
  productContext?: {
    id?: string;
    title: string;
    price: number;
    image?: string;
  } | null;
}

interface MessageItem {
  id: string;
  senderId: string;
  senderRole: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  isMine: boolean;
}

export function SellerChatDrawer({
  isOpen,
  onClose,
  seller,
  productContext,
}: SellerChatDrawerProps) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingConv, setLoadingConv] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const chatFeedRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  };

  // 1. Initialize or find conversation when opened
  useEffect(() => {
    if (!isOpen || !user || !seller?.id) return;

    let isMounted = true;
    setLoadingConv(true);
    setErrorMsg("");

    const initChat = async () => {
      try {
        const res = await fetch("/api/chat/seller", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sellerId: seller.id,
            initialMessage: productContext
              ? `Assalam-o-Alaikum! I have an inquiry about "${productContext.title}". Is it available?`
              : undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to connect with seller");
        }

        if (isMounted && data.conversation?.id) {
          setConversationId(data.conversation.id);
          fetchMessages(data.conversation.id);
        }
      } catch (err: any) {
        if (isMounted) setErrorMsg(err.message || "Failed to start chat");
      } finally {
        if (isMounted) setLoadingConv(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, user, seller?.id]);

  // 2. Fetch messages & setup polling
  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/seller/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        scrollToBottom();
      }
    } catch (e) {
      console.error("Error fetching messages:", e);
    }
  };

  useEffect(() => {
    if (!conversationId || !isOpen) return;

    // Poll every 3.5 seconds for new seller replies
    pollingRef.current = setInterval(() => {
      fetchMessages(conversationId);
    }, 3500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [conversationId, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !conversationId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat/seller/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      setMessages((prev) => [...prev, data.message]);
      setInputText("");
      scrollToBottom();
    } catch (err: any) {
      alert(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-xs transition-opacity duration-300">
      <div className="w-full max-w-md bg-[#FAF9F6] h-full shadow-2xl flex flex-col border-l border-[#E8E5DC] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-[#0B0F14] text-white flex items-center justify-between border-b border-[#1A222C] shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#161F2B] border border-[#C8A96B]/30 flex items-center justify-center overflow-hidden shrink-0">
              {seller.logoUrl ? (
                <img
                  src={seller.logoUrl}
                  alt={seller.storeName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-5 h-5 text-[#C8A96B]" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white truncate">
                  {seller.storeName}
                </h3>
                <span className="p-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold border border-emerald-500/30 shrink-0">
                  <ShieldCheck className="w-3 h-3 inline" />
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Active Store • Replies directly</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8A8F98] hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Inquired Context Banner (if triggered from a product) */}
        {productContext && (
          <div className="px-3.5 py-2.5 bg-white border-b border-[#E8E5DC] flex items-center gap-3 shadow-xs">
            {productContext.image && (
              <img
                src={productContext.image}
                alt={productContext.title}
                className="w-11 h-11 rounded-lg object-cover border border-[#E8E5DC] shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-[#C8A96B] tracking-wider block">
                Product Inquiry
              </span>
              <p className="text-xs font-bold text-[#0B0F14] truncate">
                {productContext.title}
              </p>
              <p className="text-xs font-black text-[#0B0F14]">
                {formatPrice(productContext.price)}
              </p>
            </div>
          </div>
        )}

        {/* Unauthenticated View */}
        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center border border-[#C8A96B]/30 shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#0B0F14]">Sign In to Chat</h4>
              <p className="text-xs text-[#8A8F98] max-w-xs">
                Log in to chat directly with {seller.storeName}, ask questions about products, and receive shipping updates.
              </p>
            </div>
            <Link
              href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
              className="px-6 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] rounded-xl text-xs font-bold transition border border-[#C8A96B]/30 shadow-sm"
            >
              Sign In Now
            </Link>
          </div>
        ) : loadingConv ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#C8A96B]" />
            <span className="text-xs text-[#8A8F98] font-medium">
              Connecting with {seller.storeName}...
            </span>
          </div>
        ) : errorMsg ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
            <button
              onClick={() => {
                setLoadingConv(true);
                setErrorMsg("");
              }}
              className="px-4 py-2 bg-white border border-[#E8E5DC] text-xs font-bold rounded-xl hover:bg-stone-50"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Messages Feed */}
            <div ref={chatFeedRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-center py-2">
                <span className="px-3 py-1 bg-[#E8E5DC]/60 text-[#8A8F98] text-[10px] font-bold rounded-full">
                  Direct inquiry with {seller.storeName}
                </span>
              </div>

              {messages.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <MessageSquare className="w-8 h-8 text-[#C8A96B]/60 mx-auto" />
                  <p className="text-xs font-medium text-[#8A8F98]">
                    No messages yet. Send a message to start conversation!
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.isMine ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      m.isMine
                        ? "bg-[#0B0F14] text-white rounded-br-xs border border-[#C8A96B]/20"
                        : "bg-white text-[#0B0F14] rounded-bl-xs border border-[#E8E5DC]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-[#8A8F98] px-1">
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {m.isMine && (
                      m.isRead ? (
                        <CheckCheck className="w-3 h-3 text-[#C8A96B]" />
                      ) : (
                        <Check className="w-3 h-3 text-[#8A8F98]" />
                      )
                    )}
                  </div>
                </div>
              ))}

            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-white/80 border-t border-[#E8E5DC] flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                "Is this available in stock?",
                "When can you dispatch this?",
                "Are original photos available?",
                "Can you provide a bulk discount?",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  disabled={sending}
                  className="px-2.5 py-1 bg-[#F5F3EE] hover:bg-[#0B0F14] hover:text-[#C8A96B] border border-[#E8E5DC] rounded-full text-[11px] font-medium text-[#0B0F14] whitespace-nowrap transition shrink-0 active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#E8E5DC]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${seller.storeName}...`}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 bg-[#F5F3EE] text-xs text-[#0B0F14] placeholder:text-[#8A8F98] rounded-xl border border-[#E8E5DC] focus:border-[#C8A96B] focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] rounded-xl font-bold transition disabled:opacity-40 disabled:cursor-not-allowed border border-[#C8A96B]/30 shadow-xs active:scale-95 shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
