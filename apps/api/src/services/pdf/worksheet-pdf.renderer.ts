import {
  createA4Document,
  renderDocumentHeader,
  renderSectionTitle,
  addDocumentFooters,
  streamToBuffer,
} from "./pdf-utils";

export type WorksheetExportMode = "student" | "answer-key";

export interface WorksheetQuestionPdfData {
  position: number;
  type: string;
  question: string;
  options: string[] | null;
  expectedAnswer?: string | null;
  marks: number;
  difficulty?: string | null;
}

export interface WorksheetPdfData {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty?: string | null;
  estimatedTimeMinutes?: number | null;
  instructions?: string | null;
  class?: { id: string; name: string } | null;
  questions: WorksheetQuestionPdfData[];
}

export async function renderWorksheetPdf(
  worksheet: WorksheetPdfData,
  mode: WorksheetExportMode = "student",
): Promise<Buffer> {
  const doc = createA4Document();
  const isAnswerKey = mode === "answer-key";
  const totalMarks = worksheet.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  renderDocumentHeader(doc, {
    title: worksheet.title,
    resourceType: isAnswerKey ? "Worksheet — Teacher Answer Key" : "Student Worksheet",
    subject: worksheet.subject,
    topic: worksheet.topic,
    className: worksheet.class?.name,
    difficulty: worksheet.difficulty,
    durationOrTime: worksheet.estimatedTimeMinutes ? `${worksheet.estimatedTimeMinutes} mins` : undefined,
    isStudentView: !isAnswerKey,
    isAnswerKey,
    totalMarks,
  });

  // General Instructions
  if (worksheet.instructions) {
    renderSectionTitle(doc, "General Instructions");
    doc
      .fontSize(9.5)
      .font("Helvetica")
      .fillColor("#334155")
      .text(worksheet.instructions, { lineGap: 2 });
    doc.moveDown(0.8);
  }

  // Questions Section
  renderSectionTitle(
    doc,
    isAnswerKey
      ? `Answer Key & Solutions (${worksheet.questions.length} Items, ${totalMarks} Marks Total)`
      : `Questions (${worksheet.questions.length} Items, ${totalMarks} Marks Total)`,
  );

  worksheet.questions.forEach((q, idx) => {
    // Check page boundary
    if (doc.y > doc.page.height - 135) {
      doc.addPage();
    }

    const questionNumber = q.position || idx + 1;
    const marksText = `[${q.marks} ${q.marks === 1 ? "mark" : "marks"}]`;

    // Question Number & Text
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#0F172A")
      .text(`Q${questionNumber}. `, 40, doc.y, { continued: true });

    doc
      .font("Helvetica")
      .fillColor("#1E293B")
      .text(q.question, { lineGap: 2, continued: true });

    doc
      .fontSize(8.5)
      .font("Helvetica-Bold")
      .fillColor("#64748B")
      .text(`   ${marksText}`);

    doc.moveDown(0.4);

    // Question Options / Formatting based on Type
    const optionsList: string[] = Array.isArray(q.options)
      ? q.options
      : typeof q.options === "string"
      ? JSON.parse(q.options || "[]")
      : [];

    if (q.type === "MULTIPLE_CHOICE" && optionsList.length > 0) {
      optionsList.forEach((opt, optIdx) => {
        const letter = String.fromCharCode(65 + optIdx);
        const isThisCorrect = isAnswerKey && (
          opt === q.expectedAnswer ||
          letter === q.expectedAnswer ||
          q.expectedAnswer?.startsWith(letter) ||
          q.expectedAnswer?.trim() === opt.trim()
        );

        doc
          .fontSize(9)
          .font(isThisCorrect ? "Helvetica-Bold" : "Helvetica")
          .fillColor(isThisCorrect ? "#047857" : "#334155")
          .text(
            `    [${isThisCorrect ? " ✓ " : "   "}]  ${letter}. ${opt}${isThisCorrect ? " (Correct)" : ""}`,
            50,
            doc.y,
            { lineGap: 2 },
          );
      });
      doc.moveDown(0.5);
    } else if (q.type === "TRUE_FALSE") {
      const isTrueCorrect = isAnswerKey && q.expectedAnswer?.toLowerCase().trim() === "true";
      const isFalseCorrect = isAnswerKey && q.expectedAnswer?.toLowerCase().trim() === "false";

      doc
        .fontSize(9)
        .font(isTrueCorrect ? "Helvetica-Bold" : "Helvetica")
        .fillColor(isTrueCorrect ? "#047857" : "#334155")
        .text(`    [${isTrueCorrect ? " ✓ " : "   "}] True`, 50, doc.y, { continued: true });

      doc
        .font(isFalseCorrect ? "Helvetica-Bold" : "Helvetica")
        .fillColor(isFalseCorrect ? "#047857" : "#334155")
        .text(`               [${isFalseCorrect ? " ✓ " : "   "}] False`);
      doc.moveDown(0.5);
    } else if (q.type === "FILL_IN_THE_BLANK") {
      if (!isAnswerKey) {
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#64748B")
          .text(`    Answer: ___________________________________________________________`, 50, doc.y);
        doc.moveDown(0.6);
      }
    } else if (q.type === "SHORT_ANSWER") {
      if (!isAnswerKey) {
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor("#94A3B8")
          .text(`    ______________________________________________________________________________`, 50, doc.y);
        doc.moveDown(0.4);
        doc.text(`    ______________________________________________________________________________`, 50, doc.y);
        doc.moveDown(0.6);
      }
    } else if (q.type === "MATCH_THE_FOLLOWING" && optionsList.length > 0) {
      optionsList.forEach((opt, optIdx) => {
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#334155")
          .text(`    ${optIdx + 1}. ${opt}   ───────>   [        ]`, 50, doc.y, { lineGap: 2 });
      });
      doc.moveDown(0.5);
    } else {
      doc.moveDown(0.3);
    }

    // Teacher Answer Key Section (Rendered strictly when isAnswerKey is true)
    if (isAnswerKey) {
      const boxY = doc.y;
      doc
        .rect(48, boxY, doc.page.width - 96, 1)
        .fill("#E2E8F0");
      doc.moveDown(0.3);

      const label = q.type === "SHORT_ANSWER"
        ? "    Expected Answer / Model Response: "
        : q.type === "MATCH_THE_FOLLOWING"
        ? "    Expected Matching / Correct Pairs: "
        : "    Expected Answer: ";

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#065F46")
        .text(label, 50, doc.y, {
          continued: q.type !== "SHORT_ANSWER" && q.type !== "MATCH_THE_FOLLOWING",
        });

      if (q.type === "SHORT_ANSWER" || q.type === "MATCH_THE_FOLLOWING") {
        doc.moveDown(0.2);
        doc
          .font("Helvetica")
          .fillColor("#047857")
          .text(`    ${q.expectedAnswer || "N/A"}`, 50, doc.y, {
            width: doc.page.width - 100,
            lineGap: 2,
          });
      } else {
        doc
          .font("Helvetica")
          .fillColor("#047857")
          .text(q.expectedAnswer || "N/A");
      }

      doc.moveDown(0.6);
    } else {
      doc.moveDown(0.3);
    }
  });

  addDocumentFooters(doc);
  return streamToBuffer(doc);
}
