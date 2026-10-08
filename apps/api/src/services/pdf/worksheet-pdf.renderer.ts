import {
  createA4Document,
  renderDocumentHeader,
  renderSectionTitle,
  addDocumentFooters,
  streamToBuffer,
} from "./pdf-utils";

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

export async function renderWorksheetPdf(worksheet: WorksheetPdfData): Promise<Buffer> {
  const doc = createA4Document();
  const totalMarks = worksheet.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  renderDocumentHeader(doc, {
    title: worksheet.title,
    resourceType: "Student Worksheet",
    subject: worksheet.subject,
    topic: worksheet.topic,
    className: worksheet.class?.name,
    difficulty: worksheet.difficulty,
    durationOrTime: worksheet.estimatedTimeMinutes ? `${worksheet.estimatedTimeMinutes} mins` : undefined,
    isStudentView: true,
    isAnswerKey: false,
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
  renderSectionTitle(doc, `Questions (${worksheet.questions.length} Items, ${totalMarks} Marks Total)`);

  worksheet.questions.forEach((q, idx) => {
    // Check page boundary
    if (doc.y > doc.page.height - 110) {
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
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#334155")
          .text(`    [   ]  ${letter}. ${opt}`, 50, doc.y, { lineGap: 2 });
      });
      doc.moveDown(0.6);
    } else if (q.type === "TRUE_FALSE") {
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#334155")
        .text(`    [   ]  True               [   ]  False`, 50, doc.y);
      doc.moveDown(0.6);
    } else if (q.type === "FILL_IN_THE_BLANK") {
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#64748B")
        .text(`    Answer: ___________________________________________________________`, 50, doc.y);
      doc.moveDown(0.6);
    } else if (q.type === "SHORT_ANSWER") {
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#94A3B8")
        .text(`    ______________________________________________________________________________`, 50, doc.y);
      doc.moveDown(0.4);
      doc.text(`    ______________________________________________________________________________`, 50, doc.y);
      doc.moveDown(0.6);
    } else if (q.type === "MATCH_THE_FOLLOWING" && optionsList.length > 0) {
      optionsList.forEach((opt, optIdx) => {
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#334155")
          .text(`    ${optIdx + 1}. ${opt}   ───────>   [        ]`, 50, doc.y, { lineGap: 2 });
      });
      doc.moveDown(0.6);
    } else {
      doc.moveDown(0.4);
    }

    doc.moveDown(0.4);
  });

  addDocumentFooters(doc);
  return streamToBuffer(doc);
}
