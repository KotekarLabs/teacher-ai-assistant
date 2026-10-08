import PDFDocument from "pdfkit";

export interface PDFHeaderOptions {
  title: string;
  resourceType: string;
  subject: string;
  topic: string;
  className?: string | null;
  difficulty?: string | null;
  durationOrTime?: string | null;
  isStudentView?: boolean;
  isAnswerKey?: boolean;
  totalMarks?: number | null;
}

export function sanitizeFilename(title: string, suffix: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  const cleanSuffix = suffix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const base = cleanTitle || "teaching-resource";
  return cleanSuffix ? `${base}-${cleanSuffix}.pdf` : `${base}.pdf`;
}

export function createA4Document(): PDFKit.PDFDocument {
  return new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
    info: {
      Producer: "Teacher AI Assistant",
      Creator: "Teacher AI Assistant Workflow & Export Engine",
    },
  });
}

export function renderDocumentHeader(
  doc: PDFKit.PDFDocument,
  options: PDFHeaderOptions,
) {
  const pageWidth = doc.page.width - 80;

  // Answer key badge banner
  if (options.isAnswerKey) {
    doc
      .rect(40, 40, pageWidth, 24)
      .fill("#FEF2F2");
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#991B1B")
      .text("TEACHER ANSWER KEY — STRICTLY CONFIDENTIAL", 45, 47, {
        align: "center",
        width: pageWidth,
      });
    doc.moveDown(1.5);
  }

  // Student header with name/date fields if student document
  if (options.isStudentView) {
    const studentY = doc.y;
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#475569")
      .text("Name: ____________________________________", 40, studentY)
      .text("Date: ______________", 330, studentY)
      .text(
        options.totalMarks !== undefined && options.totalMarks !== null
          ? `Score: ______ / ${options.totalMarks}`
          : "Class: ____________",
        460,
        studentY,
      );
    doc.moveDown(1.2);

    // Subtle divider
    doc
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .strokeColor("#CBD5E1")
      .lineWidth(0.75)
      .stroke();
    doc.moveDown(0.8);
  }

  // Resource Type Tag
  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .fillColor("#4F46E5")
    .text(options.resourceType.toUpperCase(), { characterSpacing: 1 });
  doc.moveDown(0.2);

  // Main Title
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .fillColor("#0F172A")
    .text(options.title, { lineGap: 2 });
  doc.moveDown(0.3);

  // Metadata Subtitle Bar
  const metaParts: string[] = [
    `${options.subject} • ${options.topic}`,
  ];
  if (options.className) metaParts.push(`Class: ${options.className}`);
  if (options.difficulty) metaParts.push(`Level: ${options.difficulty}`);
  if (options.durationOrTime) metaParts.push(`Time: ${options.durationOrTime}`);
  if (options.totalMarks) metaParts.push(`Total Marks: ${options.totalMarks}`);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#64748B")
    .text(metaParts.join("   |   "));
  doc.moveDown(0.8);

  // Solid bottom divider
  doc
    .moveTo(40, doc.y)
    .lineTo(doc.page.width - 40, doc.y)
    .strokeColor("#94A3B8")
    .lineWidth(1)
    .stroke();
  doc.moveDown(1);
}

export function renderSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
  badgeText?: string,
) {
  // Check if we are near the bottom of page to prevent orphaned section titles
  if (doc.y > doc.page.height - 100) {
    doc.addPage();
  }

  const startY = doc.y;
  doc
    .rect(40, startY + 1, 3, 13)
    .fill("#4F46E5");

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#1E293B")
    .text(title, 48, startY);

  if (badgeText) {
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#64748B")
      .text(`(${badgeText})`, 48 + doc.widthOfString(title) + 6, startY + 2);
  }

  doc.moveDown(0.6);
}

export function addDocumentFooters(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    // Top border of footer
    const footerY = doc.page.height - 30;
    doc
      .moveTo(40, footerY - 6)
      .lineTo(doc.page.width - 40, footerY - 6)
      .strokeColor("#E2E8F0")
      .lineWidth(0.5)
      .stroke();

    // Footer Text
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#94A3B8")
      .text("Teacher AI Assistant — Classroom Resource", 40, footerY, {
        align: "left",
      })
      .text(`Page ${i + 1} of ${range.count}`, 40, footerY, {
        align: "right",
        width: doc.page.width - 80,
      });
  }
}

export function streamToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err: Error) => reject(err));
    doc.end();
  });
}
