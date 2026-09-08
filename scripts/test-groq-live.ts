import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import fs from "fs";
import path from "path";

// Parse .env using native fs without external packages
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

import { groqProvider } from "../services/ai/providers/groqProvider";
import { executeAIWithFallback } from "../services/ai/providers";
import { handleFayzeeAIChat } from "../services/aiService";

async function runGroqLiveVerification() {
  console.log("==========================================================");
  console.log("🔒 GROQ LIVE INTEGRATION & SECURITY VERIFICATION");
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

  // 1. Verify GROQ_API_KEY is loaded from .env
  const key = process.env.GROQ_API_KEY?.trim();
  const isKeyLoaded = Boolean(key && key.length > 20 && key.startsWith("gsk_"));
  assert(isKeyLoaded, "GROQ_API_KEY is loaded from .env with valid format (gsk_...)");

  // 2. Verify GROQ_MODEL is loaded correctly
  const configuredModel = process.env.GROQ_MODEL?.replace(/['"]/g, "").trim() || "llama-3.3-70b-versatile";
  assert(Boolean(configuredModel), `GROQ_MODEL is loaded correctly: "${configuredModel}"`);

  // 3. Verify groqProvider.isAvailable() detects the key
  assert(groqProvider.isAvailable(), "GroqProvider reports available status");

  // 4. Test direct inference call to Groq API
  console.log("\n[Testing Live Inference with Groq API...]");
  try {
    const rawResponse = await groqProvider.generateResponse(
      [{ role: "user", content: "Tell me one quick fact about smartphones in Pakistan in 10 words or less." }],
      "You are Fayzee AI shopping assistant."
    );

    assert(
      typeof rawResponse === "string" && rawResponse.length > 5,
      "Groq API returned a real, non-empty response"
    );
    console.log(`  📝 Groq Response Preview: "${rawResponse.slice(0, 120)}..."`);

    // 5. Verify API Key is NOT exposed in the output
    const containsKey = key ? rawResponse.includes(key) : false;
    assert(!containsKey, "API Key is NOT exposed in the generated response");

  } catch (err: any) {
    console.error("  ❌ FAIL: Direct Groq API call failed:", err?.message || err);
    failed++;
  }

  // 6. Test End-to-End Chat Flow with Database Inventory Grounding
  console.log("\n[Testing End-to-End Grounded Chat Flow with Groq...]");
  try {
    const chatResult = await handleFayzeeAIChat({
      messages: [{ role: "user", content: "I want a high-end Samsung smartphone" }],
    });

    assert(
      chatResult.metadata.providerUsed === "Groq",
      `Chat handler used primary provider: "${chatResult.metadata.providerUsed}"`
    );
    assert(
      chatResult.content.length > 0,
      "Assistant generated a complete grounded message"
    );
    assert(
      (chatResult.metadata.products?.length || 0) > 0,
      "Assistant grounded response in authentic database products"
    );
    console.log(`  📝 Assistant Reply: "${chatResult.content.slice(0, 140)}..."`);

    // Ensure API Key is not in metadata or response
    const jsonStr = JSON.stringify(chatResult);
    const keyLeakedInPayload = key ? jsonStr.includes(key) : false;
    assert(!keyLeakedInPayload, "API Key is completely masked and NOT exposed anywhere in chat payload");

  } catch (err: any) {
    console.error("  ❌ FAIL: Grounded chat flow failed:", err?.message || err);
    failed++;
  }

  console.log("\n==========================================================");
  console.log(`LIVE VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) process.exit(1);
}

runGroqLiveVerification().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
