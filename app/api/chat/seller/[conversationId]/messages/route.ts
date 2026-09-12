import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    const conversation = await prisma.sellerChatConversation.findUnique({
      where: { id: conversationId },
      include: {
        seller: {
          select: {
            id: true,
            userId: true,
            storeName: true,
            storeSlug: true,
            logoUrl: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Verify user is either customer or the seller owner
    const isCustomer = conversation.customerId === sessionUser.id;
    const isSeller = conversation.seller.userId === sessionUser.id;

    if (!isCustomer && !isSeller && sessionUser.role !== "ADMIN" && sessionUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch messages
    const messages = await prisma.sellerChatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    // Mark unread messages sent by the other party as read
    await prisma.sellerChatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: sessionUser.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        seller: conversation.seller,
        customer: conversation.customer,
      },
      messages: messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderRole: m.senderRole,
        content: m.content,
        isRead: m.isRead,
        createdAt: m.createdAt,
        isMine: m.senderId === sessionUser.id,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/chat/seller/[conversationId]/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    const conversation = await prisma.sellerChatConversation.findUnique({
      where: { id: conversationId },
      include: {
        seller: {
          select: {
            id: true,
            userId: true,
            storeName: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isCustomer = conversation.customerId === sessionUser.id;
    const isSeller = conversation.seller.userId === sessionUser.id;

    if (!isCustomer && !isSeller) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const content = body?.content?.trim();

    if (!content) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    const senderRole = isSeller ? "SELLER" : "CUSTOMER";

    // Create the message
    const message = await prisma.sellerChatMessage.create({
      data: {
        conversationId,
        senderId: sessionUser.id,
        senderRole,
        content,
      },
    });

    // Update conversation timestamp
    await prisma.sellerChatConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Dispatch notification to recipient
    const recipientUserId = isSeller ? conversation.customerId : conversation.seller.userId;
    const senderTitle = isSeller ? conversation.seller.storeName : sessionUser.name;

    try {
      await prisma.notification.create({
        data: {
          userId: recipientUserId,
          title: `New message from ${senderTitle}`,
          message: content.slice(0, 100),
          type: isSeller ? "SYSTEM" : "SELLER",
          link: isSeller ? "/account" : "/seller/dashboard?tab=messages",
        },
      });
    } catch (e) {
      console.error("Failed to create message notification:", e);
    }

    return NextResponse.json({
      message: {
        id: message.id,
        senderId: message.senderId,
        senderRole: message.senderRole,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
        isMine: true,
      },
    });
  } catch (error: any) {
    console.error("POST /api/chat/seller/[conversationId]/messages error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
