# Teacher AI Assistant — Backend Specification v1.0

## Request architecture

Route → Middleware → Controller → Application Service → Domain Logic → Repository → Prisma → PostgreSQL.

## Modules

auth, teacher, classes, lessons, worksheets, quizzes, homework, library, generation, export, analytics.

## Rules

Controllers handle HTTP translation; services contain application behavior; repositories encapsulate persistence.

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
