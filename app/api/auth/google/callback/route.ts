import { AUTH_COOKIE_NAME, hashPassword, signToken } from "@/lib/auth";
import prisma from "@/lib/db";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const origin = url.origin;

  if (error || !code) {
    return NextResponse.redirect(`${origin}/register?error=google_auth_failed`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/register?error=google_not_configured`);
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;

    // 1. Exchange authorization code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Google token exchange error:", errText);
      return NextResponse.redirect(`${origin}/register?error=google_token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google UserInfo
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${origin}/register?error=google_user_failed`);
    }

    const googleUser = await userRes.json();
    const { email, name, picture } = googleUser;

    if (!email) {
      return NextResponse.redirect(`${origin}/register?error=no_email_provided`);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 3. Find or create user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Create new customer account with secure random password hash
      const randomPass = crypto.randomBytes(16).toString("hex") + "Aa1!";
      const passwordHash = await hashPassword(randomPass);

      user = await prisma.user.create({
        data: {
          name: name || "FAYZEE Customer",
          email: normalizedEmail,
          passwordHash,
          avatar: picture || null,
          role: "CUSTOMER",
          status: "ACTIVE",
        },
      });
    } else if (picture && !user.avatar) {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: picture },
      });
    }

    // 4. Sign session JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    // 5. Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.redirect(`${origin}/`);
  } catch (err: any) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${origin}/register?error=oauth_internal_error`);
  }
}
