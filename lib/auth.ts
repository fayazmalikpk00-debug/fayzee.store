import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "fayzee-fallback-secret-2026-make-sure-to-set-env";
const AUTH_COOKIE_NAME = "fayzee_auth_token";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
        sellerProfile: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            status: true,
            rating: true,
            rejectionReason: true,
            isPhoneVerified: true,
            isEmailVerified: true,
          },
        },
      },
    });

    if (!user || user.status === "SUSPENDED") return null;
    return user;
  } catch {
    return null;
  }
}

export { AUTH_COOKIE_NAME };
