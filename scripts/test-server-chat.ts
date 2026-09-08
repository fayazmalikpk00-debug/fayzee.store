import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import fs from "fs";
import path from "path";

async function verifyLiveServerEndpoint() {
  console.log("==========================================================");
  console.log("🌐 VERIFYING LIVE HTTP POST /api/chat ENDPOINT");
  console.log("==========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // Read .env strictly to check without exposing key
  const envPath = path.resolve(__dirname, "../.env");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const apiKeyMatch = envContent.match(/GROQ_API_KEY=(.*)/);
  const rawKey = apiKeyMatch ? apiKeyMatch[1].replace(/["']/g, "").trim() : "";

  // 1. Verify GROQ_API_KEY is loaded in .env
  assert(
    Boolean(rawKey && rawKey.startsWith("gsk_") && rawKey.length > 20),
    "GROQ_API_KEY is loaded from .env with authentic prefix"
  );

  // 2. Verify GROQ_MODEL is loaded correctly in .env
  const modelMatch = envContent.match(/GROQ_MODEL=(.*)/);
  const rawModel = modelMatch ? modelMatch[1].replace(/["']/g, "").trim() : "";
  assert(
    Boolean(rawModel && rawModel.length > 0),
    `GROQ_MODEL is loaded correctly: "${rawModel}"`
  );

  // 3. Test HTTP POST /api/chat
  const testPayload = {
    message: "Show me the Samsung Galaxy phone and its price",
    conversation: [],
  };

  console.log("\n[Sending live HTTP POST to http://localhost:3000/api/chat...]");
  const startTime = Date.now();
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Fayzee-Automated-Verifier",
    },
    body: JSON.stringify(testPayload),
  });
  const latencyMs = Date.now() - startTime;

  assert(res.status === 200, `POST /api/chat returned HTTP ${res.status} in ${latencyMs}ms`);

  const responseText = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(responseText);
  } catch {
    assert(false, "Response is valid JSON");
  }

  assert(data?.success === true, "Response payload contains success: true");
  assert(Boolean(data?.message && typeof data.message === "string"), "Response contains valid message text");
  console.log(`  📝 AI Response Message: "${data?.message?.slice(0, 140)}..."`);

  // 4. Verify a real Groq response is returned
  const provider = data?.metadata?.providerUsed;
  assert(provider === "Groq", `Real Groq response returned (providerUsed: "${provider}")`);

  // 5. Verify grounded database products returned
  const products = data?.metadata?.products;
  assert(
    Array.isArray(products) && products.length > 0,
    `Authentic products returned in metadata (${products?.length || 0} product(s) found)`
  );
  if (products && products[0]) {
    assert(
      products[0].title.includes("Samsung"),
      `Product matched catalog: "${products[0].title}" at Rs. ${products[0].price?.toLocaleString()}`
    );
  }

  // 6. Verify the API key is NOT exposed anywhere
  const keyExposedInBody = rawKey ? responseText.includes(rawKey) : false;
  assert(!keyExposedInBody, "API key is NOT exposed anywhere in the HTTP response body");

  let keyExposedInHeaders = false;
  res.headers.forEach((val) => {
    if (rawKey && val.includes(rawKey)) keyExposedInHeaders = true;
  });
  // 7. Test General Question: "Hello, my name is Fayaz. What is 25 + 37?"
  console.log("\n[Testing General Question (Math + Greeting) over HTTP POST...]");
  const generalRes = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Fayzee-Automated-Verifier",
    },
    body: JSON.stringify({ message: "Hello, my name is Fayaz. What is 25 + 37?" }),
  });
  assert(generalRes.status === 200, `General question returned HTTP ${generalRes.status}`);
  const generalData = await generalRes.json();
  console.log(`  📝 General AI Reply: "${generalData?.message?.slice(0, 140)}..."`);
  assert(
    generalData?.message?.includes("62"),
    "General question answered correctly (25 + 37 = 62)"
  );
  assert(
    !generalData?.message?.toLowerCase().includes("couldn't find products") &&
      !generalData?.message?.toLowerCase().includes("searched our inventory"),
    "General question does NOT mention inventory or missing products"
  );
  assert(
    (generalData?.metadata?.products?.length || 0) === 0,
    "General question does not return irrelevant product cards"
  );
  assert(
    generalData?.metadata?.providerUsed === "Groq",
    `General question answered by provider: "${generalData?.metadata?.providerUsed}"`
  );

  console.log("\n==========================================================");
  console.log(`HTTP ENDPOINT VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) process.exit(1);
}

verifyLiveServerEndpoint().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
