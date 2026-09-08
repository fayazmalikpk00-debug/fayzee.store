import { AIProvider, AIProviderOptions, ChatMessage } from "../types";
import { groqProvider } from "./groqProvider";
import { geminiProvider } from "./geminiProvider";
import { openRouterProvider } from "./openRouterProvider";

export * from "./base";
export * from "./openAICompatible";
export * from "./groqProvider";
export * from "./geminiProvider";
export * from "./openRouterProvider";

/**
 * Priority order of AI providers:
 * 1. Groq (Primary, fast LLaMA 3.3 70B inference)
 * 2. Gemini (Secondary fallback)
 * 3. OpenRouter (Tertiary fallback)
 */
export const providerChain: AIProvider[] = [
  groqProvider,
  geminiProvider,
  openRouterProvider,
];

/**
 * Dispatches the chat request to the primary provider (Groq) with automatic fallback
 * to secondary providers if errors, timeouts, or rate limits occur.
 *
 * Returns null if no providers are configured or all attempts failed,
 * allowing the caller to use the deterministic database grounding engine.
 */
export async function executeAIWithFallback(
  messages: ChatMessage[],
  systemPrompt: string,
  options?: AIProviderOptions
): Promise<{ text: string; providerUsed: string } | null> {
  const availableProviders = providerChain.filter((p) => p.isAvailable());

  if (availableProviders.length === 0) {
    return null;
  }

  for (const provider of availableProviders) {
    try {
      const response = await provider.generateResponse(messages, systemPrompt, options);
      if (response && response.trim()) {
        return {
          text: response.trim(),
          providerUsed: provider.name,
        };
      }
    } catch (err: any) {
      console.warn(
        `[Fayzee AI] Provider "${provider.name}" failed: ${err?.message || err}. Attempting fallback...`
      );
    }
  }

  return null;
}
