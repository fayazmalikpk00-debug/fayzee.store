import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { handleFayzeeAIChat } from "@/services/aiService";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getOrSetSessionToken() {
  const cookieStore = cookies();
  let token = cookieStore.get("fayzee_cart_session")?.value;
  if (!token) {
    token = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    cookies().set("fayzee_cart_session", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
  }
  return token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    const user = await getSessionUser();
    const sessionToken = user ? undefined : getOrSetSessionToken();

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
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      await prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: "USER",
          content: lastUserMessage.content,
        },
      });
    }

    // 3. Process AI Reasoning with authoritative database grounding
    const response = await handleFayzeeAIChat({
      messages,
      userId: user?.id,
      sessionToken,
    });

    // 4. Persist assistant response & metadata in database
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: response.content,
        metadata: response.metadata ? JSON.stringify(response.metadata) : null,
      },
    });

    // Update conversation timestamp
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      role: "assistant",
      content: response.content,
      metadata: response.metadata,
      conversationId: conversation.id,
    });
  } catch (error: any) {
    console.error("AI Chat API error:", error);
    return NextResponse.json(
      {
        role: "assistant",
        content: "I ran into a temporary issue retrieving data from our catalog. Please try asking again or check back in a moment.",
        metadata: {},
      },
      { status: 200 }
    );
  }
}
