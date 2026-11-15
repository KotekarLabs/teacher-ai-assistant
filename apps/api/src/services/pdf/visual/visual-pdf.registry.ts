import type { VisualExplanation } from "@teacher-ai/contracts";
import { SortingDiagramRenderer } from "./sorting-diagram.renderer";

export class VisualPdfRegistry {
  /**
   * Dispatches visual explanation rendering to the appropriate format renderer.
   * Ensures lazy font loading and isolation from ordinary non-visual PDF generation.
   */
  static renderVisualExplanationPdf(
    doc: PDFKit.PDFDocument,
    visualExplanation: VisualExplanation,
  ): void {
    switch (visualExplanation.format) {
      case "SORTING_DIAGRAM":
        SortingDiagramRenderer.render(doc, visualExplanation);
        break;
      default:
        // Graceful fallback: render clean text note if future unsupported format
        doc.addPage();
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#64748B")
          .text("Visual diagram format not supported in current PDF export engine.");
        break;
    }
  }
}
