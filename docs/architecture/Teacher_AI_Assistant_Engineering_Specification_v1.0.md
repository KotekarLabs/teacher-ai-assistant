# Teacher AI Assistant — Engineering Specification v1.0
## Architecture
Modular monolith:
React/Vite → Node/Express → Application Services → Domain Logic → Repositories → Prisma → PostgreSQL.

AI:
Controller → Generation Service → Context Builder → Prompt Builder → Provider Adapter → LLM → Parser → Schema Validator → Quality/Safety → Persistence.

## Frontend
React, Vite, TypeScript, Tailwind, Router, TanStack Query, Zustand where justified, React Hook Form, Zod.

## Backend
Node, Express, TypeScript, Prisma, PostgreSQL.

## API
/api/v1 with standard responses/errors.

## AIProvider
generateLesson, generateWorksheet, generateQuiz, generateHomework, generateTeacherScript.

## Database
Core entities: User, TeacherProfile, Class, Lesson, Worksheet, WorksheetQuestion, Quiz, QuizQuestion, Homework, Content, GenerationRequest. UUIDs, UTC timestamps, ownership, indexes, archive semantics.

## Prompt architecture
Versioned shared/lesson/worksheet/quiz/homework/teacher-script prompts.

## Security
Auth, authorization, validation, rate limiting, secret management, least privilege, safe errors.

## Testing
Unit, component, API, integration, DB, AI evaluation, E2E, accessibility, security, performance.

## First vertical slice
Signup → Onboarding → Class → Topic → Lesson Generation → Validation → Editor → Save → Library → Reopen.
