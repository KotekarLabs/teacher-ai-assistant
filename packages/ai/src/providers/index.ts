import type { AIProvider } from "../types";
import { MockAIProvider } from "./mockProvider";
import { OpenAIProvider, type OpenAIProviderOptions } from "./openaiProvider";

export interface AIProviderConfig {
  provider?: "MOCK" | "OPENAI" | string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export function createAIProvider(options?: AIProviderConfig): AIProvider {
  const providerType = (
    options?.provider ||
    process.env.AI_PROVIDER ||
    "MOCK"
  ).toUpperCase();

  if (providerType === "OPENAI") {
    const apiKey = options?.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required when AI_PROVIDER is set to OPENAI",
      );
    }
    return new OpenAIProvider({
      apiKey,
      model: options?.model || process.env.OPENAI_MODEL || "gpt-4o-mini",
      baseUrl: options?.baseUrl,
    });
  }

  return new MockAIProvider();
}

let defaultProvider: AIProvider = createAIProvider();

export function getAIProvider(): AIProvider {
  return defaultProvider;
}

export function setAIProvider(provider: AIProvider): void {
  defaultProvider = provider;
}

export { MockAIProvider, OpenAIProvider, type OpenAIProviderOptions };
