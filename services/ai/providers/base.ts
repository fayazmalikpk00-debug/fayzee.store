import { AIProvider, AIProviderOptions, ChatMessage } from "../types";

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: string;

  abstract isAvailable(): boolean;

  abstract generateResponse(
    messages: ChatMessage[],
    systemPrompt: string,
    options?: AIProviderOptions
  ): Promise<string>;
}
