import type {
  LessonContent,
  WorksheetContent,
  QuizContent,
  HomeworkContent,
} from "@teacher-ai/contracts";
import type {
  AIProvider,
  LessonGenerationContext,
  LessonGenerationResult,
  WorksheetGenerationContext,
  WorksheetGenerationResult,
  QuizGenerationContext,
  QuizGenerationResult,
  HomeworkGenerationContext,
  HomeworkGenerationResult,
} from "../types";
import { LessonPromptBuilder } from "../prompts/lessonPromptBuilder";
import { WorksheetPromptBuilder } from "../prompts/worksheetPromptBuilder";
import { QuizPromptBuilder } from "../prompts/quizPromptBuilder";
import { HomeworkPromptBuilder } from "../prompts/homeworkPromptBuilder";

export class MockAIProvider implements AIProvider {
  async generateLesson(
    context: LessonGenerationContext,
  ): Promise<LessonGenerationResult> {
    const startTime = Date.now();

    const structuredContent: LessonContent = {
      title: `${context.topic} — Grade ${context.grade} ${context.subject}`,
      overview: `A comprehensive ${context.durationMinutes}-minute lesson designed to teach ${context.topic} to Grade ${context.grade} students with engaging conceptual breakdown and hands-on practice.`,
      learningObjectives: [
        `Understand the core principles and key mechanisms of ${context.topic}.`,
        `Identify real-world examples and applications of ${context.topic}.`,
        `Demonstrate comprehension by solving classroom problems and answering discussion questions.`,
      ],
      prerequisites: [
        `Basic foundational understanding of Grade ${context.grade} ${context.subject} concepts.`,
      ],
      introduction: `Begin by asking students an engaging hook question related to ${context.topic} in daily life. Connect their existing observations to today's core concept.`,
      teacherExplanation: `Explain ${context.topic} step-by-step using clear, grade-appropriate language. Highlight key terminology, cause-and-effect relationships, and practical significance.`,
      examples: [
        `Example 1: Demonstrating ${context.topic} in an everyday classroom scenario.`,
        `Example 2: Analyzing a standard step-by-step problem related to ${context.topic}.`,
      ],
      classroomActivity: {
        title: `Interactive ${context.topic} Exploration`,
        instructions: `Divide students into small groups. Have them investigate a guided scenario on ${context.topic}, record their findings, and present one key insight to the class.`,
        durationMinutes: Math.min(15, Math.floor(context.durationMinutes / 3)),
      },
      practice: [
        `Guided Practice: Complete a structured worksheet problem together on the board.`,
        `Independent Practice: Students solve 2 practice questions individually.`,
      ],
      quickAssessment: [
        `Quick formative check: What is the most important takeaway from today's lesson on ${context.topic}?`,
        `Exit ticket question to evaluate student mastery before conclusion.`,
      ],
      homework: `Review class notes and complete 3 follow-up exercise questions on ${context.topic}.`,
      teacherScript: `Good morning class! Today we are diving into an exciting topic: ${context.topic}. Look around you—how do you see this in action every day? Let's find out together!`,
    };

    const rawOutput = JSON.stringify(structuredContent, null, 2);
    const latencyMs = Math.max(15, Date.now() - startTime);

    return {
      rawOutput,
      parsedContent: structuredContent,
      provider: "MOCK",
      model: "mock-pedagogy-v1",
      promptVersion: LessonPromptBuilder.PROMPT_VERSION,
      latencyMs,
      inputTokens: 450,
      outputTokens: 620,
      estimatedCost: 0.002,
    };
  }

