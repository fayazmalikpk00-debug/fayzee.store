import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const clientId =
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    "204528773506-pn0mi563muah1ccqgqs1ioi2h2av00ds.apps.googleusercontent.com";

  if (!clientId) {
    return NextResponse.redirect(`${origin}/register?error=google_not_configured`);
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = Math.random().toString(36).substring(7);

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20email%20profile&state=${state}&prompt=select_account`;

  return NextResponse.redirect(googleAuthUrl);
}
