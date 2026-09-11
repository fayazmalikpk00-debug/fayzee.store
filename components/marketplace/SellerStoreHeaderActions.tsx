"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { SellerChatDrawer } from "@/components/chat/SellerChatDrawer";
import {
  Check,
  Heart,
  Loader2,
  MessageSquare,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SellerStoreHeaderActionsProps {
  seller: {
    id: string;
    storeName: string;
    storeSlug?: string;
    logoUrl?: string | null;
    rating?: number;
    initialFollowerCount?: number;
  };
}

export function SellerStoreHeaderActions({ seller }: SellerStoreHeaderActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(seller.initialFollowerCount || 0);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Check follow status
  useEffect(() => {
    if (!seller?.id) return;

    fetch(`/api/sellers/${seller.id}/follow`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.isFollowing === "boolean") {
          setIsFollowing(data.isFollowing);
        }
        if (typeof data.followerCount === "number") {
          setFollowerCount(data.followerCount);
        }
      })
      .catch((e) => console.error("Error fetching follow status:", e));
  }, [seller?.id, user]);

  const handleToggleFollow = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoadingFollow(true);
    // Optimistic UI update
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setFollowerCount((prev) => (nextFollowing ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`/api/sellers/${seller.id}/follow`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle follow");

      setIsFollowing(data.isFollowing);
      setFollowerCount(data.followerCount);
    } catch (err: any) {
      // Revert on error
      setIsFollowing(!nextFollowing);
      setFollowerCount((prev) => (nextFollowing ? Math.max(0, prev - 1) : prev + 1));
      alert(err.message || "Could not update follow status");
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Follower Count Pill */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs text-white">
          <Users className="w-3.5 h-3.5 text-[#C8A96B]" />
          <span className="font-extrabold text-white">{followerCount}</span>
          <span className="text-[11px] text-white/70">Followers</span>
        </div>

        {/* Follow / Unfollow Button */}
        <button
          onClick={handleToggleFollow}
          disabled={loadingFollow}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
            isFollowing
              ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
              : "bg-[#C8A96B] hover:bg-[#d8bb7f] text-[#0B0F14] font-black border border-[#C8A96B]"
          }`}
        >
          {loadingFollow ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isFollowing ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Follow Store</span>
            </>
          )}
        </button>

        {/* Direct Chat with Seller Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shadow-sm active:scale-95"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#C8A96B]" />
          <span>Chat with Seller</span>
        </button>
      </div>

      {/* Direct Chat Drawer */}
      <SellerChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        seller={seller}
      />
    </>
  );
}
