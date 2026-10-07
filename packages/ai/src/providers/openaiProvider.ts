import type { LessonContent, WorksheetContent } from "@teacher-ai/contracts";
import type {
  AIProvider,
  LessonGenerationContext,
  LessonGenerationResult,
  WorksheetGenerationContext,
  WorksheetGenerationResult,
} from "../types";
import { LessonPromptBuilder } from "../prompts/lessonPromptBuilder";
import { LessonOutputValidator } from "../validation/lessonOutputValidator";
import { WorksheetPromptBuilder } from "../prompts/worksheetPromptBuilder";
import { WorksheetOutputValidator } from "../validation/worksheetOutputValidator";

export interface OpenAIProviderOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

export class OpenAIProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(options: OpenAIProviderOptions) {
    if (!options.apiKey) {
      throw new Error("OpenAI API key must be provided");
    }
    this.apiKey = options.apiKey;
    this.model = options.model || "gpt-4o-mini";
    this.baseUrl = options.baseUrl || "https://api.openai.com/v1";
  }

  async generateLesson(
    context: LessonGenerationContext,
  ): Promise<LessonGenerationResult> {
    const startTime = Date.now();
    const systemPrompt = LessonPromptBuilder.buildSystemPrompt();
    const userPrompt = LessonPromptBuilder.buildUserPrompt(context);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      throw new Error(`OpenAI connection failed: ${msg}`, { cause: err });
    }

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {
        // ignore
      }
      throw new Error(
        `OpenAI API request failed with status ${response.status}: ${errorBody || response.statusText}`,
      );
    }

    const data = (await response.json()) as OpenAIChatResponse;
    const latencyMs = Math.max(1, Date.now() - startTime);
    const rawOutput = data.choices?.[0]?.message?.content || "{}";
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;

    // Approximate cost: gpt-4o-mini is ~$0.15 / 1M input, ~$0.60 / 1M output
    const estimatedCost =
      (inputTokens / 1_000_000) * 0.15 + (outputTokens / 1_000_000) * 0.6;

    let parsedContent: LessonContent | undefined = undefined;
    try {
      const parsed = LessonOutputValidator.parseJson(rawOutput);
      const validation = LessonOutputValidator.validateSchema(parsed);
      if (validation.success && validation.data) {
        parsedContent = validation.data;
      }
    } catch {
      // Handled in validation pipeline
    }

    return {
      rawOutput,
      parsedContent,
      provider: "OPENAI",
      model: this.model,
      promptVersion: LessonPromptBuilder.PROMPT_VERSION,
      latencyMs,
      inputTokens,
      outputTokens,
      estimatedCost,
    };
  }

  async generateWorksheet(
    context: WorksheetGenerationContext,
  ): Promise<WorksheetGenerationResult> {
    const startTime = Date.now();
    const systemPrompt = WorksheetPromptBuilder.buildSystemPrompt();
    const userPrompt = WorksheetPromptBuilder.buildUserPrompt(context);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      throw new Error(`OpenAI connection failed: ${msg}`, { cause: err });
    }

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {
        // ignore
      }
      throw new Error(
        `OpenAI API request failed with status ${response.status}: ${errorBody || response.statusText}`,
      );
    }

    const data = (await response.json()) as OpenAIChatResponse;
    const latencyMs = Math.max(1, Date.now() - startTime);
    const rawOutput = data.choices?.[0]?.message?.content || "{}";
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;

    const estimatedCost =
      (inputTokens / 1_000_000) * 0.15 + (outputTokens / 1_000_000) * 0.6;

    let parsedContent: WorksheetContent | undefined = undefined;
    try {
      const parsed = WorksheetOutputValidator.parseJson(rawOutput);
      const validation = WorksheetOutputValidator.validateSchema(parsed);
      if (validation.success && validation.data) {
        parsedContent = validation.data;
      }
    } catch {
      // Handled in validation pipeline
    }

    return {
      rawOutput,
      parsedContent,
      provider: "OPENAI",
      model: this.model,
      promptVersion: WorksheetPromptBuilder.PROMPT_VERSION,
      latencyMs,
      inputTokens,
      outputTokens,
      estimatedCost,
    };
  }
}
