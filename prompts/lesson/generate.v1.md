# Teacher AI Assistant — Lesson Generation Prompt v1

Generate a complete, structured, classroom-ready Lesson Plan based on the following pedagogical context:

## Context
- Grade Level: {{GRADE}}
- Subject: {{SUBJECT}}
- Topic: {{TOPIC}}
- Curriculum Board: {{CURRICULUM_BOARD}}
- Total Duration: {{DURATION_MINUTES}} minutes
- Difficulty Level: {{DIFFICULTY}}
- Teacher Instructions: {{TEACHER_INSTRUCTIONS}}

## Required JSON Schema
Return a JSON object with the following structure:
```json
{
  "title": "string (e.g. 'Understanding the Water Cycle')",
  "overview": "string (2-3 sentence overview)",
  "learningObjectives": ["string", "string"],
  "prerequisites": ["string"],
  "introduction": "string (warmup / hook)",
  "teacherExplanation": "string (core teaching concept breakdown)",
  "examples": ["string", "string"],
  "classroomActivity": {
    "title": "string",
    "instructions": "string",
    "durationMinutes": 10
  },
  "practice": ["string"],
  "quickAssessment": ["string"],
  "homework": "string",
  "teacherScript": "string (practical talking points)"
}
```
