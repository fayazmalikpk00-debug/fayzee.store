import { getSessionUser } from "@/lib/auth";
import { handleFayzeeAIChat } from "@/services/aiService";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
    const sessionToken = cookies().get("fayzee_cart_session")?.value;

    const response = await handleFayzeeAIChat({
      messages,
      userId: user?.id,
      sessionToken,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("AI Chat API error:", error);
    return NextResponse.json(
      {
        role: "assistant",
        content: "I ran into a temporary hiccup processing that request. Please try asking again!",
        metadata: {},
      },
      { status: 200 }
    );
  }
}
