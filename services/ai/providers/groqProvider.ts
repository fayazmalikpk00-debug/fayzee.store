import { OpenAICompatibleProvider } from "./openAICompatible";

/**
 * Primary AI Provider for Fayzee: Groq API
 * High-speed inference using LLaMA 3.3 70B Versatile with instant fallback to 8B Instant.
 */
export class GroqProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: "Groq",
      baseURL: "https://api.groq.com/openai/v1",
      getApiKey: () => process.env.GROQ_API_KEY,
      getModel: () => process.env.GROQ_MODEL,
      defaultModel: "llama-3.3-70b-versatile",
      fallbackModel: "llama-3.1-8b-instant",
      defaultTemperature: 0.5,
      defaultMaxTokens: 1024,
      defaultTimeoutMs: 15000,
    });
  }
}

export const groqProvider = new GroqProvider();
