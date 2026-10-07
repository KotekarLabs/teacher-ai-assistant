# Teacher AI Assistant — PRD v1.0

## Objective

Build a teacher-first AI workspace that converts teaching requirements into structured, editable, classroom-ready resources.

## Goals

Reduce preparation time; produce useful resources; support curricula; keep teachers in control; build reusable content library.

## Non-goals

Student app, parent portal, school ERP, LMS, marketplace, social network, advanced autonomous agents, live classroom AI.

## Core journey

Signup → Profile/Context → Class → Topic → Generate → Review/Edit → Save → Export/Use → Library.

## Features

Authentication; teacher profile; classes; lesson generator; worksheet; quiz; homework; answer key; library.

## Lesson inputs

Class/grade, subject, topic, duration, difficulty, curriculum.

## Lesson outputs

Overview, objectives, prerequisites, introduction, explanation, examples, activity, practice, assessment, homework, optional script.

## AI pipeline

User Input → Validation → Context → Prompt → LLM → Structured JSON → Schema Validation → Quality Checks → Rendering.

## Regeneration

Regenerate, simplify, increase difficulty, shorten, add examples/activity, targeted section/question regeneration.

## Lifecycle

GENERATING → DRAFT → EDITED → SAVED → ARCHIVED; failure: GENERATION_FAILED.

## Technical direction

React/Vite/Tailwind/React Query/Zustand/React Hook Form/Zod; Node/Express/Prisma/PostgreSQL; AI abstraction.

## Initial entities

User, TeacherProfile, Class, Lesson, Worksheet, WorksheetQuestion, Quiz, QuizQuestion, Homework, Content, GenerationRequest.

## MVP export

PDF.

## Analytics

lesson_generated, worksheet_generated, quiz_generated, content_saved, content_exported, content_deleted.

## Security

HTTPS, password hashing, secure auth, validation, authorization, rate limiting, server-side AI keys.

## North Star hypothesis

Classroom-ready teaching resources successfully created and used per active teacher.
