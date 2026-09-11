"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { SellerChatDrawer } from "@/components/chat/SellerChatDrawer";
import {
  ArrowLeft,
  Check,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Star,
  Store,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FollowedStoresPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"following" | "chats">("following");
  const [followedStores, setFollowedStores] = useState<any[]>([]);
  const [customerChats, setCustomerChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active chat drawer state
  const [activeChatSeller, setActiveChatSeller] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const [followRes, chatRes] = await Promise.all([
        fetch("/api/user/following"),
        fetch("/api/chat/seller"),
      ]);

      const followData = await followRes.json();
      const chatData = await chatRes.json();

      if (followData.following) setFollowedStores(followData.following);
      if (chatData.asCustomer) setCustomerChats(chatData.asCustomer);
    } catch (e) {
      console.error("Error fetching following & chats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleUnfollow = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/sellers/${sellerId}/follow`, {
        method: "POST",
      });
      if (res.ok) {
        setFollowedStores((prev) => prev.filter((item) => item.seller.id !== sellerId));
      }
    } catch (e) {
      console.error("Failed to unfollow:", e);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8A96B] mx-auto" />
        <p className="text-xs text-[#8A8F98]">Loading followed stores & conversations...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center mx-auto border border-[#C8A96B]/30 shadow-md">
          <Store className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#0B0F14]">Please Sign In</h2>
        <p className="text-xs text-[#8A8F98]">
          Log in to view your followed stores and conversations with sellers.
        </p>
        <Link
          href="/login?redirect=/account/following"
          className="inline-block px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] rounded-xl text-xs font-bold transition border border-[#C8A96B]/30 shadow-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs text-[#8A8F98] hover:text-[#0B0F14] transition font-bold mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E5DC]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B0F14]">
              Followed Stores & Seller Chats
            </h1>
            <p className="text-xs text-[#8A8F98] mt-1">
              Your favorite marketplace merchants and direct conversations
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#E8E5DC] gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("following")}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === "following"
              ? "text-[#0B0F14] border-b-2 border-[#C8A96B]"
              : "text-[#8A8F98] hover:text-[#0B0F14]"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Followed Stores</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            {followedStores.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("chats")}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === "chats"
              ? "text-[#0B0F14] border-b-2 border-[#C8A96B]"
              : "text-[#8A8F98] hover:text-[#0B0F14]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Seller Chats</span>
          {customerChats.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#C8A96B]/15 text-[#A07C38]">
              {customerChats.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Followed Stores Grid */}
      {activeTab === "following" && (
        <div className="space-y-4">
          {followedStores.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-[#E8E5DC] shadow-card space-y-4">
              <Store className="w-12 h-12 text-[#C8A96B]/60 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#0B0F14]">No Followed Stores Yet</h3>
                <p className="text-xs text-[#8A8F98] max-w-sm mx-auto">
                  When you find stores and brands you love, click "Follow Store" on their profile or products to get updates here.
                </p>
              </div>
              <Link
                href="/products"
                className="inline-block px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] font-bold rounded-xl text-xs transition border border-[#C8A96B]/30 shadow-xs"
              >
                Explore Marketplace Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followedStores.map((item) => {
                const s = item.seller;
                return (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-3xl border border-[#E8E5DC] shadow-card flex flex-col justify-between gap-4 group hover:border-[#C8A96B] transition"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-[#0B0F14] border border-[#C8A96B]/30 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        {s.logoUrl ? (
                          <img
                            src={s.logoUrl}
                            alt={s.storeName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-7 h-7 text-[#C8A96B]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/sellers/${s.storeSlug}`}
                            className="font-bold text-sm text-[#0B0F14] hover:text-[#C8A96B] transition truncate block"
                          >
                            {s.storeName}
                          </Link>
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-200">
                            Verified
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#8A8F98] mt-1">
                          <span className="text-[#C8A96B] font-bold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-[#C8A96B]" />
                            {s.rating?.toFixed(1) || "5.0"}
                          </span>
                          <span>•</span>
                          <span>{s.productsCount || 0} Products</span>
                          <span>•</span>
                          <span>{s.followersCount || 0} Followers</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-[#E8E5DC]">
                      <button
                        onClick={() => setActiveChatSeller(s)}
                        className="flex-1 py-2 px-3 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-[#C8A96B]/30 shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#C8A96B]" />
                        <span>Chat</span>
                      </button>

                      <Link
                        href={`/sellers/${s.storeSlug}`}
                        className="py-2 px-4 bg-[#F5F3EE] hover:bg-[#E8E5DC] text-[#0B0F14] rounded-xl text-xs font-bold transition"
                      >
                        Visit Store
                      </Link>

                      <button
                        onClick={() => handleUnfollow(s.id)}
                        className="p-2 text-[#8A8F98] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-[#E8E5DC]"
                        title="Unfollow Store"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Seller Chats List */}
      {activeTab === "chats" && (
        <div className="space-y-4">
          {customerChats.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-[#E8E5DC] shadow-card space-y-4">
              <MessageSquare className="w-12 h-12 text-[#C8A96B]/60 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#0B0F14]">No Active Seller Conversations</h3>
                <p className="text-xs text-[#8A8F98] max-w-sm mx-auto">
                  Click "Chat with Seller" on any product page or store profile to ask questions directly.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8E5DC] shadow-card divide-y divide-[#E8E5DC] overflow-hidden">
              {customerChats.map((chat) => {
                const s = chat.seller;
                return (
                  <div
                    key={chat.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#FAF9F6] transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#0B0F14] border border-[#C8A96B]/30 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        {s?.logoUrl ? (
                          <img
                            src={s.logoUrl}
                            alt={s.storeName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-6 h-6 text-[#C8A96B]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#0B0F14] truncate">
                            {s?.storeName || "Store Merchant"}
                          </h4>
                          {chat.unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-black">
                              {chat.unreadCount} new
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#8A8F98] truncate mt-0.5">
                          {chat.lastMessage?.content || "Conversation started"}
                        </p>

                        <span className="text-[10px] text-[#8A8F98]/70 block mt-1">
                          {new Date(chat.lastMessageAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveChatSeller(s)}
                      className="px-4 py-2 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] font-bold rounded-xl text-xs transition border border-[#C8A96B]/30 shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>Open Chat</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Floating Chat Drawer when user clicks Open Chat */}
      {activeChatSeller && (
        <SellerChatDrawer
          isOpen={!!activeChatSeller}
          onClose={() => {
            setActiveChatSeller(null);
            fetchData();
          }}
          seller={activeChatSeller}
        />
      )}
    </div>
  );
}
