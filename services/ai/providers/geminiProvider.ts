import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseAIProvider } from "./base";
import { AIProviderOptions, ChatMessage } from "../types";

/**
 * Fallback AI Provider: Google Gemini
 * Used if Groq encounters rate limits or service disruptions, provided GEMINI_API_KEY is configured.
 */
export class GeminiProvider extends BaseAIProvider {
  readonly name = "Gemini";

  public isAvailable(): boolean {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && key.trim().length > 0 && !key.includes("your-gemini-api-key"));
  }

  public async generateResponse(
    messages: ChatMessage[],
    systemPrompt: string,
    options?: AIProviderOptions
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !this.isAvailable()) {
      throw new Error("[Gemini] GEMINI_API_KEY is not configured or is invalid.");
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const modelName = options?.model || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: options?.temperature ?? 0.6,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    });

    const conversationTranscript = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${conversationTranscript}\n\nASSISTANT:`;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    if (!text || !text.trim()) {
      throw new Error("[Gemini] Received empty response from model.");
    }

    return text.trim();
  }
}

export const geminiProvider = new GeminiProvider();
