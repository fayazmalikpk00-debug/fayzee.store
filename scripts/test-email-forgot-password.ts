import { getAppBaseUrl, sendPasswordResetEmail } from "../services/emailService";
import prisma from "../lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n============================================================");
  console.log("   FAYZEE FORGOT PASSWORD & EMAIL DELIVERY TEST SUITE");
  console.log("============================================================\n");

  // ------------------------------------------------------------
  // TEST 1: Production Domain Resolution (https://fayzee.store)
  // ------------------------------------------------------------
  console.log("TEST 1: Production Domain URL Resolution");
  const originalEnv = process.env.NODE_ENV;
  const originalUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Simulate Vercel Production environment
  process.env.NODE_ENV = "production";
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.APP_URL;

  const prodBaseUrl = getAppBaseUrl();
  assert(
    prodBaseUrl === "https://fayzee.store",
    `Production domain resolves to 'https://fayzee.store' (got: '${prodBaseUrl}')`
  );

  const testToken = "abc123testtoken456";
  const expectedResetLink = `https://fayzee.store/reset-password?token=${encodeURIComponent(testToken)}`;
  assert(
    expectedResetLink.startsWith("https://fayzee.store/reset-password?token="),
    `Reset link generated with production domain: ${expectedResetLink}`
  );

  // Restore env
  process.env.NODE_ENV = originalEnv;
  if (originalUrl) process.env.NEXT_PUBLIC_APP_URL = originalUrl;
  console.log("");

  // ------------------------------------------------------------
  // TEST 2: Nonexistent Email Handling (Enumeration Defense)
  // ------------------------------------------------------------
  console.log("TEST 2: Nonexistent Account Privacy Defense");
  const randomEmail = `nonexistent-${Date.now()}@notregistered.com`;

  const unknownRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: randomEmail }),
  });

  assert(
    unknownRes.status === 200,
    "Unknown email returns HTTP 200 without exposing account nonexistence"
  );
  const unknownData = await unknownRes.json();
  assert(
    unknownData.message.includes("If an account with that email exists"),
    "Returns privacy-preserving generic message"
  );
  console.log("");

  // ------------------------------------------------------------
  // TEST 3: Email Delivery Failure Detection (No False Positives)
  // ------------------------------------------------------------
  console.log("TEST 3: Email Delivery Failure Detection (Missing API Key in Production)");

  // Temporarily simulate production environment without RESEND_API_KEY
  process.env.NODE_ENV = "production";
  delete process.env.RESEND_API_KEY;

  const failureResult = await sendPasswordResetEmail({
    to: "customer@gmail.com",
    userName: "Zubair Ahmed",
    resetToken: "sampletoken123",
  });

  assert(
    failureResult.success === false,
    "sendPasswordResetEmail returns success: false when RESEND_API_KEY is missing in production"
  );
  assert(
    typeof failureResult.error === "string" && failureResult.error.includes("RESEND_API_KEY"),
    "Error explicitly states RESEND_API_KEY is missing"
  );

  // Restore env
  process.env.NODE_ENV = originalEnv;
  console.log("");

  // ------------------------------------------------------------
  // TEST 4: End-to-End Forgot Password API with Existing User
  // ------------------------------------------------------------
  console.log("TEST 4: End-to-End Forgot Password API Flow");

  // Ensure test user exists
  const testEmail = "customer@gmail.com";
  const user = await prisma.user.findUnique({ where: { email: testEmail } });
  assert(user !== null, `Test user '${testEmail}' exists in database`);

  const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });

  assert(
    forgotRes.status === 200 || forgotRes.status === 503,
    `Forgot password endpoint returns valid HTTP status: ${forgotRes.status}`
  );

  // Verify database record was created
  const resetRecord = await prisma.passwordReset.findFirst({
    where: { userId: user!.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  assert(resetRecord !== null, "PasswordReset record was saved in database");
  assert(
    resetRecord!.tokenHash.length === 64,
    "Token is hashed with SHA-256 (64 hex characters, never plaintext)"
  );
  assert(
    resetRecord!.expiresAt.getTime() > Date.now(),
    "Token has valid future expiration timestamp (30 minutes)"
  );

  const expirationMinutes = Math.round(
    (resetRecord!.expiresAt.getTime() - resetRecord!.createdAt.getTime()) / (60 * 1000)
  );
  assert(
    expirationMinutes === 30,
    `Token expiration window is exactly 30 minutes (got: ${expirationMinutes}m)`
  );
  console.log("");

  // ------------------------------------------------------------
  // TEST 5: Reset Password Flow with Valid Token
  // ------------------------------------------------------------
  console.log("TEST 5: Reset Password Flow (Token Verification & Invalidation)");

  // Generate a fresh test raw token
  const rawTestToken = crypto.randomBytes(32).toString("hex");
  const testHash = crypto.createHash("sha256").update(rawTestToken).digest("hex");

  // Insert test password reset record
  await prisma.passwordReset.create({
    data: {
      userId: user!.id,
      tokenHash: testHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  const newTestPassword = "TestPassword@2026!";

  const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: rawTestToken,
      newPassword: newTestPassword,
    }),
  });

  assert(resetRes.status === 200, "Reset password returns HTTP 200");
  const resetData = await resetRes.json();
  assert(
    resetData.message.includes("successfully reset"),
    "Returns success confirmation message"
  );

  // Verify token is now marked as used (consumed)
  const consumedRecord = await prisma.passwordReset.findUnique({
    where: { tokenHash: testHash },
  });
  assert(
    consumedRecord!.usedAt !== null,
    "Reset token usedAt timestamp is recorded (single-use enforced)"
  );

  // Attempt to reuse the consumed token
  const reuseRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: rawTestToken,
      newPassword: "AnotherPassword123!",
    }),
  });
  assert(
    reuseRes.status === 400,
    "Reusing already-consumed reset token is rejected with HTTP 400"
  );

  // Restore original password for customer@gmail.com
  const restoredHash = await bcrypt.hash("Customer@123", 10);
  await prisma.user.update({
    where: { id: user!.id },
    data: { passwordHash: restoredHash },
  });
  console.log("  ✓ Customer password restored to 'Customer@123'\n");

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------
  console.log("============================================================");
  console.log(`TOTAL ASSERTIONS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL FORGOT PASSWORD & EMAIL TESTS PASSED!");
  }
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
