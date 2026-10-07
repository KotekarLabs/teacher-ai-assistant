# Teacher AI Assistant — Backend Specification v1.0

## Request architecture

Route → Middleware → Controller → Application Service → Domain Logic → Repository → Prisma → PostgreSQL.

## Modules

auth, teacher, classes (class.routes.ts, class.controller.ts, class.service.ts, class.repository.ts), lessons (lesson.routes.ts, lesson.controller.ts, lesson.service.ts, lesson.repository.ts, generation-request.repository.ts), worksheets, quizzes, homework, library, generation, export, analytics.

## Rules

Controllers handle HTTP translation; services contain application behavior; repositories encapsulate persistence (e.g. ClassRepository and LessonRepository encapsulate Prisma queries).

## Auth

Server-controlled authentication; hashed passwords; reusable middleware; authenticated user context.

## Authorization

Verify ownership/role on protected resources; never trust client owner IDs.

## Validation

Validate all external inputs using Zod/shared validation.

## Errors

Structured safe errors; no stack traces, SQL errors or secrets.

## AI

Controller → Generation Service → Context → Prompt → Provider Adapter → LLM → Parser → Validation → Safety/Quality → Repository.

## Security

Secure auth, authorization, validation, rate limiting, CORS, security headers, secrets and least privilege.

## Deployment

Render or Railway initially; remain platform-neutral.