  async generateWorksheet(
    context: WorksheetGenerationContext,
  ): Promise<WorksheetGenerationResult> {
    const startTime = Date.now();

    const questions: WorksheetContent["questions"] = [];
    const count = context.questionCount || 5;
    const types = context.questionTypes.length > 0
      ? context.questionTypes
      : ["MULTIPLE_CHOICE", "SHORT_ANSWER"];

    for (let i = 1; i <= count; i++) {
      const type = types[(i - 1) % types.length];
      if (type === "MULTIPLE_CHOICE") {
        questions.push({
          position: i,
          type: "MULTIPLE_CHOICE",
          question: `Which of the following best describes a key principle of ${context.topic} in Grade ${context.grade} ${context.subject}?`,
          options: [
            `Option A: The primary mechanism of ${context.topic}`,
            `Option B: An unrelated secondary phenomenon`,
            `Option C: A misconception regarding ${context.topic}`,
            `Option D: None of the above`,
          ],
          expectedAnswer: `Option A: The primary mechanism of ${context.topic}`,
          marks: 1,
          difficulty: "MEDIUM",
        });
      } else if (type === "TRUE_FALSE") {
        questions.push({
          position: i,
          type: "TRUE_FALSE",
          question: `True or False: ${context.topic} plays an essential role in Grade ${context.grade} ${context.subject}.`,
          options: ["True", "False"],
          expectedAnswer: "True",
          marks: 1,
          difficulty: "EASY",
        });
      } else if (type === "FILL_IN_THE_BLANK") {
        questions.push({
          position: i,
          type: "FILL_IN_THE_BLANK",
          question: `The core process in ${context.topic} is known as ___ in modern scientific studies.`,
          options: [],
          expectedAnswer: `${context.topic} Principle`,
          marks: 1,
          difficulty: "MEDIUM",
        });
      } else if (type === "MATCH_THE_FOLLOWING") {
        questions.push({
          position: i,
          type: "MATCH_THE_FOLLOWING",
          question: `Match each concept of ${context.topic} (1. Definition, 2. Example) with its corresponding definition (A. Core idea, B. Practical demonstration).`,
          options: ["1-A, 2-B", "1-B, 2-A"],
          expectedAnswer: "1-A, 2-B",
          marks: 2,
          difficulty: "MEDIUM",
        });
      } else {
        // SHORT_ANSWER
        questions.push({
          position: i,
          type: "SHORT_ANSWER",
          question: `In 1-2 sentences, explain how ${context.topic} applies to real-world scenarios.`,
          options: [],
          expectedAnswer: `${context.topic} allows us to understand fundamental patterns in ${context.subject} and apply them to solve practical problems.`,
          marks: 2,
          difficulty: "HARD",
        });
      }
    }

    const structuredContent: WorksheetContent = {
      title: `${context.topic} Practice Worksheet — Grade ${context.grade}`,
      subject: context.subject,
      topic: context.topic,
      instructions:
        context.teacherInstructions ||
        "Answer all questions thoroughly. Show your work where required.",
      estimatedTimeMinutes: context.estimatedTimeMinutes || 30,
      questions,
    };

    const rawOutput = JSON.stringify(structuredContent, null, 2);
    const latencyMs = Math.max(15, Date.now() - startTime);

    return {
      rawOutput,
      parsedContent: structuredContent,
      provider: "MOCK",
      model: "mock-pedagogy-v1",
      promptVersion: WorksheetPromptBuilder.PROMPT_VERSION,
      latencyMs,
      inputTokens: 380,
      outputTokens: 540,
      estimatedCost: 0.0018,
    };
  }

  async generateQuiz(
    context: QuizGenerationContext,
  ): Promise<QuizGenerationResult> {
    const startTime = Date.now();

    const questions: QuizContent["questions"] = [];
    const count = context.questionCount || 5;
    const types = context.questionTypes.length > 0
      ? context.questionTypes
      : ["MULTIPLE_CHOICE", "TRUE_FALSE"];

    for (let i = 1; i <= count; i++) {
      const type = types[(i - 1) % types.length];
      if (type === "MULTIPLE_CHOICE") {
        const optionA = `Core mechanism of ${context.topic}`;
        const optionB = `Secondary effect of ${context.topic}`;
        const optionC = `Historical observation in ${context.subject}`;
        const optionD = `Common misconception in ${context.topic}`;
        questions.push({
          position: i,
          type: "MULTIPLE_CHOICE",
          question: `Which statement accurately describes the main characteristic of ${context.topic} in Grade ${context.grade} ${context.subject}?`,
          options: [optionA, optionB, optionC, optionD],
          correctAnswer: optionA,
          explanation: `${optionA} correctly identifies the fundamental principle of ${context.topic} as taught in Grade ${context.grade}.`,
          marks: 1,
          difficulty: "MEDIUM",
        });
      } else if (type === "TRUE_FALSE") {
        questions.push({
          position: i,
          type: "TRUE_FALSE",
          question: `True or False: ${context.topic} is a foundational concept in Grade ${context.grade} ${context.subject}.`,
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: `In Grade ${context.grade} ${context.subject}, ${context.topic} serves as a central foundational principle.`,
          marks: 1,
          difficulty: "EASY",
        });
      } else if (type === "FILL_IN_THE_BLANK") {
        questions.push({
          position: i,
          type: "FILL_IN_THE_BLANK",
          question: `In ${context.subject}, the study of ${context.topic} is primarily centered on the concept of ___.`,
          options: [],
          correctAnswer: `${context.topic} Fundamentals`,
          explanation: `${context.topic} Fundamentals represents the core terminology for this concept.`,
          marks: 1,
          difficulty: "MEDIUM",
        });
      } else {
        // SHORT_ANSWER
        questions.push({
          position: i,
          type: "SHORT_ANSWER",
          question: `Briefly define ${context.topic} and state one key application in ${context.subject}.`,
          options: [],
          correctAnswer: `${context.topic} is a core principle in ${context.subject} used to solve analytical problems.`,
          explanation: `Students should identify the core definition and mention at least one direct application in ${context.subject}.`,
          marks: 2,
          difficulty: "HARD",
        });
      }
    }

    const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);

