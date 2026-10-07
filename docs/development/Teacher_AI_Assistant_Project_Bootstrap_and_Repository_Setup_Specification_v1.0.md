# Teacher AI Assistant — Project Bootstrap & Repository Setup Specification v1.0

## Goal

Production-ready foundation without product features.

## Stack

pnpm + Turborepo; React/Vite/TypeScript/Tailwind; Node/Express/TypeScript; Prisma/PostgreSQL; Vitest/RTL/Playwright.

## Structure

apps/web, apps/api, packages/shared, packages/contracts, packages/ai, packages/validation, packages/config, prisma, prompts, tests, docs, scripts, .github.

## Backend health

GET /api/v1/health.

## AI

AIProvider abstraction only; no real provider/secrets.

## Bootstrap exclusions

No authentication, dashboard, onboarding, classes, lesson/worksheet/quiz/homework generation, billing, students, schools or real AI.

## Acceptance

Structure, dependency resolution, lint, typecheck, tests, build, E2E foundation, health endpoint and security baseline must pass.
