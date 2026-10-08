import {
  createA4Document,
  renderDocumentHeader,
  renderSectionTitle,
  addDocumentFooters,
  streamToBuffer,
} from "./pdf-utils";

export interface QuizQuestionPdfData {
  position: number;
  type: string;
  question: string;
  options: string[] | null;
  correctAnswer: string;
  explanation?: string | null;
  marks: number;
  difficulty?: string | null;
}

export interface QuizPdfData {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty?: string | null;
  durationMinutes?: number | null;
  totalMarks?: number | null;
  instructions?: string | null;
  class?: { id: string; name: string } | null;
  questions: QuizQuestionPdfData[];
}

export type QuizExportMode = "student" | "answer-key";

export async function renderQuizPdf(
  quiz: QuizPdfData,
  mode: QuizExportMode = "student",
): Promise<Buffer> {
  const doc = createA4Document();
  const isAnswerKey = mode === "answer-key";
  const calculatedMarks = quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  const totalMarks = quiz.totalMarks ?? calculatedMarks;

  renderDocumentHeader(doc, {
    title: quiz.title,
    resourceType: isAnswerKey ? "Quiz — Teacher Answer Key" : "Classroom Quiz",
    subject: quiz.subject,
    topic: quiz.topic,
    className: quiz.class?.name,
    difficulty: quiz.difficulty,
    durationOrTime: quiz.durationMinutes ? `${quiz.durationMinutes} mins` : undefined,
    isStudentView: !isAnswerKey,
    isAnswerKey,
    totalMarks,
  });

  // General Instructions
  if (quiz.instructions) {
    renderSectionTitle(doc, "Quiz Instructions");
    doc
      .fontSize(9.5)
      .font("Helvetica")
      .fillColor("#334155")
      .text(quiz.instructions, { lineGap: 2 });
    doc.moveDown(0.8);
  }

  // Questions Section
  renderSectionTitle(
    doc,
    isAnswerKey
      ? `Answer Key & Detailed Explanations (${quiz.questions.length} Questions)`
      : `Questions (${quiz.questions.length} Questions, ${totalMarks} Total Marks)`,
  );

  quiz.questions.forEach((q, idx) => {
    // Check page boundary
    if (doc.y > doc.page.height - 130) {
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

    const optionsList: string[] = Array.isArray(q.options)
      ? q.options
      : typeof q.options === "string"
      ? JSON.parse(q.options || "[]")
      : [];

    // Render options
    if (q.type === "MULTIPLE_CHOICE" && optionsList.length > 0) {
      optionsList.forEach((opt, optIdx) => {
        const letter = String.fromCharCode(65 + optIdx);
        const isThisCorrect = isAnswerKey && (
          opt === q.correctAnswer ||
          letter === q.correctAnswer ||
          q.correctAnswer.startsWith(letter)
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
      const isTrueCorrect = isAnswerKey && q.correctAnswer.toLowerCase() === "true";
      const isFalseCorrect = isAnswerKey && q.correctAnswer.toLowerCase() === "false";

      doc
        .fontSize(9)
        .font(isAnswerKey ? "Helvetica-Bold" : "Helvetica")
        .fillColor(isTrueCorrect ? "#047857" : "#334155")
        .text(`    [${isTrueCorrect ? " ✓ " : "   "}] True`, 50, doc.y, { continued: true });

      doc
        .fillColor(isFalseCorrect ? "#047857" : "#334155")
        .text(`               [${isFalseCorrect ? " ✓ " : "   "}] False`);
      doc.moveDown(0.5);
    } else if (q.type === "SHORT_ANSWER" && !isAnswerKey) {
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#CBD5E1")
        .text(`    ______________________________________________________________________________`, 50, doc.y);
      doc.moveDown(0.4);
      doc.text(`    ______________________________________________________________________________`, 50, doc.y);
      doc.moveDown(0.5);
    }

    // Teacher Answer Key Section (Answer & Explanation)
    if (isAnswerKey) {
      const boxY = doc.y;
      doc
        .rect(48, boxY, doc.page.width - 96, 1)
        .fill("#E2E8F0");
      doc.moveDown(0.3);

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#065F46")
        .text(`    Correct Answer: `, 50, doc.y, { continued: true });

      doc
        .font("Helvetica")
        .fillColor("#047857")
        .text(q.correctAnswer);

      if (q.explanation) {
        doc.moveDown(0.2);
        doc
          .fontSize(8.5)
          .font("Helvetica-Oblique")
          .fillColor("#475569")
          .text(`    Explanation: ${q.explanation}`, 50, doc.y, {
            width: doc.page.width - 100,
            lineGap: 2,
          });
      }

      doc.moveDown(0.6);
    } else {
      doc.moveDown(0.3);
    }
  });

  addDocumentFooters(doc);
  return streamToBuffer(doc);
}
