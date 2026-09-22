import { NextResponse } from "next/server";

export async function GET() {
  const clientId =
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    "204528773506-pn0mi563muah1ccqgqs1ioi2h2av00ds.apps.googleusercontent.com";
  return NextResponse.json({
    configured: !!clientId,
    clientId: clientId || null,
  });
}

