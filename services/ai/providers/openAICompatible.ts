import { BaseAIProvider } from "./base";
import { AIProviderOptions, ChatMessage } from "../types";

export interface OpenAICompatibleConfig {
  name: string;
  baseURL: string;
  getApiKey: () => string | undefined;
  getModel?: () => string | undefined;
  defaultModel: string;
  fallbackModel?: string;
  fallbackModels?: string[];
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  defaultTimeoutMs?: number;
  extraHeaders?: Record<string, string>;
}

export class OpenAICompatibleProvider extends BaseAIProvider {
  readonly name: string;
  protected config: OpenAICompatibleConfig;

  constructor(config: OpenAICompatibleConfig) {
    super();
    this.name = config.name;
    this.config = config;
  }

  public isAvailable(): boolean {
    const key = this.config.getApiKey();
    return Boolean(key && key.trim().length > 0 && !key.includes("your_api_key"));
  }

  public async generateResponse(
    messages: ChatMessage[],
    systemPrompt: string,
    options?: AIProviderOptions
  ): Promise<string> {
    const apiKey = this.config.getApiKey();
    if (!apiKey || !this.isAvailable()) {
      throw new Error(`[${this.name}] API key is not configured or is invalid.`);
    }

    const envOrConfigModel = this.config.getModel?.()?.replace(/['"]/g, "").trim();
    const model = options?.model || (envOrConfigModel ? envOrConfigModel : undefined) || this.config.defaultModel;
    const temperature = options?.temperature ?? this.config.defaultTemperature ?? 0.6;
    const maxTokens = options?.maxTokens ?? this.config.defaultMaxTokens ?? 1024;
    const timeoutMs = options?.timeoutMs ?? this.config.defaultTimeoutMs ?? 15000;

    const attemptedModels: string[] = (options as any)?._attemptedModels || [];
    if (!attemptedModels.includes(model)) {
      attemptedModels.push(model);
    }

    // Convert messages to OpenAI chat format
    const formattedMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

    if (systemPrompt && systemPrompt.trim()) {
      formattedMessages.push({ role: "system", content: systemPrompt.trim() });
    }

    for (const msg of messages) {
      if (msg.role === "user" || msg.role === "assistant" || msg.role === "system") {
        formattedMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    const requestBody = {
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
    };

    const endpoint = `${this.config.baseURL.replace(/\/+$/, "")}/chat/completions`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
          ...(this.config.extraHeaders || {}),
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch {
          // ignore non-json error responses
        }

        const errorMessage = errorData?.error?.message || errorData?.message || response.statusText;

        // Detect if error is related to model availability (404 not found, 400 decommissioned, or 429 rate limit)
        const isModelError =
          response.status === 404 ||
          response.status === 429 ||
          (response.status === 400 &&
            (typeof errorMessage === "string" &&
              (errorMessage.toLowerCase().includes("model") ||
                errorMessage.toLowerCase().includes("decommissioned"))));

        if (isModelError) {
          const candidateFallbacks = [
            ...(this.config.fallbackModels || []),
            this.config.fallbackModel,
          ].filter((m): m is string => Boolean(m) && !attemptedModels.includes(m!));

          if (candidateFallbacks.length > 0) {
            const nextModel = candidateFallbacks[0];
            console.warn(
              `[${this.name}] Model "${model}" unavailable (${response.status}: ${errorMessage}). Retrying with fallback model "${nextModel}"...`
            );
            return this.generateResponse(messages, systemPrompt, {
              ...options,
              model: nextModel,
              _attemptedModels: attemptedModels,
            } as any);
          }
        }

        if (response.status === 401) {
          throw new Error(`[${this.name}] Authentication failed (401): Invalid API key.`);
        } else if (response.status === 429) {
          throw new Error(`[${this.name}] Rate limit exceeded (429): ${errorMessage}`);
        } else if (response.status >= 500) {
          throw new Error(`[${this.name}] Upstream server error (${response.status}): ${errorMessage}`);
        } else {
          throw new Error(`[${this.name}] HTTP error ${response.status}: ${errorMessage}`);
        }
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (typeof content !== "string" || !content.trim()) {
        throw new Error(`[${this.name}] Received empty response from AI model.`);
      }

      return content.trim();
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        throw new Error(`[${this.name}] Request timed out after ${timeoutMs}ms.`);
      }
      throw err;
    }
  }
}
