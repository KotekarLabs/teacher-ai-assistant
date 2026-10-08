import { PrismaClient } from "@prisma/client";
import { ContentSyncService } from "../services/content-sync.service";

const prisma = new PrismaClient();

export async function backfillContent() {
  console.log("Starting Content Catalog backfill...");

  let lessonCount = 0;
  let worksheetCount = 0;
  let quizCount = 0;
  let homeworkCount = 0;

  // 1. Backfill Lessons
  const lessons = await prisma.lesson.findMany();
  for (const lesson of lessons) {
    await ContentSyncService.syncResource({
      teacherId: lesson.teacherId,
      type: "LESSON",
      resourceId: lesson.id,
      title: lesson.title,
      subject: lesson.subject,
      topic: lesson.topic,
      difficulty: lesson.difficulty,
      classId: lesson.classId,
      status: lesson.status,
      archivedAt: lesson.archivedAt,
    });
    lessonCount++;
  }

  // 2. Backfill Worksheets
  const worksheets = await prisma.worksheet.findMany();
  for (const worksheet of worksheets) {
    await ContentSyncService.syncResource({
      teacherId: worksheet.teacherId,
      type: "WORKSHEET",
      resourceId: worksheet.id,
      title: worksheet.title,
      subject: worksheet.subject,
      topic: worksheet.topic,
      difficulty: worksheet.difficulty,
      classId: worksheet.classId,
      status: worksheet.status,
      archivedAt: worksheet.archivedAt,
    });
    worksheetCount++;
  }

  // 3. Backfill Quizzes
  const quizzes = await prisma.quiz.findMany();
  for (const quiz of quizzes) {
    await ContentSyncService.syncResource({
      teacherId: quiz.teacherId,
      type: "QUIZ",
      resourceId: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      classId: quiz.classId,
      status: quiz.status,
      archivedAt: quiz.archivedAt,
    });
    quizCount++;
  }

  // 4. Backfill Homeworks
  const homeworks = await prisma.homework.findMany();
  for (const homework of homeworks) {
    await ContentSyncService.syncResource({
      teacherId: homework.teacherId,
      type: "HOMEWORK",
      resourceId: homework.id,
      title: homework.title,
      subject: homework.subject,
      topic: homework.topic,
      difficulty: homework.difficulty,
      classId: homework.classId,
      status: homework.status,
      archivedAt: homework.archivedAt,
    });
    homeworkCount++;
  }

  console.log(
    `Backfill completed successfully. Synced: ${lessonCount} lessons, ${worksheetCount} worksheets, ${quizCount} quizzes, ${homeworkCount} homework assignments. Total: ${lessonCount + worksheetCount + quizCount + homeworkCount} items.`,
  );
}

if (process.env.NODE_ENV !== "test" && require.main === module) {
  backfillContent()
    .catch((err) => {
      console.error("Backfill failed:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
