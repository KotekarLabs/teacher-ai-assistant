# Teacher AI Assistant — Testing & QA Specification v1.0
## Quality
A resource is quality when it is safe, accurate, relevant, age-appropriate, structured, editable and classroom-ready.

## Pyramid
Static → Unit → Component → API/Integration → DB → E2E → AI evaluation → Accessibility → Security → Performance.

## Tools
Vitest, React Testing Library, Playwright, accessibility tooling, Prisma test DB, CI.

## AI thresholds
Schema validation: 100%. Safety validation: 100%. Critical factual failures: 0 tolerated. Quality target ≥90%, calibrated with teacher evaluation.

## Security
Authentication, authorization, input validation, OWASP risks, secret exposure and dependency security.

## E2E
Critical journeys must be covered with Playwright.

## CI
Required quality checks must pass before release.

## Definition of Done
Implementation, tests, security review, documentation and acceptance criteria.
