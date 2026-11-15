import type { PersistedSortingDiagram } from "@teacher-ai/contracts";
import {
  CANONICAL_OBJECTS_CATALOG,
  CANONICAL_OBJECT_IDS,
  type CanonicalObjectId,
} from "../../../registry/canonical-objects";
import { ensureKannadaFontsRegistered } from "./kannada-font.helper";
import { CanonicalVectors } from "./canonical-vectors";

/**
 * Renders the dedicated bilingual A4 visual sorting board for Class 1 Mathematics.
 * Adheres strictly to the verified curriculum registry and deep-frozen canonical 8-object catalogue.
 *
 * Layout Structure:
 * 1. Header Banner & Bilingual Conceptual Summary
 * 2. Section 1: Binary Classification Columns (3 Long vs. 3 Round Canonical Objects)
 * 3. Supplementary Pedagogical Element: Roll & Slide Discovery Inquiry
 * 4. Section 2: Distinct Multi-Perspective 3D Cards (2 Canonical Objects: Bottle, Pencil Box)
 * 5. Section 3: Official Curriculum Provenance & Standard Legal Disclaimer
 */
export class SortingDiagramRenderer {
  static render(doc: PDFKit.PDFDocument, visual: PersistedSortingDiagram): void {
    // 1. Lazy-register Kannada fonts on this document only
    ensureKannadaFontsRegistered(doc);

    // 2. Insert dedicated A4 page
    doc.addPage();

    const pageWidth = doc.page.width - 80; // 515.28 pt
    let currentY = 36;

    // 3. Header Tag & Title Banner
    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#4F46E5")
      .text("VISUAL PEDAGOGICAL ACTIVITY • CLASS 1 MATHEMATICS", 40, currentY, {
        characterSpacing: 0.8,
      });

    currentY += 13;

    // Bilingual Header Title
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#1E293B")
      .text("Sorting Board: What is Long? What is Round?", 40, currentY, { continued: true })
      .fontSize(11.5)
      .font("Kannada-Bold")
      .fillColor("#312E81")
      .text("  (ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?)");

    currentY = doc.y + 3;

    // Short Bilingual Conceptual Explanation
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#475569")
      .text(
        "Objects with elongated straight surfaces are long; objects with curved circular surfaces are round. ",
        40,
        currentY,
        { continued: true, width: pageWidth, lineGap: 1.5 },
      )
      .font("Kannada")
      .text(
        "ಉದ್ದವಾದ ವಸ್ತುಗಳು ನೇರವಾಗಿದ್ದು ಜಾರುತ್ತವೆ (ಉದಾ: ಬ್ಯಾಟ್, ಅಳತೆಪಟ್ಟಿ). ದುಂಡಗಿರುವ ವಸ್ತುಗಳು ವಕ್ರವಾಗಿದ್ದು ಉರುಳುತ್ತವೆ (ಉದಾ: ಚೆಂಡು, ಕಿತ್ತಳೆ ಹಣ್ಣು).",
        { width: pageWidth, lineGap: 1.5 },
      );

    currentY = doc.y + 6;

    // -------------------------------------------------------------------------
    // AUTHORITATIVE CANONICAL VALIDATION & DETERMINISTIC GROUPING
    // -------------------------------------------------------------------------
    const { longItems, roundItems, mpItems } = this.validateAndGroupCanonicalItems(
      visual.sortingActivity?.items,
    );

    // -------------------------------------------------------------------------
    // SECTION 1: BINARY CLASSIFICATION COLUMNS (Long vs. Round)
    // -------------------------------------------------------------------------
    const colW = (pageWidth - 12) / 2; // ~251.6 pt
    const col1X = 40;
    const col2X = 40 + colW + 12;

    // --- Column 1 Header: Long Objects ---
    doc.rect(col1X, currentY, colW, 20).fill("#0284C7");
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .text("Long Objects ", col1X + 8, currentY + 5, { continued: true })
      .font("Kannada-Bold")
      .text("(ಉದ್ದವಾದ ವಸ್ತುಗಳು)");

    // --- Column 2 Header: Round Objects ---
    doc.rect(col2X, currentY, colW, 20).fill("#7C3AED");
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .text("Round Objects ", col2X + 8, currentY + 5, { continued: true })
      .font("Kannada-Bold")
      .text("(ದುಂಡಗಿನ ವಸ್ತುಗಳು)");

    let rowY = currentY + 24;
    const binaryCardH = 54;

    // Deterministic rows: Row 0 (bat, ball), Row 1 (pencil, orange), Row 2 (ruler, bangle)
    for (let row = 0; row < 3; row++) {
      const longItem = longItems[row];
      const roundItem = roundItems[row];

      this.renderBinaryCard(doc, col1X, rowY, colW, binaryCardH, longItem, "#0284C7");
      this.renderBinaryCard(doc, col2X, rowY, colW, binaryCardH, roundItem, "#7C3AED");

      rowY += binaryCardH + 5;
    }

    currentY = rowY + 3;

    // -------------------------------------------------------------------------
    // SUPPLEMENTARY PEDAGOGICAL INQUIRY: ROLL & SLIDE DISCOVERY
    // (Preserved as a distinct supplementary inquiry, not a canonical object)
    // -------------------------------------------------------------------------
    const discoveryH = 34;
    doc.rect(40, currentY, pageWidth, discoveryH).fillAndStroke("#F8FAFC", "#E0E7FF");
    doc.rect(40, currentY, 3, discoveryH).fill("#6366F1");

    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#4338CA")
      .text("Roll & Slide Discovery Inquiry ", 48, currentY + 5, { continued: true })
      .font("Kannada-Bold")
      .text("(ಚಲನೆಯ ಅನ್ವೇಷಣೆ)");

    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor("#334155")
      .text(
        "Pedagogical Discovery: Flat surfaces slide (bat, ruler); round surfaces roll (ball, orange, bangle). Notice how a pencil does both!",
        48,
        currentY + 17,
        { width: pageWidth - 16, lineGap: 1.2, continued: true },
      )
      .font("Kannada")
      .text(" ಚಪ್ಪಟೆ ಮುಖಗಳು ಜಾರುತ್ತವೆ, ವಕ್ರ ಮುಖಗಳು ಉರುಳುತ್ತವೆ.");

    currentY += discoveryH + 8;

    // -------------------------------------------------------------------------
    // SECTION 2: DISTINCT MULTI-PERSPECTIVE 3D SECTION (Bottle & Pencil Box)
    // -------------------------------------------------------------------------
    const mpBannerH = 22;
    doc.rect(40, currentY, pageWidth, mpBannerH).fill("#312E81");
    doc
      .fontSize(8.5)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .text(
        "Multi-Perspective 3D Objects: Shape Changes by Viewpoint ",
        48,
        currentY + 6,
        { continued: true },
      )
      .fontSize(8)
      .font("Kannada-Bold")
      .text("(ವಿಶೇಷ ವೀಕ್ಷಣೆ: ಕೋನಕ್ಕೆ ತಕ್ಕಂತೆ ಆಕಾರ ಬದಲಾಗುತ್ತದೆ)");

    currentY += mpBannerH + 6;

    // 2 Dedicated Side-by-Side Cards (Bottle, Pencil Box)
    const mpCardW = (pageWidth - 12) / 2; // ~251.6 pt
    const mpCardH = 120;

    const mpNotes: Record<string, { englishNote: string; kannadaNote: string }> = {
      bottle: {
        englishNote:
          "Long cylindrical body when viewed from the side; circular shape when viewed from its base.",
        kannadaNote:
          "ಬದಿಯಿಂದ ನೋಡಿದಾಗ ಉದ್ದವಾದ ಸಿಲಿಂಡರ್, ತಳದಿಂದ ನೋಡಿದಾಗ ದುಂಡಾದ ವೃತ್ತಾಕಾರ.",
      },
      pencil_box: {
        englishNote:
          "Elongated cuboid with flat faces; slides rather than rolls under demonstrated conditions.",
        kannadaNote:
          "ಚಪ್ಪಟೆಯಾದ ಮುಖಗಳನ್ನು ಹೊಂದಿರುವ ಆಯತಾಕಾರದ ಪೆಟ್ಟಿಗೆ; ಇದು ಉರುಳದೆ ಜಾರುತ್ತದೆ.",
      },
    };

    for (let i = 0; i < mpItems.length; i++) {
      const item = mpItems[i];
      const cfg = mpNotes[item.id];
      const cardX = 40 + i * (mpCardW + 12);
      this.renderMultiPerspectiveCard(
        doc,
        cardX,
        currentY,
        mpCardW,
        mpCardH,
        item,
        cfg?.englishNote || item.perspectiveNote || "",
        cfg?.kannadaNote || item.kannadaObservation || "",
      );
    }

    currentY += mpCardH + 10;

    // -------------------------------------------------------------------------
    // SECTION 3: CURRICULUM PROVENANCE & LEGAL NON-ENDORSEMENT NOTICE
    // -------------------------------------------------------------------------
    const provH = 50;
    doc
      .rect(40, currentY, pageWidth, provH)
      .fillAndStroke("#F1F5F9", "#CBD5E1");

    doc
      .fontSize(7.5)
      .font("Helvetica-Bold")
      .fillColor("#334155")
      .text(
        `Curriculum Reference: ${visual.provenance.curriculumBoard} • ${visual.provenance.textbook} (${visual.provenance.edition}), ${visual.provenance.chapter}, pp. ${visual.provenance.printedPages}.`,
        48,
        currentY + 6,
        { width: pageWidth - 16, lineGap: 1.2 },
      );

    doc
      .fontSize(6.8)
      .font("Helvetica")
      .fillColor("#64748B")
      .text(
        "Legal Disclaimer: Independent teacher-support resource aligned to the Karnataka State Board syllabus; not officially published, endorsed, or approved by KTBS, DSERT, or the Government of Karnataka.",
        48,
        currentY + 24,
        { width: pageWidth - 16, lineGap: 1.2 },
      );
  }

