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

## Worksheets

POST /worksheets/generate -> Generates structured worksheet candidate via AI pipeline (status 201)
GET /worksheets -> Retrieves authenticated teacher's active worksheets (archived excluded)
GET /worksheets/:worksheetId -> Retrieves worksheet details and questions by id (404 if not found or cross-user)
PATCH /worksheets/:worksheetId -> Updates worksheet title/instructions/questions/status (404 if not found or cross-user)
POST /worksheets/:worksheetId/archive -> Soft-archives a worksheet (404 if not found or cross-user)

## Quizzes

POST /quizzes/generate -> Generates structured quiz candidate with server-authoritative totalMarks (status 201)
GET /quizzes -> Retrieves authenticated teacher's active quizzes (archived excluded)
GET /quizzes/:quizId -> Retrieves quiz details, questions, answers, and explanations by id (404 if not found or cross-user)
PATCH /quizzes/:quizId -> Updates quiz title/instructions/duration/questions/status with server totalMarks recalculation (404 if not found or cross-user)
POST /quizzes/:quizId/archive -> Soft-archives a quiz (404 if not found or cross-user)

## Homeworks

POST /homeworks/generate -> Generates structured homework assignment candidate with workload validation (status 201)
GET /homeworks -> Retrieves authenticated teacher's active homeworks (archived excluded)
GET /homeworks/:homeworkId -> Retrieves homework details and structured tasks by id (404 if not found or cross-user)
PATCH /homeworks/:homeworkId -> Updates homework title/instructions/estimatedTimeMinutes/tasks/status (404 if not found or cross-user)
POST /homeworks/:homeworkId/archive -> Soft-archives a homework assignment (404 if not found or cross-user)

## Content Library

GET /content -> Lists and filters authenticated teacher's catalog (query params: search, type, classId, subject, topic, status, sort, page, pageSize)
GET /content/:contentId -> Retrieves specific catalog record and class details (404 if not found or cross-user)
POST /content/:contentId/duplicate -> Duplicates resource domain entity and catalog record transactionally (no AI invocation)
POST /content/:contentId/archive -> Cascades archive operation to domain resource and catalog record transactionally

## Future resource APIs

PDF export; analytics; billing foundation.

## Rules

Pagination/filtering/sorting for lists; idempotency for duplicate-sensitive mutations; rate limiting; request IDs; authentication; authorization; validation; safe errors; HTTPS; secure CORS.

## OpenAPI

Maintain an OpenAPI 3.x representation synchronized with actual implementation. Contract tests should prevent drift.
