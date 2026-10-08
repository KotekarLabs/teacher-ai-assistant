# Teacher AI Assistant — Resource Workflow & Export Foundation Planning Specification v1.0

## 1. Overview & Objective
Transform the individual teaching resource generators (Lesson, Worksheet, Quiz, Homework) and the Content Library into a seamless, cohesive teacher workflow:
`Create -> Generate -> Review -> Edit -> Save -> Resource Detail -> Export PDF / Print / Duplicate / Archive -> Classroom Use`.

## 2. Core Architectural Principles
1. **Domain Models Remain Authoritative**: Lesson, Worksheet, Quiz, Homework are the authoritative models. Content catalog remains the discovery/index layer. No generic/universal resource DB model.
2. **Dedicated Editors Preserved**: Each resource preserves its specialized, rich domain editor with unsaved changes protection (`UnsavedChangesDialog`).
3. **No New AI Generation**: Export & print strictly render existing saved domain data with zero AI invocation.
4. **No Student Accounts / LMS**: Pure teacher tooling. Student-facing documents (Worksheets, Quizzes, Homework) are formatted for classroom distribution without LMS/submission mechanisms.

## 3. PDF Generation Architecture
- **Technology**: Pure Node.js `pdfkit` stream rendering to binary buffers with A4 portrait classroom formatting.
- **Renderers**:
  - `renderLessonPdf`: Formats Overview, Objectives, Prerequisites, Phases 1-7, and Teacher Script.
  - `renderWorksheetPdf`: Formats student header (Name, Date, Class, Score), Instructions, Questions (MCQ option boxes `[ ]`, True/False, write-in lines), and Marks.
  - `renderQuizPdf`:
    - `student` mode: Formats questionnaire with student header, questions, options, mark allocation. Correct answers and explanations are strictly omitted.
    - `answer-key` mode: Formats evaluation guide highlighting correct answers and pedagogical explanations.
  - `renderHomeworkPdf`: Formats student header, instructions, task blocks with type badges and descriptions.
- **Endpoints**:
  - `GET /api/v1/lessons/:lessonId/export/pdf`
  - `GET /api/v1/worksheets/:worksheetId/export/pdf`
  - `GET /api/v1/quizzes/:quizId/export/pdf?mode=student|answer-key`
  - `GET /api/v1/homeworks/:homeworkId/export/pdf`
- **Security & Authorization**: All export requests enforce strict teacher authentication and ownership validation before rendering. Responses return `application/pdf` with sanitized `Content-Disposition: attachment; filename="..."`.

## 4. Frontend Resource Workflow Standardization
- **Shared Components** (`apps/web/src/components/resources/`):
  - `ResourceHeader`: Standardized top navigation back link, type badge, subject/topic, duration/marks, status, and action buttons.
  - `ResourceActions`: Primary actions (Edit, Export PDF with loading feedback), Secondary (Print calling `window.print()`, Duplicate, Toggle Answer Key), and Destructive (Archive with confirmation modal).
  - `ResourceMetadata`: Structured card displaying Type, Subject, Topic, Class, Curriculum Board, Difficulty, Time, Status, Created, and Last Updated timestamps.
  - `QuizExportModal`: Modal dialog for selecting between Student Quiz PDF and Teacher Answer Key PDF.
  - `UnsavedChangesDialog`: Navigation protection for dirty state in resource editors with Save changes, Discard changes, and Cancel options.
- **Browser Print Experience**: `@media print` rules in `index.css` stripping navigation, sidebars, buttons, and app chrome for crisp A4 paper printing.