  /**
   * Renders a compact binary classification card in Section 1.
   */
  private static renderBinaryCard(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    w: number,
    h: number,
    item: PersistedSortingDiagram["sortingActivity"]["items"][number],
    accentColor: string,
  ): void {
    doc.rect(x, y, w, h).fillAndStroke("#FFFFFF", "#E2E8F0");
    doc.rect(x, y, 3, h).fill(accentColor);

    // Vector Icon Box (30x30 pt)
    const iconSize = 30;
    const iconX = x + 8;
    const iconY = y + 7;
    CanonicalVectors.draw(doc, item.id, { x: iconX, y: iconY, size: iconSize });

    const textX = x + iconSize + 14;
    const textW = w - (iconSize + 20);

    // Name: English + Kannada
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#0F172A")
      .text(item.nameEnglish, textX, y + 5, { width: textW, continued: true })
      .fontSize(8.5)
      .font("Kannada-Bold")
      .fillColor("#3730A3")
      .text(` (${item.nameKannada})`);

    // Movement Badges
    const badgeY = y + 19;
    let badgeX = textX;

    if (item.rolls) {
      doc.roundedRect(badgeX, badgeY, 64, 12, 2).fill("#DCFCE7");
      doc
        .fontSize(6.5)
        .font("Helvetica-Bold")
        .fillColor("#166534")
        .text("Rolls ", badgeX + 4, badgeY + 2.5, { continued: true })
        .font("Kannada-Bold")
        .text("(ಉರುಳುತ್ತದೆ)");
      badgeX += 68;
    }

    if (item.slides) {
      doc.roundedRect(badgeX, badgeY, 64, 12, 2).fill("#DBEAFE");
      doc
        .fontSize(6.5)
        .font("Helvetica-Bold")
        .fillColor("#1E40AF")
        .text("Slides ", badgeX + 4, badgeY + 2.5, { continued: true })
        .font("Kannada-Bold")
        .text("(ಜಾರುತ್ತದೆ)");
    }

    // Observation Note
    const noteY = y + 34;
    const noteText =
      item.id === "bangle"
        ? (item.perspectiveNote && item.perspectiveNote.length < 85
            ? item.perspectiveNote
            : "Round ring that rolls along its rim; appears as a straight line edge-on.")
        : (item.perspectiveNote || item.contextualObservation || "");

    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor("#475569")
      .text(noteText, textX, noteY, {
        width: textW,
        lineGap: 1,
        height: 18,
      });
  }

