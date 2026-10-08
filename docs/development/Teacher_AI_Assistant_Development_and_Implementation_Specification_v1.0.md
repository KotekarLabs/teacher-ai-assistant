# Teacher AI Assistant — Development & Implementation Specification v1.0

## Build order

1. repository foundation (completed)
2. authentication (completed)
3. teacher context/profile (completed)
4. classes (Class Management Foundation completed)
5. first lesson vertical slice (Lesson Generation Foundation completed: AI pipeline, prompt architecture, validation, editor, save/reopen, whole-lesson regeneration)
6. worksheet (Worksheet Generation Foundation completed: AI pipeline, prompt architecture, validation, questions editor, save/reopen, archive)
7. quiz (Quiz Generation Foundation completed: AI pipeline, prompt architecture, validation, answer consistency, server-authoritative scoring, editor, save/reopen, archive)
8. homework
9. library
10. export
11. analytics
12. billing foundation

## Feature workflow

Read spec → identify dependencies → update schema/contracts if required → backend → frontend → tests → browser verification → docs → diff review.

## AI workflow

Output contract → prompt → context → provider → parse → validate → safety/quality → persist → render/edit → evaluate.

## Testing

Every vertical slice requires appropriate unit/API/component/integration/E2E coverage.

## CI

Lint, typecheck, tests and build.

## Definition of Done

Behavior matches spec; tests/security pass; contracts/docs synchronized; deployment behavior understood.
