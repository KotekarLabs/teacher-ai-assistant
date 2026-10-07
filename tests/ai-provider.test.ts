import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createAIProvider,
  MockAIProvider,
  OpenAIProvider,
  setAIProvider,
  getAIProvider,
} from "../packages/ai/index";
import type { LessonGenerationContext } from "../packages/ai/index";

describe("AIProvider and Adapter Architecture", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    setAIProvider(new MockAIProvider());
    vi.restoreAllMocks();
  });

  it("should instantiate MockAIProvider by default or when AI_PROVIDER is MOCK", () => {
    const provider = createAIProvider({ provider: "MOCK" });
    expect(provider).toBeInstanceOf(MockAIProvider);
  });

  it("should throw a clear configuration error if OPENAI provider is requested without an API key", () => {
    delete process.env.OPENAI_API_KEY;
    expect(() => createAIProvider({ provider: "OPENAI" })).toThrow(
      /OPENAI_API_KEY is required/i,
    );
  });

  it("should instantiate OpenAIProvider when configured with an API key", () => {
    const provider = createAIProvider({
      provider: "OPENAI",
      apiKey: "sk-test-mock-key-12345",
      model: "gpt-4o-mini",
    });
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it("OpenAIProvider sends structured chat completions request and parses response", async () => {
    const mockContext: LessonGenerationContext = {
      classId: "class-123",
      grade: "4",
      subject: "Science",
      topic: "The Water Cycle",
      durationMinutes: 40,
      difficulty: "MEDIUM",
    };

    const mockJsonResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "The Water Cycle",
              overview: "Lesson on evaporation, condensation, precipitation.",
              learningObjectives: ["Define evaporation"],
              prerequisites: ["States of matter"],
              introduction: "Warmup question",
              teacherExplanation: "Detailed explanation of the cycle...",
              examples: ["Rain from clouds"],
              classroomActivity: {
                title: "Water in a Bag",
                instructions: "Hang bag by window",
                durationMinutes: 10,
              },
              practice: ["Worksheet Q1"],
              quickAssessment: ["Exit question"],
              homework: "Read page 20",
              teacherScript: "Good morning class!",
            }),
          },
        },
      ],
      usage: {
        prompt_tokens: 350,
        completion_tokens: 450,
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJsonResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new OpenAIProvider({
      apiKey: "sk-test-mock-key",
      model: "gpt-4o-mini",
    });

    const result = await provider.generateLesson(mockContext);

    expect(fetchMock).toHaveBeenCalled();
    expect(result.provider).toBe("OPENAI");
    expect(result.model).toBe("gpt-4o-mini");
    expect(result.inputTokens).toBe(350);
    expect(result.outputTokens).toBe(450);
    expect(result.parsedContent?.title).toBe("The Water Cycle");
  });

  it("allows seamless swapping of provider via setAIProvider without changing services", () => {
    const customMock: any = {
      generateLesson: vi.fn().mockResolvedValue({
        rawOutput: "{}",
        provider: "CUSTOM_ADAPTER",
      }),
    };

    setAIProvider(customMock);
    const resolved = getAIProvider();
    expect(resolved).toBe(customMock);
  });
});
