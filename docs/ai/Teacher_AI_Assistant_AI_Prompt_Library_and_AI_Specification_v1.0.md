# Teacher AI Assistant — AI Prompt Library & AI Specification v1.0

## Pipeline

Teacher Request → API → Validation → Context Builder → Prompt Builder → AIProvider → Provider Adapter → LLM → Structured JSON → Parser → Schema Validation → Quality → Safety → Persistence → UI.

## Provider

generateLesson, generateWorksheet, generateQuiz, generateHomework, generateTeacherScript.

## Context priority

Explicit request; class/grade; curriculum; subject/topic; product rules; general educational assumptions.

## Prompt repository

prompts/shared, lesson, worksheet, quiz, homework, teacher-script. Version prompts.

## Quality

Relevance, accuracy, age fit, structure, practicality, clarity, assessment alignment, safety.

## Validation

Structural, semantic and safety validation.

## Safety

Avoid unsafe, discriminatory, explicit, harmful and age-inappropriate content.

## Prompt injection

Teacher-provided content is untrusted; system/product constraints remain authoritative.

## Evaluation

Maintain datasets for normal, edge, safety, malformed and curriculum cases.

## Cost/observability

Track provider/model/prompt version/latency/tokens/estimated cost where available.

## Failure

Bounded retries, timeouts, structured errors and safe UX.