  /**
   * Renders a dedicated multi-perspective card in Section 2.
   */
  private static renderMultiPerspectiveCard(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    w: number,
    h: number,
    item: PersistedSortingDiagram["sortingActivity"]["items"][number],
    englishNote: string,
    kannadaNote: string,
  ): void {
    // Card Box with Top Accent Bar
    doc.rect(x, y, w, h).fillAndStroke("#FFFFFF", "#CBD5E1");
    doc.rect(x, y, w, 3).fill("#6366F1");

    // Vector Icon Box (Centered at top)
    const iconSize = 32;
    const iconX = x + (w - iconSize) / 2;
    const iconY = y + 8;
    CanonicalVectors.draw(doc, item.id, { x: iconX, y: iconY, size: iconSize });

    // Title: English & Kannada Name Centered
    const titleY = y + 43;
    doc
      .fontSize(8.5)
      .font("Helvetica-Bold")
      .fillColor("#0F172A")
      .text(item.nameEnglish, x + 4, titleY, { width: w - 8, align: "center" });

    doc
      .fontSize(8)
      .font("Kannada-Bold")
      .fillColor("#3730A3")
      .text(`(${item.nameKannada})`, x + 4, doc.y + 1, { width: w - 8, align: "center" });

    // Movement Badges (Centered)
    const badgeY = doc.y + 3;
    const badgesW = item.rolls && item.slides ? 116 : 56;
    let badgeStartX = x + (w - badgesW) / 2;

    if (item.rolls) {
      doc.roundedRect(badgeStartX, badgeY, 56, 11, 2).fill("#DCFCE7");
      doc
        .fontSize(6.2)
        .font("Helvetica-Bold")
        .fillColor("#166534")
        .text("Rolls ", badgeStartX + 3, badgeY + 2, { continued: true })
        .font("Kannada-Bold")
        .text("(ಉರುಳುತ್ತದೆ)");
      badgeStartX += 60;
    }

    if (item.slides) {
      doc.roundedRect(badgeStartX, badgeY, 56, 11, 2).fill("#DBEAFE");
      doc
        .fontSize(6.2)
        .font("Helvetica-Bold")
        .fillColor("#1E40AF")
        .text("Slides ", badgeStartX + 3, badgeY + 2, { continued: true })
        .font("Kannada-Bold")
        .text("(ಜಾರುತ್ತದೆ)");
    }

    // Multi-Perspective Observation Text (User-mandated exact text)
    const noteY = badgeY + 15;
    doc
      .fontSize(6.8)
      .font("Helvetica")
      .fillColor("#334155")
      .text(englishNote, x + 6, noteY, {
        width: w - 12,
        lineGap: 1.2,
      });

    doc
      .fontSize(6.5)
      .font("Kannada")
      .fillColor("#4338CA")
      .text(kannadaNote, x + 6, doc.y + 2, {
        width: w - 12,
        lineGap: 1.2,
      });
  }

