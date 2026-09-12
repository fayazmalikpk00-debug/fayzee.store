import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL("/api/chat", req.url);
  return NextResponse.rewrite(url);
}
