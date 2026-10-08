import type { HomeworkTask } from "@teacher-ai/contracts";
import {
  createA4Document,
  renderDocumentHeader,
  renderSectionTitle,
  addDocumentFooters,
  streamToBuffer,
} from "./pdf-utils";

export interface HomeworkPdfData {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty?: string | null;
  estimatedTimeMinutes?: number | null;
  instructions?: string | null;
  class?: { id: string; name: string } | null;
  tasks: HomeworkTask[] | unknown;
}

export async function renderHomeworkPdf(homework: HomeworkPdfData): Promise<Buffer> {
  const doc = createA4Document();
  const tasksList: HomeworkTask[] = Array.isArray(homework.tasks)
    ? homework.tasks
    : typeof homework.tasks === "string"
    ? JSON.parse(homework.tasks || "[]")
    : [];

  renderDocumentHeader(doc, {
    title: homework.title,
    resourceType: "Take-Home Assignment",
    subject: homework.subject,
    topic: homework.topic,
    className: homework.class?.name,
    difficulty: homework.difficulty,
    durationOrTime: homework.estimatedTimeMinutes ? `${homework.estimatedTimeMinutes} mins` : undefined,
    isStudentView: true,
    isAnswerKey: false,
  });

  // General Instructions
  if (homework.instructions) {
    renderSectionTitle(doc, "Assignment Instructions");
    doc
      .fontSize(9.5)
      .font("Helvetica")
      .fillColor("#334155")
      .text(homework.instructions, { lineGap: 2 });
    doc.moveDown(0.8);
  }

  // Tasks Section
  renderSectionTitle(doc, `Tasks (${tasksList.length} Assignment Items)`);

  tasksList.forEach((task, idx) => {
    // Check page boundary
    if (doc.y > doc.page.height - 110) {
      doc.addPage();
    }

    const taskNumber = task.position || idx + 1;
    const taskType = (task.type || "PRACTICE").toUpperCase();

    // Task Card Background bar
    const startY = doc.y;
    doc
      .rect(40, startY, doc.page.width - 80, 20)
      .fill("#F8FAFC");

    // Task Header
    doc
      .fontSize(9.5)
      .font("Helvetica-Bold")
      .fillColor("#0F172A")
      .text(`Task ${taskNumber}: ${task.title}`, 48, startY + 5, { continued: true });

    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#0D948B")
      .text(`    [${taskType}]`);

    doc.moveDown(0.5);

    // Task Description
    doc
      .fontSize(9.5)
      .font("Helvetica")
      .fillColor("#334155")
      .text(task.description, 48, doc.y, {
        width: doc.page.width - 96,
        lineGap: 3,
      });

    doc.moveDown(0.5);

    // Completion / Notebook guidance
    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .fillColor("#94A3B8")
      .text(`[   ] Completed in notebook / sheet`, 48, doc.y);

    doc.moveDown(0.8);
  });

  addDocumentFooters(doc);
  return streamToBuffer(doc);
}
