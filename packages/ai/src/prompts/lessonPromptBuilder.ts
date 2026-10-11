import type { LessonGenerationContext } from "../types";

export class LessonPromptBuilder {
  static readonly PROMPT_VERSION = "lesson/generate.v1";

  static buildSystemPrompt(): string {
    return `You are Teacher AI Assistant, an expert pedagogical AI partner designed specifically for K-12 educators.
Your mission is to produce rigorous, engaging, classroom-ready lesson plans that save teachers time and delight students.

## Child Safety & Standards
- Zero tolerance for profanity, explicit language, hate speech, or violent imagery.
- Never request or generate real student PII.
- Ensure all activities are physically safe and require adult supervision when necessary.

## Pedagogical Quality
- 2-4 concrete, measurable learning objectives using active Bloom's Taxonomy verbs (e.g., analyze, calculate, compare, explain).
- Required materials: 2-5 specific physical or digital classroom tools, equipment, or handouts.
- Realistic phase pacing breakdown (introduction, direct instruction, activity, practice, assessment) whose sum balances total lesson duration.
- Hands-on interactive classroom activity.
- Actionable differentiation: scaffolding support for struggling learners and extension challenges for advanced learners.
- Clear concept progression and actionable teacher talking points.

## Language & Localization
- Deliver all instructional text, scripts, and classroom content in the specified Output Language (defaulting to English if not specified).

## Output Format
- Return ONLY valid JSON matching the target schema.
- No markdown wrappers outside the JSON string.`;
  }

  static buildUserPrompt(context: LessonGenerationContext): string {
    const langDirective =
      context.preferredLanguage &&
      context.preferredLanguage.toLowerCase() !== "english"
        ? `- Output Language: ${context.preferredLanguage} (Generate all titles, scripts, explanations, and student activities in ${context.preferredLanguage})\n`
        : "";
    const roleDirective = context.teachingRole
      ? `- Target Educator Role: ${context.teachingRole}\n`
      : "";
    const expDirective = context.experienceLevel
      ? `- Educator Experience Level: ${context.experienceLevel}\n`
      : "";

    return `Generate a complete, structured Lesson Plan for:
- Grade Level: ${context.grade}
- Subject: ${context.subject}
- Topic: ${context.topic}
- Curriculum Board: ${context.curriculumBoard || "General"}
- Total Duration: ${context.durationMinutes} minutes
- Difficulty Level: ${context.difficulty}
${langDirective}${roleDirective}${expDirective}- Special Teacher Instructions: ${context.teacherInstructions || "None provided"}

Required JSON Schema:
{
  "title": string,
  "overview": string,
  "learningObjectives": string[],
  "prerequisites": string[],
  "introduction": string,
  "teacherExplanation": string,
  "examples": string[],
  "classroomActivity": {
    "title": string,
    "instructions": string,
    "durationMinutes": number
  },
  "practice": string[],
  "quickAssessment": string[],
  "homework": string,
  "teacherScript": string,
  "materials": string[],
  "differentiation": {
    "support": string,
    "extension": string
  },
  "pacingBreakdown": {
    "introductionMinutes": number,
    "directInstructionMinutes": number,
    "activityMinutes": number,
    "practiceMinutes": number,
    "assessmentMinutes": number
  }
}`;
  }
}
