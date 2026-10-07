# Teacher AI Assistant — Frontend Engineering Specification v1.0

## Stack

React, Vite, TypeScript, Tailwind, React Router, TanStack Query, Zustand, React Hook Form, Zod, Vitest, RTL, Playwright.

## Structure

apps/web/src/{app,pages,features,components,hooks,stores,api,schemas,types,utils,constants,analytics,styles}

## Routes

/, /login, /signup, /onboarding, /app, /app/dashboard, /app/create, /app/create/lesson, /app/create/worksheet, /app/create/quiz, /app/create/homework, resource routes, /app/library, /app/classes, /app/profile, /app/settings, /app/billing.

## State

TanStack Query for server state; local state/Zustand only where justified.

## API modules

auth.api.ts, teacher.api.ts, classes.api.ts, lessons.api.ts, worksheets.api.ts, quizzes.api.ts, homework.api.ts, library.api.ts, analytics.api.ts.

## Forms

React Hook Form + Zod; backend authoritative.

## AI UX

Generation state, retry, safe errors, editable output and targeted regeneration.

## Accessibility

Keyboard navigation, focus, labels, semantic controls, accessible errors, contrast.

## Security

Do not use unsafe browser storage for sensitive auth credentials; backend is source of truth.
