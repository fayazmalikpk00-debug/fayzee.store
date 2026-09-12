import { getSessionUser } from "../../../lib/auth";
import prisma from "../../../lib/db";
import { chatRateLimiter } from "../../../services/ai/rateLimiter";
import { ChatMessage } from "../../../services/ai/types";
import { handleFayzeeAIChat } from "../../../services/aiService";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getOrSetSessionToken(): string {
  try {
    const cookieStore = cookies();
    let token = cookieStore.get("fayzee_cart_session")?.value;
    if (!token) {
      token = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      cookieStore.set("fayzee_cart_session", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }
    return token;
  } catch {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

function getClientIdentifier(req: Request, sessionToken?: string): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return sessionToken || "anonymous-client";
}

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // Rate Limiting Check
    const user = await getSessionUser();
    const sessionToken = user ? undefined : getOrSetSessionToken();
    const clientId = getClientIdentifier(req, sessionToken || user?.id);

    const rateLimit = chatRateLimiter.check(clientId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please slow down and try again in a moment.",
          message: "Too many requests. Please slow down and try again in a moment.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    // Extract message & conversation history
    // Supports both { message: "...", conversation: [] } and { messages: [] }
    let chatMessages: ChatMessage[] = [];

    if (typeof body.message === "string" && body.message.trim().length > 0) {
      // Single message + optional conversation history
      const currentMessageText = body.message.trim().slice(0, 1000); // 1000 char max safety

      if (Array.isArray(body.conversation)) {
        for (const item of body.conversation) {
          if (item && typeof item.content === "string" && (item.role === "user" || item.role === "assistant")) {
            chatMessages.push({
              role: item.role,
              content: item.content.slice(0, 1000),
              metadata: item.metadata,
            });
          }
        }
      }

      chatMessages.push({
        role: "user",
        content: currentMessageText,
      });
    } else if (Array.isArray(body.messages) && body.messages.length > 0) {
      // Array of messages format - strictly allow only "user" or "assistant" turns from client
      for (const item of body.messages) {
        if (item && typeof item.content === "string" && (item.role === "user" || item.role === "assistant")) {
          chatMessages.push({
            role: item.role,
            content: item.content.slice(0, 1000),
            metadata: item.metadata,
          });
        }
      }
    }

    // Validate that we have at least one user message
    const lastUserMessage = [...chatMessages].reverse().find((m) => m.role === "user");
    if (!lastUserMessage || !lastUserMessage.content.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required.",
          message: "Message is required.",
        },
        { status: 400 }
      );
    }

    // 1. Find or create active AIConversation record
    let conversation = await prisma.aIConversation.findFirst({
      where: user ? { userId: user.id } : { sessionToken },
      orderBy: { updatedAt: "desc" },
    });

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId: user?.id,
          sessionToken,
          title: "Shopping Chat",
        },
      });
    }

    // 2. Persist the latest incoming user message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: lastUserMessage.content,
      },
    });

    // 3. Process AI Reasoning with authoritative database grounding
    const response = await handleFayzeeAIChat({
      messages: chatMessages,
      userId: user?.id,
      sessionToken,
    });

    const responseText = response.message || response.content;

    // 4. Persist assistant response & metadata in database
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: responseText,
        metadata: response.metadata ? JSON.stringify(response.metadata) : null,
      },
    });

    // Update conversation timestamp
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: responseText,
      role: "assistant",
      content: responseText,
      metadata: response.metadata,
      conversationId: conversation.id,
    });
  } catch (error: any) {
    console.error("[Fayzee AI Chat API] Unexpected error:", error?.message || error);
    // Return friendly, safe response without exposing stack traces or internals
    return NextResponse.json(
      {
        success: false,
        message: "Sorry, Fayzee AI is temporarily unavailable. Please try again in a moment.",
        role: "assistant",
        content: "Sorry, Fayzee AI is temporarily unavailable. Please try again in a moment.",
        metadata: {},
      },
      { status: 200 }
    );
  }
}
