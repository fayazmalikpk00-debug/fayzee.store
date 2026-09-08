import { OpenAICompatibleProvider } from "./openAICompatible";

/**
 * Extensible Provider: OpenRouter (supports DeepSeek, Meta LLaMA, Claude, Mistral, etc.)
 * Configured via OPENROUTER_API_KEY.
 */
export class OpenRouterProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: "OpenRouter",
      baseURL: "https://openrouter.ai/api/v1",
      getApiKey: () => process.env.OPENROUTER_API_KEY,
      defaultModel: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
      defaultTemperature: 0.5,
      defaultMaxTokens: 1024,
      defaultTimeoutMs: 15000,
      extraHeaders: {
        "HTTP-Referer": "https://fayzee.store",
        "X-Title": "Fayzee E-Commerce Shopping Assistant",
      },
    });
  }
}

export const openRouterProvider = new OpenRouterProvider();
