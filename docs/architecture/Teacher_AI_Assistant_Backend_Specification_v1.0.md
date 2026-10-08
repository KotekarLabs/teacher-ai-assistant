# Teacher AI Assistant — Backend Specification v1.0

## Request architecture

Route → Middleware → Controller → Application Service → Domain Logic → Repository → Prisma → PostgreSQL.

## Modules

auth, teacher, classes (class.routes.ts, class.controller.ts, class.service.ts, class.repository.ts), lessons (lesson.routes.ts, lesson.controller.ts, lesson.service.ts, lesson.repository.ts, generation-request.repository.ts), worksheets (worksheet.routes.ts, worksheet.controller.ts, worksheet.service.ts, worksheet.repository.ts), quizzes (quiz.routes.ts, quiz.controller.ts, quiz.service.ts, quiz.repository.ts), homework (homework.routes.ts, homework.controller.ts, homework.service.ts, homework.repository.ts), library / content catalog (content.routes.ts, content.controller.ts, content.service.ts, content.repository.ts, content-sync.service.ts), generation, export, analytics.

## Rules

Controllers handle HTTP translation; services contain application behavior (including server-authoritative scoring calculations, atomic transaction orchestration, Content synchronization, and domain-specific duplication/archival cascades); repositories encapsulate persistence (e.g. ClassRepository, LessonRepository, WorksheetRepository, QuizRepository, HomeworkRepository, and ContentRepository encapsulate Prisma queries and atomic transaction client support).

## Auth

Server-controlled authentication; hashed passwords; reusable middleware; authenticated user context.

## Authorization

Verify ownership/role on protected resources; never trust client owner IDs.

## Validation

Validate all external inputs using Zod/shared validation.

## Errors

Structured safe errors; no stack traces, SQL errors or secrets.

## AI

Controller → Generation Service → Context → Prompt → Provider Adapter → LLM → Parser → Validation → Safety/Quality → Server-Authoritative Scoring → Repository.

## Security

Secure auth, authorization, validation, rate limiting, CORS, security headers, secrets and least privilege.

## Deployment

Render or Railway initially; remain platform-neutral.