  /**
   * Validates items against authoritative canonical registry and groups them by validated shapeCategory
   * in the approved deterministic order.
   */
  private static validateAndGroupCanonicalItems(
    items: PersistedSortingDiagram["sortingActivity"]["items"] | undefined,
  ): {
    longItems: PersistedSortingDiagram["sortingActivity"]["items"];
    roundItems: PersistedSortingDiagram["sortingActivity"]["items"];
    mpItems: PersistedSortingDiagram["sortingActivity"]["items"];
  } {
    if (!items || !Array.isArray(items)) {
      throw new Error("Invalid visual diagram payload: sortingActivity.items array is missing or empty.");
    }

    if (items.length !== 8) {
      throw new Error(`Expected exactly 8 canonical objects, received ${items.length}.`);
    }

    const seenIds = new Set<string>();
    const itemMap = new Map<string, PersistedSortingDiagram["sortingActivity"]["items"][number]>();

    for (const item of items) {
      if (!item || !item.id) {
        throw new Error("Invalid visual diagram object: missing id.");
      }

      if (seenIds.has(item.id)) {
        throw new Error(`Duplicate canonical object detected in visual diagram: '${item.id}'.`);
      }
      seenIds.add(item.id);

      const canonicalDef = CANONICAL_OBJECTS_CATALOG[item.id as CanonicalObjectId];
      if (!canonicalDef) {
        throw new Error(`Unexpected non-canonical object ID in visual diagram: '${item.id}'.`);
      }

      // Authoritative classification check: must match canonical definition
      if (item.shapeCategory !== canonicalDef.shapeCategory) {
        throw new Error(
          `Canonical object classification mismatch for '${item.id}': ` +
          `authoritative category is '${canonicalDef.shapeCategory}', but received '${item.shapeCategory}'.`
        );
      }

      itemMap.set(item.id, item);
    }

    // Verify all 8 canonical IDs are present
    const missingIds = CANONICAL_OBJECT_IDS.filter((id) => !seenIds.has(id));
    if (missingIds.length > 0) {
      throw new Error(`Missing canonical objects in visual diagram: ${missingIds.join(", ")}.`);
    }

    // Approved deterministic order
    const approvedLongOrder: CanonicalObjectId[] = ["bat", "pencil", "ruler"];
    const approvedRoundOrder: CanonicalObjectId[] = ["ball", "orange", "bangle"];
    const approvedMpOrder: CanonicalObjectId[] = ["bottle", "pencil_box"];

    // Validate that every object in approvedLongOrder has authoritative shapeCategory 'LONG'
    const longItems = approvedLongOrder.map((id) => {
      const it = itemMap.get(id)!;
      if (it.shapeCategory !== "LONG") {
        throw new Error(`Object '${id}' is not classified as LONG in authoritative registry.`);
      }
      return it;
    });

    // Validate that every object in approvedRoundOrder has authoritative shapeCategory 'ROUND'
    const roundItems = approvedRoundOrder.map((id) => {
      const it = itemMap.get(id)!;
      if (it.shapeCategory !== "ROUND") {
        throw new Error(`Object '${id}' is not classified as ROUND in authoritative registry.`);
      }
      return it;
    });

    // Validate that every object in approvedMpOrder has authoritative shapeCategory 'MULTI_PERSPECTIVE'
    const mpItems = approvedMpOrder.map((id) => {
      const it = itemMap.get(id)!;
      if (it.shapeCategory !== "MULTI_PERSPECTIVE") {
        throw new Error(`Object '${id}' is not classified as MULTI_PERSPECTIVE in authoritative registry.`);
      }
      return it;
    });

    return { longItems, roundItems, mpItems };
  }
}
