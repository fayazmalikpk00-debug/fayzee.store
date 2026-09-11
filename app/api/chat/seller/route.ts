import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerProfileId = sessionUser.sellerProfile?.id;

    // Fetch conversations where user is customer
    const customerConversations = await prisma.sellerChatConversation.findMany({
      where: { customerId: sessionUser.id },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            logoUrl: true,
            rating: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: sessionUser.id },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Fetch conversations where user is seller (if applicable)
    let sellerConversations: any[] = [];
    if (sellerProfileId) {
      sellerConversations = await prisma.sellerChatConversation.findMany({
        where: { sellerId: sellerProfileId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: sessionUser.id },
                  isRead: false,
                },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });
    }

    return NextResponse.json({
      asCustomer: customerConversations.map((c) => ({
        id: c.id,
        seller: c.seller,
        lastMessage: c.messages[0] || null,
        unreadCount: c._count.messages,
        lastMessageAt: c.lastMessageAt,
      })),
      asSeller: sellerConversations.map((c) => ({
        id: c.id,
        customer: c.customer,
        lastMessage: c.messages[0] || null,
        unreadCount: c._count.messages,
        lastMessageAt: c.lastMessageAt,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/chat/seller error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Please log in to chat with this store." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sellerId, initialMessage } = body;

    if (!sellerId) {
      return NextResponse.json({ error: "sellerId is required" }, { status: 400 });
    }

    // Find seller by id or slug
    const seller = await prisma.sellerProfile.findFirst({
      where: {
        OR: [{ id: sellerId }, { storeSlug: sellerId }],
      },
      select: {
        id: true,
        userId: true,
        storeName: true,
        storeSlug: true,
        logoUrl: true,
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller store not found" }, { status: 404 });
    }

    if (seller.userId === sessionUser.id) {
      return NextResponse.json(
        { error: "You cannot start a customer chat with your own store." },
        { status: 400 }
      );
    }

    // Find or create conversation
    let conversation = await prisma.sellerChatConversation.findUnique({
      where: {
        customerId_sellerId: {
          customerId: sessionUser.id,
          sellerId: seller.id,
        },
      },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.sellerChatConversation.create({
        data: {
          customerId: sessionUser.id,
          sellerId: seller.id,
        },
        include: {
          seller: {
            select: {
              id: true,
              storeName: true,
              storeSlug: true,
              logoUrl: true,
            },
          },
        },
      });
    }

    // If an initial message was provided, create it
    if (initialMessage && typeof initialMessage === "string" && initialMessage.trim()) {
      await prisma.sellerChatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: sessionUser.id,
          senderRole: "CUSTOMER",
          content: initialMessage.trim(),
        },
      });

      await prisma.sellerChatConversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });

      // Notification for seller
      try {
        await prisma.notification.create({
          data: {
            userId: seller.userId,
            title: `New Message from ${sessionUser.name}`,
            message: initialMessage.trim().slice(0, 100),
            type: "SELLER",
            link: "/seller/dashboard?tab=messages",
          },
        });
      } catch (e) {
        console.error("Failed to create chat notification:", e);
      }
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        seller: conversation.seller,
        customerId: conversation.customerId,
      },
    });
  } catch (error: any) {
    console.error("POST /api/chat/seller error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate chat" },
      { status: 500 }
    );
  }
}
