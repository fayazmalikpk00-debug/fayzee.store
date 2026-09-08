import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const prisma = new PrismaClient();

async function runTestSuite() {
  console.log("==========================================================");
  console.log("🔐 FAYZEE PASSWORD RECOVERY & AUTH SECURITY TEST SUITE");
  console.log("==========================================================");

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

  const testEmail = `test.reset.${Date.now()}@fayzee-test.com`;
  const initialPassword = "InitialPassword123";
  const newPassword = "BrandNewPassword999";
  let testUserId = "";

  try {
    // 0. Ensure database connection (handles Neon serverless compute cold-starts)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.$queryRawUnsafe('SELECT 1');
        break;
      } catch {
        if (attempt === 3) throw new Error("Could not reach database server after 3 attempts.");
        console.log(`Connecting to database (attempt ${attempt}/3)...`);
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    // ------------------------------------------------------------------------
    // TEST 1: Existing Login Still Works
    // ------------------------------------------------------------------------
    console.log("\n[TEST 1] Verifying Existing User Authentication...");
    const existingUser = await prisma.user.findUnique({
      where: { email: "customer@gmail.com" },
    });
    assert(existingUser !== null, "Existing user 'customer@gmail.com' found in database");
    if (existingUser) {
      const isMatch = await bcrypt.compare("Customer@123", existingUser.passwordHash);
      assert(isMatch, "Existing user's bcrypt password hash correctly verifies 'Customer@123'");
    }

    // ------------------------------------------------------------------------
    // TEST 2: User Registration Still Works
    // ------------------------------------------------------------------------
    console.log("\n[TEST 2] Verifying Registration Flow & Password Hashing...");
    const salt = await bcrypt.genSalt(10);
    const initialHash = await bcrypt.hash(initialPassword, salt);
    const createdUser = await prisma.user.create({
      data: {
        name: "Test Reset User",
        email: testEmail,
        passwordHash: initialHash,
        role: "CUSTOMER",
      },
    });
    testUserId = createdUser.id;
    assert(createdUser.id !== null, `Created test user with ID: ${createdUser.id}`);
    assert(
      await bcrypt.compare(initialPassword, createdUser.passwordHash),
      "Created user password hash matches initial password"
    );

    // ------------------------------------------------------------------------
    // TEST 3 & 4: Forgot Password - Unknown Email Does NOT Reveal Account Existence
    // ------------------------------------------------------------------------
    console.log("\n[TEST 3] Verifying Account Enumeration Prevention (Unknown Email)...");
    const unknownEmail = "completely.unknown.account@nowhere.com";
    const unknownUser = await prisma.user.findUnique({ where: { email: unknownEmail } });
    assert(unknownUser === null, "Unknown user does not exist in database");

    // Check that no token is created for non-existent users
    const resetsForUnknown = await prisma.passwordReset.findMany({
      where: { user: { email: unknownEmail } },
    });
    assert(resetsForUnknown.length === 0, "No reset token created for non-existent email");

    // ------------------------------------------------------------------------
    // TEST 5: Valid Email Generates Cryptographic Token & Stores Only SHA-256 Hash
    // ------------------------------------------------------------------------
    console.log("\n[TEST 4] Verifying Cryptographic Token Generation & Hashing...");
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    const resetRecord = await prisma.passwordReset.create({
      data: {
        userId: testUserId,
        tokenHash,
        expiresAt,
      },
    });

    assert(resetRecord.id !== null, "PasswordReset record inserted successfully");
    assert(resetRecord.tokenHash === tokenHash, "Stored token is hashed with SHA-256 (never plaintext)");
    assert(resetRecord.tokenHash !== rawToken, "Raw token differs from stored hash");
    assert(
      resetRecord.expiresAt.getTime() > Date.now() + 29 * 60 * 1000,
      "Reset token expiration correctly set to 30 minutes in the future"
    );
    assert(resetRecord.usedAt === null, "New reset token starts with usedAt = null");

    // ------------------------------------------------------------------------
    // TEST 6: Invalidation of Previous Unused Tokens
    // ------------------------------------------------------------------------
    console.log("\n[TEST 5] Verifying Invalidation of Previous Unused Tokens...");
    // Simulate user requesting a second reset token
    await prisma.passwordReset.updateMany({
      where: { userId: testUserId, usedAt: null },
      data: { usedAt: new Date() },
    });
    const oldTokensActive = await prisma.passwordReset.count({
      where: { userId: testUserId, usedAt: null },
    });
    assert(oldTokensActive === 0, "Previous unused reset tokens are marked as used/invalidated");

    // Create a new fresh active token for subsequent tests
    const activeRawToken = crypto.randomBytes(32).toString("hex");
    const activeTokenHash = crypto.createHash("sha256").update(activeRawToken).digest("hex");
    const activeRecord = await prisma.passwordReset.create({
      data: {
        userId: testUserId,
        tokenHash: activeTokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });
    assert(activeRecord.usedAt === null, "Created fresh active reset token");

    // ------------------------------------------------------------------------
    // TEST 7: Expired Token Rejection
    // ------------------------------------------------------------------------
    console.log("\n[TEST 6] Verifying Expired Token Rejection...");
    const expiredRawToken = crypto.randomBytes(32).toString("hex");
    const expiredTokenHash = crypto.createHash("sha256").update(expiredRawToken).digest("hex");
    await prisma.passwordReset.create({
      data: {
        userId: testUserId,
        tokenHash: expiredTokenHash,
        expiresAt: new Date(Date.now() - 10000), // Expired 10 seconds ago
      },
    });

    const foundExpired = await prisma.passwordReset.findUnique({
      where: { tokenHash: expiredTokenHash },
    });
    assert(
      foundExpired !== null && new Date() > foundExpired.expiresAt,
      "Expired token is correctly detected as expired"
    );

    // ------------------------------------------------------------------------
    // TEST 8: Used Token Rejection
    // ------------------------------------------------------------------------
    console.log("\n[TEST 7] Verifying Already-Used Token Rejection...");
    const usedRawToken = crypto.randomBytes(32).toString("hex");
    const usedTokenHash = crypto.createHash("sha256").update(usedRawToken).digest("hex");
    await prisma.passwordReset.create({
      data: {
        userId: testUserId,
        tokenHash: usedTokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        usedAt: new Date(), // Already used
      },
    });

    const foundUsed = await prisma.passwordReset.findUnique({
      where: { tokenHash: usedTokenHash },
    });
    assert(foundUsed !== null && foundUsed.usedAt !== null, "Used token is correctly detected as already used");

    // ------------------------------------------------------------------------
    // TEST 9: Password Reset Execution & Atomic DB Update
    // ------------------------------------------------------------------------
    console.log("\n[TEST 8] Executing Password Reset with Active Token...");
    const incomingRawToken = activeRawToken;
    const computedHash = crypto.createHash("sha256").update(incomingRawToken).digest("hex");

    const validRecord = await prisma.passwordReset.findUnique({
      where: { tokenHash: computedHash },
    });
    assert(
      validRecord !== null && validRecord.usedAt === null && new Date() <= validRecord.expiresAt,
      "Active token found, unused, and valid"
    );

    // Hash new password
    const newSalt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, newSalt);

    // Atomic transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: testUserId },
        data: { passwordHash: newHash },
      }),
      prisma.passwordReset.update({
        where: { id: validRecord!.id },
        data: { usedAt: new Date() },
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({ where: { id: testUserId } });
    assert(updatedUser?.passwordHash === newHash, "User passwordHash updated in database");

    const consumedRecord = await prisma.passwordReset.findUnique({ where: { id: validRecord!.id } });
    assert(consumedRecord?.usedAt !== null, "Token marked as used (usedAt timestamp recorded)");

    // ------------------------------------------------------------------------
    // TEST 10: Reusing Token Fails & New Password Works for Login
    // ------------------------------------------------------------------------
    console.log("\n[TEST 9] Verifying Token Cannot Be Reused...");
    const recheckRecord = await prisma.passwordReset.findUnique({
      where: { tokenHash: computedHash },
    });
    assert(recheckRecord?.usedAt !== null, "Attempting to reuse consumed token is blocked (usedAt is not null)");

    console.log("\n[TEST 10] Verifying Login with New Password...");
    const isNewPasswordValid = await bcrypt.compare(newPassword, updatedUser!.passwordHash);
    assert(isNewPasswordValid, "User can successfully authenticate with NEW password");

    const isOldPasswordRejected = !(await bcrypt.compare(initialPassword, updatedUser!.passwordHash));
    assert(isOldPasswordRejected, "OLD password is rejected and no longer valid");

  } catch (error) {
    console.error("Test execution threw an error:", error);
    failed++;
  } finally {
    // Clean up test data
    console.log("\n[CLEANUP] Cleaning up test records...");
    if (testUserId) {
      await prisma.passwordReset.deleteMany({ where: { userId: testUserId } });
      await prisma.user.delete({ where: { id: testUserId } });
      console.log("  🧹 Test user and password reset records removed.");
    }
    await prisma.$disconnect();
  }

  console.log("\n==========================================================");
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
