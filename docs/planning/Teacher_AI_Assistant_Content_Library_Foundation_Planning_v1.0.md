# Teacher AI Assistant — Content Library Foundation Planning Specification v1.0

## Status: Implemented

## 1. Feature Overview
The Content Library Foundation provides a single, unified discovery and management catalog for all teaching materials generated within the Teacher AI Assistant platform:
- **Lesson Plans** (`LESSON`)
- **Worksheets** (`WORKSHEET`)
- **Quizzes** (`QUIZ`)
- **Homework Assignments** (`HOMEWORK`)

## 2. Core Architectural Principles
1. **Polymorphic Catalog Layer**: `Content` serves as the indexing/catalog model referencing authoritative domain models via `(type, resourceId)` application-level polymorphic reference.
2. **Authoritative Domain Models**: `Lesson`, `Worksheet`, `Quiz`, and `Homework` retain complete ownership of their rich domain payload, questions, objectives, tasks, and structures.
3. **Synchronous Transactional Synchronization**: All creation, modification, and archival operations on domain resources execute atomically in the same database transaction as the catalog synchronization (`ContentSyncService`).
4. **Zero Out-of-Scope Bloat**: Excludes vector databases, embeddings, semantic search, LMS, student accounts, sharing, folders, and tags.

## 3. Database Schema
```prisma
model Content {
  id           String        @id @default(uuid())
  teacherId    String
  type         ContentType
  resourceId   String
  title        String
  subject      String
  topic        String
  classId      String?
  status       ContentStatus
  difficulty   Difficulty?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  archivedAt   DateTime?

  teacher      User          @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  class        Class?        @relation(fields: [classId], references: [id], onDelete: SetNull)

  @@unique([type, resourceId])
  @@index([teacherId])
  @@index([teacherId, type])
  @@index([teacherId, archivedAt])
  @@index([teacherId, status])
  @@index([teacherId, subject])
  @@index([teacherId, classId])
}
```

## 4. Operational Backfill Script
Idempotent backfill script created at `apps/api/src/scripts/backfill-content.ts` and executed via `pnpm backfill:content` on explicit operational demand (never on server startup).

## 5. API Endpoints
- `GET /api/v1/content`: Paginated, filtered, sorted catalog list for authenticated teacher.
- `GET /api/v1/content/:contentId`: Detailed catalog record with class relations.
- `POST /api/v1/content/:contentId/duplicate`: Domain-aware duplication without AI cost or regeneration.
- `POST /api/v1/content/:contentId/archive`: Atomic archival cascading to authoritative domain entity.

## 6. Frontend Architecture
- `/library`: Full-featured responsive library view with URL search param persistence, debounced search, type pills, class selector, active/archived toggle, and pagination.
- `ContentCard`: Displays type badge, title, subject/topic, class badge, difficulty, updated date, and quick action links (Open, Edit, Duplicate, Archive).
- `RecentResources`: Live Dashboard widget showing recent teaching materials.
- `ClassResourcesList`: Class Details embedded section showing resources assigned to a class.
