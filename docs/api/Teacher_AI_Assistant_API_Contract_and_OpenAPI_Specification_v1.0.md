# Teacher AI Assistant — API Contract & OpenAPI Specification v1.0

## Base

/api/v1.

## Standard contract

Consistent success envelope and safe structured error envelope.

## Auth

POST /auth/signup
POST /auth/login
POST /auth/logout
GET /auth/me -> Returns { user, profile, hasCompletedOnboarding }

## Teacher Profile

GET /teacher/profile -> Retrieves authenticated teacher's profile (404 if not found)
POST /teacher/profile -> Creates profile (409 if already exists)
PATCH /teacher/profile -> Updates existing profile (404 if not found)

## Classes

GET /classes -> Retrieves authenticated teacher's active classes (archived excluded)
POST /classes -> Creates a new class
GET /classes/:classId -> Retrieves class details by id (404 if not found or cross-user)
PATCH /classes/:classId -> Updates class details (404 if not found or cross-user)
POST /classes/:classId/archive -> Soft-archives a class by setting archivedAt (404 if not found or cross-user)

## Lessons

POST /lessons/generate -> Generates structured lesson plan candidate via AI pipeline (status 201)
GET /lessons -> Retrieves authenticated teacher's active lessons (archived excluded)
GET /lessons/:lessonId -> Retrieves lesson details by id (404 if not found or cross-user)
PATCH /lessons/:lessonId -> Updates lesson title/content/status (404 if not found or cross-user)
POST /lessons/:lessonId/archive -> Soft-archives a lesson (404 if not found or cross-user)
POST /lessons/:lessonId/regenerate -> Regenerates structured lesson draft candidate (404 if not found or cross-user)

## Future resource APIs

Worksheets; quizzes; homework; library; PDF export; analytics; billing foundation.

## Rules

Pagination/filtering/sorting for lists; idempotency for duplicate-sensitive mutations; rate limiting; request IDs; authentication; authorization; validation; safe errors; HTTPS; secure CORS.

## OpenAPI

Maintain an OpenAPI 3.x representation synchronized with actual implementation. Contract tests should prevent drift.
