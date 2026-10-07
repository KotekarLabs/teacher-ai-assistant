# Teacher AI Assistant — AGENTS.md

## Purpose

Permanent engineering rules for AI coding agents.

## Source of truth

1. Product Owner decisions
2. Product Bible / PRD
3. Engineering specifications
4. Database/API/UI/AI/DevOps/QA specifications
5. AGENTS.md
6. Existing code/tests
7. Agent assumptions

## Rules

- Plan before coding; use small, reviewable vertical slices.
- Preserve the modular monolith.
- Never introduce microservices without approval.
- Never store plaintext passwords or commit secrets.
- AI provider secrets remain server-side.
- Validate external input.
- Backend is authoritative for authorization.
- Keep API/database/prompt/documentation contracts synchronized.
- Never weaken tests or hide errors.
- Do not commit/push automatically unless explicitly instructed.
- Run relevant lint/typecheck/tests/build before declaring completion.

## Stack

Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand where justified, React Hook Form, Zod.
Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL.
Testing: Vitest, React Testing Library, Playwright.

## AI

Use an application-owned AIProvider abstraction. Raw LLM output is untrusted until parsed, schema-validated, safety-checked and quality-checked.

## Workflow

Read docs → inspect implementation → identify impact → plan → implement smallest change → test → security/architecture review → sync docs/contracts → report.

## Stop conditions

Stop for destructive migrations, major architecture changes, security changes, external services, or scope conflicts.

## Definition of Done

Implementation matches approved specification; relevant checks pass; no secrets/unrelated features; contracts and docs are synchronized; verification is reported.
