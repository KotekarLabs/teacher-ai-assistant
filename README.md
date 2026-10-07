# Teacher AI Assistant

AI-powered daily workspace for teachers.

## Promise

PLAN → PREPARE → TEACH → PRACTICE → ASSESS → ANALYZE → IMPROVE.

## MVP

Authentication, teacher profile foundation, classes, AI lesson generation, worksheets, quizzes, homework, answer keys, content library, PDF export and basic analytics.

## Architecture

Teacher → Vercel → React/Vite → HTTPS → Node/Express → Services → Prisma → PostgreSQL.
AI requests use a server-side AIProvider abstraction.

## Repository

apps/web, apps/api, packages/shared, packages/contracts, packages/ai, packages/validation, packages/config, prisma, prompts, tests, docs, scripts, .github.

## Checks

pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e

## Hosting direction

Frontend: Vercel. Backend: Render or Railway. Database: managed PostgreSQL.

See docs/ for approved product and engineering specifications.
