import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import fs from "fs";
import path from "path";

// Load .env
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

import { handleFayzeeAIChat, isProductSeekingQuery } from "../services/aiService";
import { groqProvider } from "../services/ai/providers/groqProvider";

async function main() {
  console.log("==========================================================");
  console.log("🧪 TESTING GENERAL VS PRODUCT CHAT FLOWS");
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

  // 1. Classification Tests
  console.log("\n[1] Intent Classification Tests...");
  assert(!isProductSeekingQuery("Hello, my name is Fayaz. What is 25 + 37?"), "General math + greeting is NOT product seeking");
  assert(!isProductSeekingQuery("What is Fayzee?"), "'What is Fayzee?' is NOT product seeking");
  assert(!isProductSeekingQuery("Tell me a joke"), "'Tell me a joke' is NOT product seeking");
  assert(isProductSeekingQuery("Show me Samsung phones"), "'Show me Samsung phones' IS product seeking");
  assert(isProductSeekingQuery("Do you have flying cars?"), "'Do you have flying cars?' IS product seeking");
  assert(isProductSeekingQuery("sasta phone chahiye"), "'sasta phone chahiye' IS product seeking");

  // 2. Test General Question Flow -> Groq AI response
  console.log("\n[2] Testing General Question Flow (Math + Greeting)...");
  const generalRes = await handleFayzeeAIChat({
    messages: [{ role: "user", content: "Hello, my name is Fayaz. What is 25 + 37?" }],
  });

  console.log("  Provider Used:", generalRes.metadata.providerUsed);
  console.log("  Message:", generalRes.content);
  assert(
    generalRes.content.includes("62"),
    "General question correctly answered math (25 + 37 = 62)"
  );
  assert(
    !generalRes.content.toLowerCase().includes("couldn't find products") &&
      !generalRes.content.toLowerCase().includes("searched our inventory"),
    "General question does NOT mention inventory or missing products"
  );
  assert(
    (generalRes.metadata.products?.length || 0) === 0,
    "General question does not return irrelevant product cards"
  );

  // 3. Test General Question: "What is Fayzee?"
  console.log("\n[3] Testing General Question ('What is Fayzee?')...");
  const fayzeeRes = await handleFayzeeAIChat({
    messages: [{ role: "user", content: "What is Fayzee?" }],
  });
  console.log("  Message:", fayzeeRes.content);
  assert(
    fayzeeRes.content.toLowerCase().includes("fayzee") ||
      fayzeeRes.content.toLowerCase().includes("marketplace") ||
      fayzeeRes.content.toLowerCase().includes("shopping"),
    "Fayzee question explains the platform"
  );

  // 4. Test Product Question with Products (e.g. Samsung phones)
  console.log("\n[4] Testing Product Question with Authentic Products...");
  const productRes = await handleFayzeeAIChat({
    messages: [{ role: "user", content: "Show me Samsung phones" }],
  });
  console.log("  Provider Used:", productRes.metadata.providerUsed);
  console.log("  Message:", productRes.content);
  assert(
    (productRes.metadata.products?.length || 0) > 0,
    "Product question returned authentic products in metadata"
  );
  assert(
    productRes.content.toLowerCase().includes("samsung") ||
      productRes.content.toLowerCase().includes("s24"),
    "Response mentions the grounded product"
  );

  // 5. Test Product Question with Non-Existent Product (Graceful response)
  console.log("\n[5] Testing Product Question with Non-Existent Product...");
  const nonExistentRes = await handleFayzeeAIChat({
    messages: [{ role: "user", content: "Do you have Martian Flying Saucers for sale?" }],
  });
  console.log("  Message:", nonExistentRes.content);
  const msgLower = nonExistentRes.content.toLowerCase();
  const isGraceful =
    msgLower.includes("not available") ||
    msgLower.includes("don't have") ||
    msgLower.includes("do not have") ||
    msgLower.includes("out of stock") ||
    msgLower.includes("sorry") ||
    msgLower.includes("couldn't find");
  assert(isGraceful, "Non-existent product reports unavailability gracefully without hallucinating");

  console.log("\n==========================================================");
  console.log(`GENERAL & PRODUCT FLOW TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
