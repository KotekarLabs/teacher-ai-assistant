# Teacher AI Assistant — Frontend Engineering Specification v1.0

## Stack

React, Vite, TypeScript, Tailwind, React Router, TanStack Query, Zustand, React Hook Form, Zod, Vitest, RTL, Playwright.

## Structure

apps/web/src/{api,assets,components/{common,dashboard,layout},pages,store,styles}

## Layout & Navigation

AppShell: Top Header (mobile hamburger toggle, identity badge, logout), Sidebar (desktop fixed 64px width, navigation links, accessible disabled "Coming Soon" indicators), MobileNav (slide-over drawer with backdrop & keyboard traps).

## Routes

/, /login, /signup, /onboarding, /dashboard (inside ProtectedRoute + AppShell), future generation & resource routes (/create, /library, /classes, /profile, /settings).

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
