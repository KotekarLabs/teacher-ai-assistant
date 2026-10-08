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

  it("MockAIProvider generates structured Worksheet content with questions", async () => {
    const provider = new MockAIProvider();
    const result = await provider.generateWorksheet({
      classId: "class-1",
      grade: "5",
      subject: "Science",
      topic: "Plant Cells",
      difficulty: "MEDIUM",
      questionCount: 4,
      questionTypes: ["MULTIPLE_CHOICE", "SHORT_ANSWER"],
    });

    expect(result.provider).toBe("MOCK");
    expect(result.parsedContent).toBeDefined();
    expect(result.parsedContent?.questions).toHaveLength(4);
    expect(result.parsedContent?.title).toContain("Plant Cells");
  });

  it("OpenAIProvider generates structured Worksheet content", async () => {
    const mockJsonResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "Plant Cells Worksheet",
              subject: "Science",
              topic: "Plant Cells",
              instructions: "Answer all questions.",
              estimatedTimeMinutes: 20,
              questions: [
                {
                  position: 1,
                  type: "MULTIPLE_CHOICE",
                  question: "What gives plant cells their green color?",
                  options: ["Chloroplasts", "Mitochondria", "Nucleus", "Vacuole"],
                  expectedAnswer: "Chloroplasts",
                  marks: 1,
                  difficulty: "EASY",
                },
              ],
            }),
          },
        },
      ],
      usage: {
        prompt_tokens: 280,
        completion_tokens: 320,
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJsonResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new OpenAIProvider({
      apiKey: "sk-test-key",
      model: "gpt-4o-mini",
    });

    const result = await provider.generateWorksheet({
      classId: "class-1",
      grade: "5",
      subject: "Science",
      topic: "Plant Cells",
      difficulty: "MEDIUM",
      questionCount: 1,
      questionTypes: ["MULTIPLE_CHOICE"],
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(result.provider).toBe("OPENAI");
    expect(result.parsedContent?.questions).toHaveLength(1);
    expect(result.parsedContent?.questions[0].expectedAnswer).toBe(
      "Chloroplasts",
    );
  });

  it("MockAIProvider generates structured Quiz content with questions and marks", async () => {
    const provider = new MockAIProvider();
    const result = await provider.generateQuiz({
      classId: "class-1",
      grade: "8",
      subject: "Science",
      topic: "Chemical Reactions",
      difficulty: "MEDIUM",
      questionCount: 4,
      questionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
      durationMinutes: 25,
    });

    expect(result.provider).toBe("MOCK");
    expect(result.parsedContent).toBeDefined();
    expect(result.parsedContent?.questions).toHaveLength(4);
    expect(result.parsedContent?.title).toContain("Chemical Reactions");
    expect(result.parsedContent?.durationMinutes).toBe(25);
    expect(result.parsedContent?.totalMarks).toBeGreaterThanOrEqual(4);
  });

  it("OpenAIProvider generates structured Quiz content", async () => {
    const mockJsonResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "Chemical Reactions Quiz",
              subject: "Science",
              topic: "Chemical Reactions",
              difficulty: "MEDIUM",
              durationMinutes: 20,
              instructions: "Answer all questions.",
              totalMarks: 2,
              questions: [
                {
                  position: 1,
                  type: "MULTIPLE_CHOICE",
                  question: "What is an exothermic reaction?",
                  options: ["Releases heat", "Absorbs heat", "No temperature change", "Creates mass"],
                  correctAnswer: "Releases heat",
                  explanation: "Exothermic reactions release thermal energy.",
                  marks: 1,
                  difficulty: "MEDIUM",
                },
                {
                  position: 2,
                  type: "TRUE_FALSE",
                  question: "Combustion is an example of an exothermic reaction.",
                  options: ["True", "False"],
                  correctAnswer: "True",
                  explanation: "Burning generates heat and light.",
                  marks: 1,
                  difficulty: "EASY",
                },
              ],
            }),
          },
        },
      ],
      usage: {
        prompt_tokens: 310,
        completion_tokens: 360,
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJsonResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new OpenAIProvider({
      apiKey: "sk-test-key",
      model: "gpt-4o-mini",
    });

    const result = await provider.generateQuiz({
      classId: "class-1",
      grade: "8",
      subject: "Science",
      topic: "Chemical Reactions",
      difficulty: "MEDIUM",
      questionCount: 2,
      questionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(result.provider).toBe("OPENAI");
    expect(result.parsedContent?.questions).toHaveLength(2);
    expect(result.parsedContent?.questions[0].correctAnswer).toBe("Releases heat");
    expect(result.parsedContent?.questions[0].explanation).toBe("Exothermic reactions release thermal energy.");
  });

  it("allows seamless swapping of provider via setAIProvider without changing services", () => {
    const customMock: any = {
      generateLesson: vi.fn().mockResolvedValue({
        rawOutput: "{}",
        provider: "CUSTOM_ADAPTER",
      }),
      generateWorksheet: vi.fn().mockResolvedValue({
        rawOutput: "{}",
        provider: "CUSTOM_ADAPTER",
      }),
      generateQuiz: vi.fn().mockResolvedValue({
        rawOutput: "{}",
        provider: "CUSTOM_ADAPTER",
      }),
    };

    setAIProvider(customMock);
    const resolved = getAIProvider();
    expect(resolved).toBe(customMock);
  });
});
