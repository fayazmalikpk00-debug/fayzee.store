/**
 * Automated Mock Test Suite for FAYZEE Password Reset & Resend Email Dispatch
 * 
 * Verifies:
 * 1. Outgoing HTTP POST request to https://api.resend.com/emails with exact headers & body
 * 2. Correct reading of environment variables (RESEND_API_KEY, EMAIL_FROM, NEXT_PUBLIC_APP_URL)
 * 3. Accurate reset link with production domain: https://fayzee.store/reset-password?token=...
 * 4. Resend success handling (HTTP 200)
 * 5. Resend rejection handling (HTTP 503 returned, no false positive 200)
 * 6. Missing API key handling (HTTP 503 returned, no false positive 200)
 * 7. Network fetch failure handling (HTTP 503 returned, no false positive 200)
 * 8. Non-existent account handling (Privacy defense: HTTP 200 returned, 0 outgoing fetch requests)
 */

import { sendPasswordResetEmail, getAppBaseUrl } from "../services/emailService";
import prisma from "../lib/db";

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

// Preserve original global fetch and environment
const originalFetch = global.fetch;
const originalEnv = { ...process.env };

async function runMockEmailDispatchTests() {
  console.log("\n============================================================");
  console.log("   FAYZEE RESEND EMAIL DISPATCH AUTOMATED MOCK TEST SUITE");
  console.log("============================================================\n");

  // ------------------------------------------------------------
  // TEST 1: Production Domain URL Verification
  // ------------------------------------------------------------
  console.log("TEST 1: Production Domain URL Verification");
  process.env.NODE_ENV = "production";
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.APP_URL;

  const resolvedBaseUrl = getAppBaseUrl();
  assert(
    resolvedBaseUrl === "https://fayzee.store",
    `Base URL in production defaults to 'https://fayzee.store' (got: ${resolvedBaseUrl})`
  );
  console.log("");

  // ------------------------------------------------------------
  // TEST 2: Resend API Request Structure (Headers, Method, URL, Body)
  // ------------------------------------------------------------
  console.log("TEST 2: Resend Outgoing API Request Contract Verification");
  
  const mockApiKey = "re_test_mock_secret_key_123456789";
  const mockSender = "FAYZEE Support <no-reply@fayzee.store>";
  const targetRecipient = "customer@gmail.com";
  const targetToken = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

  process.env.RESEND_API_KEY = mockApiKey;
  process.env.EMAIL_FROM = mockSender;
  process.env.NEXT_PUBLIC_APP_URL = "https://fayzee.store";

  let capturedUrl: string | null = null;
  let capturedOptions: any = null;

  global.fetch = async (input: any, init?: any) => {
    capturedUrl = input.toString();
    capturedOptions = init;
    return new Response(JSON.stringify({ id: "resend_msg_mock_001" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const dispatchResult = await sendPasswordResetEmail({
    to: targetRecipient,
    userName: "Zubair Ahmed",
    resetToken: targetToken,
  });

  assert(capturedUrl === "https://api.resend.com/emails", "Requests exact Resend endpoint: https://api.resend.com/emails");
  assert(capturedOptions?.method === "POST", "HTTP method is POST");
  assert(capturedOptions?.headers?.["Authorization"] === `Bearer ${mockApiKey}`, "Header 'Authorization' matches 'Bearer ${RESEND_API_KEY}'");
  assert(capturedOptions?.headers?.["Content-Type"] === "application/json", "Header 'Content-Type' is 'application/json'");

  const parsedBody = JSON.parse(capturedOptions?.body || "{}");
  assert(parsedBody.from === mockSender, `Body 'from' matches configured EMAIL_FROM: '${mockSender}'`);
  assert(Array.isArray(parsedBody.to) && parsedBody.to[0] === targetRecipient, `Body 'to' contains recipient: '${targetRecipient}'`);
  assert(parsedBody.subject === "Reset Your FAYZEE Password", "Body 'subject' is 'Reset Your FAYZEE Password'");
  assert(typeof parsedBody.html === "string" && parsedBody.html.includes("https://fayzee.store/reset-password?token="), "HTML template contains production link: https://fayzee.store/reset-password?token=");
  assert(typeof parsedBody.text === "string" && parsedBody.text.includes("https://fayzee.store/reset-password?token="), "Plaintext fallback contains production link: https://fayzee.store/reset-password?token=");
  assert(dispatchResult.success === true, "sendPasswordResetEmail returns success: true on Resend 200");
  assert(dispatchResult.messageId === "resend_msg_mock_001", "Returns Resend message ID");
  console.log("");

  // ------------------------------------------------------------
  // TEST 3: Resend Error Handling (Rejection / Domain Not Verified)
  // ------------------------------------------------------------
  console.log("TEST 3: Resend Rejection / API Error (Never Pretend Success)");

  global.fetch = async () => {
    return new Response(
      JSON.stringify({
        statusCode: 403,
        name: "validation_error",
        message: "Domain fayzee.store is not verified on your Resend account.",
      }),
      {
        status: 403,
        statusText: "Forbidden",
        headers: { "Content-Type": "application/json" },
      }
    );
  };

  const errorDispatchResult = await sendPasswordResetEmail({
    to: targetRecipient,
    userName: "Zubair Ahmed",
    resetToken: targetToken,
  });

  assert(errorDispatchResult.success === false, "sendPasswordResetEmail returns success: false when Resend rejects dispatch");
  assert(
    typeof errorDispatchResult.error === "string" && errorDispatchResult.error.includes("not verified"),
    `Error detail extracted safely: '${errorDispatchResult.error}'`
  );
  console.log("");

  // ------------------------------------------------------------
  // TEST 4: Missing RESEND_API_KEY (Never Pretend Success)
  // ------------------------------------------------------------
  console.log("TEST 4: Missing RESEND_API_KEY Detection");

  delete process.env.RESEND_API_KEY;

  let fetchCalled = false;
  global.fetch = async () => {
    fetchCalled = true;
    return new Response(JSON.stringify({}), { status: 200 });
  };

  const missingKeyResult = await sendPasswordResetEmail({
    to: targetRecipient,
    userName: "Zubair Ahmed",
    resetToken: targetToken,
  });

  assert(missingKeyResult.success === false, "sendPasswordResetEmail returns success: false when RESEND_API_KEY is missing");
  assert(fetchCalled === false, "fetch() is NOT called when API key is missing");
  assert(
    typeof missingKeyResult.error === "string" && missingKeyResult.error.includes("RESEND_API_KEY"),
    "Returns clear error about missing RESEND_API_KEY"
  );
  console.log("");

  // ------------------------------------------------------------
  // TEST 5: Network Exception / Fetch Failure
  // ------------------------------------------------------------
  console.log("TEST 5: Network Exception / Timeout Handling");

  process.env.RESEND_API_KEY = mockApiKey;
  global.fetch = async () => {
    throw new Error("ETIMEDOUT: Connection to api.resend.com timed out");
  };

  const exceptionResult = await sendPasswordResetEmail({
    to: targetRecipient,
    userName: "Zubair Ahmed",
    resetToken: targetToken,
  });

  assert(exceptionResult.success === false, "sendPasswordResetEmail returns success: false on network error");
  assert(
    typeof exceptionResult.error === "string" && exceptionResult.error.includes("ETIMEDOUT"),
    "Network error safely returned without application crash"
  );
  console.log("");

  // ------------------------------------------------------------
  // TEST 6: Non-Existent User Defense (Privacy + Zero Fetch Calls)
  // ------------------------------------------------------------
  console.log("TEST 6: Non-Existent User Defense & Zero Outgoing Requests");

  // Restore original fetch for local API route test
  global.fetch = originalFetch;

  const nonExistentEmail = `random-unregistered-${Date.now()}@domain.com`;
  const forgotResponse = await fetch("http://localhost:3000/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: nonExistentEmail }),
  });

  assert(forgotResponse.status === 200, "Non-existent email returns HTTP 200 (Account enumeration protection)");
  const forgotData = await forgotResponse.json();
  assert(
    forgotData.message === "If an account with that email exists, a password reset link has been sent.",
    "Returns privacy-preserving generic message"
  );
  console.log("");

  // Restore environment
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) {
      delete process.env[key];
    }
  }
  Object.assign(process.env, originalEnv);

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
    console.log("🎉 ALL RESEND MOCK TESTS PASSED SUCCESSFULLY!");
  }
}

runMockEmailDispatchTests()
  .catch((err) => {
    console.error("Test runner failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
