import type { LessonContent } from "@teacher-ai/contracts";
import {
  createA4Document,
  renderDocumentHeader,
  renderSectionTitle,
  addDocumentFooters,
  streamToBuffer,
} from "./pdf-utils";

export interface LessonPdfData {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty?: string | null;
  durationMinutes?: number | null;
  curriculumBoard?: string | null;
  content: LessonContent | Record<string, unknown>;
  class?: { id: string; name: string } | null;
}

export async function renderLessonPdf(lesson: LessonPdfData): Promise<Buffer> {
  const doc = createA4Document();
  const content = (typeof lesson.content === "string"
    ? JSON.parse(lesson.content)
    : lesson.content) as LessonContent;

  renderDocumentHeader(doc, {
    title: lesson.title,
    resourceType: "Lesson Plan",
    subject: lesson.subject,
    topic: lesson.topic,
    className: lesson.class?.name,
    difficulty: lesson.difficulty,
    durationOrTime: lesson.durationMinutes ? `${lesson.durationMinutes} mins` : undefined,
    isStudentView: false,
    isAnswerKey: false,
  });

  // Overview
  if (content.overview) {
    renderSectionTitle(doc, "Lesson Overview");
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#334155")
      .text(content.overview, { lineGap: 3 });
    doc.moveDown(0.8);
  }

  // Learning Objectives
  if (content.learningObjectives && content.learningObjectives.length > 0) {
    renderSectionTitle(doc, "Learning Objectives");
    content.learningObjectives.forEach((obj) => {
      doc
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .fillColor("#4F46E5")
        .text(`• `, 50, doc.y, { continued: true });
      doc
        .font("Helvetica")
        .fillColor("#334155")
        .text(obj, { lineGap: 2 });
    });
    doc.moveDown(0.8);
  }

  // Prerequisites
  if (content.prerequisites && content.prerequisites.length > 0) {
    renderSectionTitle(doc, "Prerequisites & Prior Knowledge");
    content.prerequisites.forEach((item) => {
      doc
        .fontSize(9.5)
        .font("Helvetica")
        .fillColor("#475569")
        .text(`- ${item}`, 50, doc.y, { lineGap: 2 });
    });
    doc.moveDown(0.8);
  }

  // Required Materials
  if (content.materials && content.materials.length > 0) {
    if (doc.y > doc.page.height - 110) doc.addPage();
    renderSectionTitle(doc, "Required Materials & Equipment");
    content.materials.forEach((mat) => {
      doc
        .fontSize(9.5)
        .font("Helvetica")
        .fillColor("#334155")
        .text(`• ${mat}`, 50, doc.y, { lineGap: 2 });
    });
    doc.moveDown(0.8);
  }

  // Pacing Breakdown
  if (content.pacingBreakdown) {
    if (doc.y > doc.page.height - 110) doc.addPage();
    renderSectionTitle(doc, "Lesson Pacing & Time Allocation");
    const pb = content.pacingBreakdown;
    const pacingItems = [
      `Intro: ${pb.introductionMinutes}m`,
      `Direct Instruction: ${pb.directInstructionMinutes}m`,
      `Activity: ${pb.activityMinutes}m`,
      `Practice: ${pb.practiceMinutes}m`,
      `Assessment: ${pb.assessmentMinutes}m`,
    ];
    doc
      .fontSize(9.5)
      .font("Helvetica")
      .fillColor("#475569")
      .text(pacingItems.join("  |  "), 50, doc.y, { lineGap: 2 });
    doc.moveDown(0.8);
  }

  // Structured Phases
  // 1. Introduction
  if (content.introduction) {
    renderSectionTitle(doc, "1. Introduction & Hook");
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#334155")
      .text(content.introduction, { lineGap: 3 });
    doc.moveDown(0.8);
  }

  // 2. Teacher Explanation
  if (content.teacherExplanation) {
    renderSectionTitle(doc, "2. Direct Instruction & Concept Explanation");
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#334155")
      .text(content.teacherExplanation, { lineGap: 3 });
    doc.moveDown(0.8);
  }

  // 3. Examples
  if (content.examples && content.examples.length > 0) {
    renderSectionTitle(doc, "3. Worked Examples & Demonstrations");
    content.examples.forEach((ex, i) => {
      doc
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .fillColor("#1E293B")
        .text(`Example ${i + 1}: `, 50, doc.y, { continued: true });
      doc
        .font("Helvetica")
        .fillColor("#334155")
        .text(ex, { lineGap: 2 });
    });
    doc.moveDown(0.8);
  }

  // 4. Classroom Activity
  if (content.classroomActivity) {
    renderSectionTitle(
      doc,
      "4. Guided Classroom Activity",
      content.classroomActivity.durationMinutes
        ? `${content.classroomActivity.durationMinutes} mins`
        : undefined,
    );
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#0F172A")
      .text(content.classroomActivity.title || "Interactive Activity");
    doc.moveDown(0.2);
    doc
      .fontSize(9.5)
      .font("Helvetica")
      .fillColor("#334155")
      .text(content.classroomActivity.instructions, { lineGap: 2 });
    doc.moveDown(0.8);
  }

  // 5. Practice
  if (content.practice && content.practice.length > 0) {
    renderSectionTitle(doc, "5. Independent & Peer Practice");
    content.practice.forEach((item, idx) => {
      doc
        .fontSize(9.5)
        .font("Helvetica")
        .fillColor("#334155")
        .text(`${idx + 1}. ${item}`, 50, doc.y, { lineGap: 2 });
    });
    doc.moveDown(0.8);
  }

  // 6. Quick Assessment
  if (content.quickAssessment && content.quickAssessment.length > 0) {
    renderSectionTitle(doc, "6. Formative Assessment & Check for Understanding");
    content.quickAssessment.forEach((item, idx) => {
      doc
        .fontSize(9.5)
        .font("Helvetica")
        .fillColor("#334155")
        .text(`Q${idx + 1}: ${item}`, 50, doc.y, { lineGap: 2 });
    });
    doc.moveDown(0.8);
  }

  // 7. Homework
  if (content.homework) {
    renderSectionTitle(doc, "7. Homework & Extension Assignment");
    doc
      .fontSize(9.5)
      .font("Helvetica")
      .fillColor("#334155")
      .text(content.homework, { lineGap: 2 });
    doc.moveDown(0.8);
  }

  // Differentiation & Accommodations
  if (
    content.differentiation &&
    (content.differentiation.support || content.differentiation.extension)
  ) {
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
    }
    renderSectionTitle(doc, "Differentiation & Accommodations");
    if (content.differentiation.support) {
      doc
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .fillColor("#0369A1")
        .text("Support & Scaffolding: ", 50, doc.y, { continued: true });
      doc
        .font("Helvetica")
        .fillColor("#334155")
        .text(content.differentiation.support, { lineGap: 2 });
      doc.moveDown(0.4);
    }
    if (content.differentiation.extension) {
      doc
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .fillColor("#7E22CE")
        .text("Extension & Challenge: ", 50, doc.y, { continued: true });
      doc
        .font("Helvetica")
        .fillColor("#334155")
        .text(content.differentiation.extension, { lineGap: 2 });
      doc.moveDown(0.4);
    }
    doc.moveDown(0.6);
  }

  // 8. Teacher Script (Teacher Facing Notes)
  if (content.teacherScript) {
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
    }

    const scriptStartY = doc.y;
    doc
      .rect(40, scriptStartY, doc.page.width - 80, 1)
      .fill("#E2E8F0");
    doc.moveDown(0.5);

    renderSectionTitle(doc, "Teacher Script & Verbal Prompt Notes");

    // Script box
    const boxY = doc.y;
    doc
      .rect(40, boxY, doc.page.width - 80, 24)
      .fill("#F8FAFC");

    doc
      .fontSize(9.5)
      .font("Helvetica-Oblique")
      .fillColor("#475569")
      .text(`"${content.teacherScript}"`, 48, boxY + 6, {
        width: doc.page.width - 96,
        lineGap: 3,
      });
  }

  addDocumentFooters(doc);
  return streamToBuffer(doc);
}
