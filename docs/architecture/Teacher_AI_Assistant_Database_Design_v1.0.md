# Teacher AI Assistant — Database Design v1.0

## Database

PostgreSQL via Prisma; UUID primary keys; UTC timestamps.

## Models

User(id,email,passwordHash,emailVerified,createdAt,updatedAt,lastLoginAt)
TeacherProfile(id,userId,displayName,teachingRole,subjects,preferredLanguage,curriculumBoard,experienceLevel,createdAt,updatedAt)
Class(id,teacherId,name,grade,section,curriculumBoard,academicYear,createdAt,updatedAt,archivedAt)
Lesson(id,teacherId,classId,generationRequestId,title,subject,topic,curriculumBoard,difficulty,durationMinutes,status,content,createdAt,updatedAt,archivedAt)
Worksheet(id,teacherId,classId,generationRequestId,title,subject,topic,curriculumBoard,difficulty,estimatedTimeMinutes,instructions,status,createdAt,updatedAt,archivedAt)
WorksheetQuestion(id,worksheetId,position,type,question,options,expectedAnswer,marks,difficulty,createdAt,updatedAt)
Quiz(id,teacherId,classId,generationRequestId,title,subject,topic,curriculumBoard,difficulty,durationMinutes,totalMarks,instructions,status,createdAt,updatedAt,archivedAt)
QuizQuestion(id,quizId,position,type,question,options,correctAnswer,explanation,marks,difficulty,createdAt,updatedAt)
Homework(id,teacherId,classId,generationRequestId,title,subject,topic,difficulty,estimatedTimeMinutes,instructions,tasks,status,createdAt,updatedAt,archivedAt)
Content(id,teacherId,type,resourceId,title,subject,topic,classId,status,difficulty,createdAt,updatedAt,archivedAt)
GenerationRequest(id,teacherId,contentType,resourceId,provider,model,promptVersion,status,inputContext,outputMetadata,errorCode,errorMessage,latencyMs,inputTokens,outputTokens,estimatedCost,createdAt,completedAt)

## Enums

ContentType, ContentStatus, GenerationStatus, Difficulty, QuestionType.

## Rules

Unique email; foreign keys; ownership; indexes (e.g. Class indexed on teacherId and [teacherId, archivedAt]; Lesson indexed on teacherId, classId, and [teacherId, archivedAt]; Worksheet indexed on teacherId, classId, and [teacherId, archivedAt]; WorksheetQuestion indexed on worksheetId and [worksheetId, position]; Quiz indexed on teacherId, classId, and [teacherId, archivedAt]; QuizQuestion indexed on quizId and [quizId, position]; Homework indexed on teacherId, classId, and [teacherId, archivedAt]; Content indexed on [type, resourceId] (unique), teacherId, [teacherId, type], [teacherId, archivedAt], [teacherId, status], [teacherId, subject], and [teacherId, classId]; GenerationRequest indexed on teacherId and status); archive/soft-delete where appropriate (e.g. Class.archivedAt, Lesson.archivedAt, Worksheet.archivedAt, Quiz.archivedAt, Homework.archivedAt, and Content.archivedAt timestamps); JSON for flexible structured content (e.g. Lesson.content, Homework.tasks, GenerationRequest.inputContext); transactions for atomic operations and synchronous Content catalog synchronization; safe migrations; minimal student data.

## AI tracking

Track provider/model/prompt version/status/latency/tokens/cost.

## Future

Organizations, schools, students, collaboration and analytics can be added later.
