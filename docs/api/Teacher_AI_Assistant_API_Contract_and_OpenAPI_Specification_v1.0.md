# Teacher AI Assistant — API Contract & OpenAPI Specification v1.0

## Base

/api/v1.

## Standard contract

Consistent success envelope and safe structured error envelope.

## Auth

POST /auth/signup
POST /auth/login
POST /auth/logout
GET /auth/me

## Future resource APIs

Teacher profile; classes; lessons; worksheets; quizzes; homework; library; generation; PDF export; analytics; billing foundation.

## Rules

Pagination/filtering/sorting for lists; idempotency for duplicate-sensitive mutations; rate limiting; request IDs; authentication; authorization; validation; safe errors; HTTPS; secure CORS.

## OpenAPI

Maintain an OpenAPI 3.x representation synchronized with actual implementation. Contract tests should prevent drift.
