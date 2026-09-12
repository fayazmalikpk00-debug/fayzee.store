import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get("fayzee_cart_session")?.value;
}

export async function GET() {
  try {
    const user = await getSessionUser();
    const sessionToken = user ? undefined : await getSessionToken();

    if (!user && !sessionToken) {
      return NextResponse.json({
        conversationId: null,
        messages: [],
      });
    }

    const conversation = await prisma.aIConversation.findFirst({
      where: user ? { userId: user.id } : { sessionToken },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({
        conversationId: null,
        messages: [],
      });
    }

    const formattedMessages = conversation.messages.map((m) => {
      let parsedMetadata = undefined;
      if (m.metadata) {
        try {
          parsedMetadata = JSON.parse(m.metadata);
        } catch {
          parsedMetadata = undefined;
        }
      }

      return {
        id: m.id,
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
        metadata: parsedMetadata,
        createdAt: m.createdAt,
      };
    });

    return NextResponse.json({
      conversationId: conversation.id,
      messages: formattedMessages,
    });
  } catch (error: any) {
    console.error("Failed to load AI conversation history:", error);
    return NextResponse.json(
      { error: "Could not load conversation history" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getSessionUser();
    const sessionToken = user ? undefined : await getSessionToken();

    if (!user && !sessionToken) {
      return NextResponse.json({ success: true, message: "No active session to clear." });
    }

    await prisma.aIConversation.deleteMany({
      where: user ? { userId: user.id } : { sessionToken },
    });

    return NextResponse.json({ success: true, message: "Chat history cleared." });
  } catch (error: any) {
    console.error("Failed to clear AI conversation history:", error);
    return NextResponse.json(
      { error: "Could not clear conversation history" },
      { status: 500 }
    );
  }
}
