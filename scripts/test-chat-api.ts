import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { AUTH_COOKIE_NAME, signToken } from "../lib/auth";
import prisma from "../lib/db";
import { chatRateLimiter } from "../services/ai/rateLimiter";
import { groqProvider } from "../services/ai/providers/groqProvider";
import { geminiProvider } from "../services/ai/providers/geminiProvider";

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

async function runChatAPITests() {
  console.log("==========================================================");
  console.log("🚀 FAYZEE AI CHAT API & PROVIDER VERIFICATION SUITE");
  console.log("==========================================================");

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Provider Architecture Configuration
    // ------------------------------------------------------------------------
    console.log("\n[TEST 1] AI Provider Architecture & Fallback Setup...");
    assert(groqProvider.name === "Groq", "Groq provider is defined as primary");
    assert(geminiProvider.name === "Gemini", "Gemini provider is defined as fallback");
    assert(typeof groqProvider.isAvailable === "function", "Provider availability detection exists");

    // ------------------------------------------------------------------------
    // TEST 2: Sliding-Window Rate Limiter Protection (HTTP 429)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 2] Rate Limiter Enforcement...");
    const testIp = `test_ip_${Date.now()}`;
    chatRateLimiter.reset(testIp);

    let wasBlocked = false;
    for (let i = 1; i <= 26; i++) {
      const check = chatRateLimiter.check(testIp);
      if (!check.allowed) {
        wasBlocked = true;
        assert(check.remaining === 0, "Remaining requests drop to 0 after limit");
        assert(check.retryAfterSeconds > 0, `Retry-After seconds is calculated: ${check.retryAfterSeconds}s`);
        break;
      }
    }
    assert(wasBlocked, "Rate limiter blocked client after 25 requests within 1 minute window");
    chatRateLimiter.reset(testIp);

    // ------------------------------------------------------------------------
    // TEST 3: Validation & Security Boundary (Empty / Invalid Message -> 400)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 3] Input Validation & Safety Boundaries...");
    const { POST } = await import("../app/api/chat/route");

    // Test missing message
    const emptyReq = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "   " }),
    });
    const emptyRes = await POST(emptyReq);
    assert(emptyRes.status === 400, "Empty whitespace message rejected with HTTP 400");
    const emptyData = await emptyRes.json();
    assert(emptyData.success === false, "success: false returned for empty query");
    assert(emptyData.error === "Message is required.", "Clear validation message returned");

    // Test invalid JSON body
    const invalidReq = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not a valid json string",
    });
    const invalidRes = await POST(invalidReq);
    assert(invalidRes.status === 400, "Malformed JSON rejected with HTTP 400");

    // ------------------------------------------------------------------------
    // TEST 4: Rate Limiting over HTTP API (429 Response)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 4] HTTP 429 Handling on /api/chat...");
    const rateLimitClient = "rate_limit_http_test_client";
    chatRateLimiter.reset(rateLimitClient);

    // Simulate hitting the limit
    for (let i = 0; i < 25; i++) {
      chatRateLimiter.check(rateLimitClient);
    }

    const rateLimitedReq = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": rateLimitClient,
      },
      body: JSON.stringify({ message: "Hello" }),
    });

    const rateLimitedRes = await POST(rateLimitedReq);
    assert(rateLimitedRes.status === 429, "Exceeded rate limit returns HTTP 429");
    assert(
      rateLimitedRes.headers.get("Retry-After") !== null,
      "HTTP 429 response includes Retry-After header"
    );
    chatRateLimiter.reset(rateLimitClient);

    // ------------------------------------------------------------------------
    // TEST 5: Successful Shopping Assistant Query on /api/chat
    // ------------------------------------------------------------------------
    console.log("\n[TEST 5] Successful Query Processing on /api/chat...");
    const validReq = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": `client_${Date.now()}`,
      },
      body: JSON.stringify({
        message: "Find me Samsung phones under 400000",
        conversation: [],
      }),
    });

    const validRes = await POST(validReq);
    assert(validRes.status === 200, "Valid shopping query returns HTTP 200");
    const validData = await validRes.json();
    assert(validData.success === true, "Response has success: true");
    assert(typeof validData.message === "string" && validData.message.length > 0, "Response has message string");
    assert(validData.role === "assistant", "Response role is assistant");
    assert(Array.isArray(validData.metadata?.products), "Response metadata contains authentic products array");
    assert(
      validData.metadata.products.length > 0 &&
        validData.metadata.products.every((p: any) => p.price <= 400000),
      "Grounded catalog items obey the price constraint"
    );

    // ------------------------------------------------------------------------
    // TEST 6: Backward-Compatible /api/ai/chat Route
    // ------------------------------------------------------------------------
    console.log("\n[TEST 6] Backward Compatibility with /api/ai/chat...");
    const { POST: LegacyPOST } = await import("../app/api/ai/chat/route");
    const legacyReq = new Request("http://localhost:3000/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": `legacy_client_${Date.now()}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Show me headphones" }],
      }),
    });

    const legacyRes = await LegacyPOST(legacyReq);
    assert(legacyRes.status === 200, "Legacy route /api/ai/chat returns HTTP 200");
    const legacyData = await legacyRes.json();
    assert(legacyData.success === true, "Legacy response returns success: true");
    assert(
      Array.isArray(legacyData.metadata?.products) && legacyData.metadata.products.length > 0,
      "Legacy route returns matching catalog products in metadata"
    );

    // ------------------------------------------------------------------------
    // TEST 7: Order Tracking Security (Guest vs Authenticated)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 7] Order Tracking Security Boundary...");
    const guestOrderReq = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": `guest_${Date.now()}`,
      },
      body: JSON.stringify({ message: "Where is my order?" }),
    });

    const guestOrderRes = await POST(guestOrderReq);
    const guestOrderData = await guestOrderRes.json();
    assert(
      guestOrderData.message.includes("sign in") || guestOrderData.message.includes("/login"),
      "Guest order status request prompts user to sign in to prevent data leakage"
    );

    // ------------------------------------------------------------------------
    // TEST 8: Anti-Hallucination & Error Masking
    // ------------------------------------------------------------------------
    console.log("\n[TEST 8] Anti-Hallucination & Error Masking...");
    const nonExistentReq = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": `hallucination_test_${Date.now()}`,
      },
      body: JSON.stringify({ message: "Show me Martian Flying Spaceships" }),
    });

    const nonExistentRes = await POST(nonExistentReq);
    const nonExistentData = await nonExistentRes.json();
    const msgLower = (nonExistentData.message || "").toLowerCase();
    const indicatesUnavailable =
      msgLower.includes("couldn't find") ||
      msgLower.includes("not available") ||
      msgLower.includes("don't have") ||
      msgLower.includes("do not have") ||
      msgLower.includes("sorry") ||
      msgLower.includes("no products") ||
      msgLower.includes("not in stock") ||
      msgLower.includes("don't carry");
    assert(
      indicatesUnavailable,
      "Non-existent products truthfully report unavailability without inventing fake items"
    );
    assert(
      !nonExistentData.message.includes("api_key") &&
        !nonExistentData.message.includes("postgresql") &&
        !nonExistentData.message.includes("PrismaClient"),
      "Response does not leak internal database errors or API credentials"
    );

  } catch (err: any) {
    console.error("Test execution failed:", err);
    failed++;
  }

  console.log("\n==========================================================");
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runChatAPITests()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