    const structuredContent: QuizContent = {
      title: `${context.topic} Assessment Quiz — Grade ${context.grade}`,
      subject: context.subject,
      topic: context.topic,
      difficulty: (context.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
      durationMinutes: context.durationMinutes || 20,
      instructions:
        context.teacherInstructions ||
        "Read each question carefully and select or write the best answer.",
      totalMarks,
      questions,
    };

    const rawOutput = JSON.stringify(structuredContent, null, 2);
    const latencyMs = Math.max(15, Date.now() - startTime);

    return {
      rawOutput,
      parsedContent: structuredContent,
      provider: "MOCK",
      model: "mock-pedagogy-v1",
      promptVersion: QuizPromptBuilder.PROMPT_VERSION,
      latencyMs,
      inputTokens: 410,
      outputTokens: 580,
      estimatedCost: 0.0019,
    };
  }

  async generateHomework(
    context: HomeworkGenerationContext,
  ): Promise<HomeworkGenerationResult> {
    const startTime = Date.now();

    const tasks: HomeworkContent["tasks"] = [];
    const count = context.taskCount || 3;
    const types =
      context.taskTypes && context.taskTypes.length > 0
        ? context.taskTypes
        : ["PRACTICE", "WRITTEN"];

    for (let i = 1; i <= count; i++) {
      const type = types[(i - 1) % types.length];
      if (type === "PRACTICE") {
        tasks.push({
          position: i,
          title: `Practice Application: ${context.topic}`,
          description: `Solve the assigned 3 numerical/conceptual practice problems on ${context.topic}. Write out all steps clearly.`,
          type: "PRACTICE",
        });
      } else if (type === "WRITTEN") {
        tasks.push({
          position: i,
          title: `Summary Reflection: ${context.topic}`,
          description: `In 4-5 sentences, summarize the key takeaway of ${context.topic} and how it relates to our previous lessons in Grade ${context.grade} ${context.subject}.`,
          type: "WRITTEN",
        });
      } else if (type === "ACTIVITY") {
        tasks.push({
          position: i,
          title: `Home Observation Activity`,
          description: `Observe one example of ${context.topic} in your home or daily surroundings. Note down 3 key observations in your science log.`,
          type: "ACTIVITY",
        });
      } else if (type === "CREATIVE") {
        tasks.push({
          position: i,
          title: `Concept Diagram & Mind Map`,
          description: `Draw and color a neat, labeled mind map illustrating the main parts and mechanisms of ${context.topic}.`,
          type: "CREATIVE",
        });
      } else {
        // SHORT_ANSWER
        tasks.push({
          position: i,
          title: `Inquiry Questions on ${context.topic}`,
          description: `Answer 2 short conceptual questions exploring the causes and effects of ${context.topic}.`,
          type: "SHORT_ANSWER",
        });
      }
    }

    const structuredContent: HomeworkContent = {
      title: `${context.topic} Homework Assignment — Grade ${context.grade}`,
      subject: context.subject,
      topic: context.topic,
      difficulty: (context.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
      estimatedTimeMinutes: context.estimatedTimeMinutes || 30,
      instructions:
        context.teacherInstructions ||
        "Complete all tasks neatly in your homework notebook. Review class notes if needed.",
      tasks,
    };

    const rawOutput = JSON.stringify(structuredContent, null, 2);
    const latencyMs = Math.max(15, Date.now() - startTime);

    return {
      rawOutput,
      parsedContent: structuredContent,
      provider: "MOCK",
      model: "mock-pedagogy-v1",
      promptVersion: HomeworkPromptBuilder.PROMPT_VERSION,
      latencyMs,
      inputTokens: 390,
      outputTokens: 490,
      estimatedCost: 0.0016,
    };
  }
}
