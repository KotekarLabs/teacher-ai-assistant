import type { CanonicalObjectId } from "@teacher-ai/contracts";

export interface VectorDrawOptions {
  x: number;
  y: number;
  size?: number; // Default 36 pt
}

/**
 * Pure vector drawing routines for the eight canonical objects.
 * Uses native PDFKit path commands exclusively without raster assets or external dependencies.
 */
export class CanonicalVectors {
  static draw(
    doc: PDFKit.PDFDocument,
    objectId: CanonicalObjectId,
    options: VectorDrawOptions,
  ): void {
    const { x, y, size = 36 } = options;
    doc.save();

    switch (objectId) {
      case "bat":
        this.drawBat(doc, x, y, size);
        break;
      case "ball":
        this.drawBall(doc, x, y, size);
        break;
      case "pencil":
        this.drawPencil(doc, x, y, size);
        break;
      case "orange":
        this.drawOrange(doc, x, y, size);
        break;
      case "ruler":
        this.drawRuler(doc, x, y, size);
        break;
      case "bangle":
        this.drawBangle(doc, x, y, size);
        break;
      case "bottle":
        this.drawBottle(doc, x, y, size);
        break;
      case "pencil_box":
        this.drawPencilBox(doc, x, y, size);
        break;
    }

    doc.restore();
  }

  /**
   * 1. Cricket Bat: Angled wooden blade with wrapped grip handle.
   */
  private static drawBat(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    size: number,
  ): void {
    // Handle
    doc
      .rect(x + size * 0.44, y + size * 0.08, size * 0.12, size * 0.32)
      .fillAndStroke("#475569", "#1E293B");

    // Grip wraps
    doc.lineWidth(0.75).strokeColor("#CBD5E1");
    for (let i = 1; i <= 3; i++) {
      const lineY = y + size * 0.08 + (size * 0.32 * i) / 4;
      doc.moveTo(x + size * 0.44, lineY).lineTo(x + size * 0.56, lineY).stroke();
    }

    // Blade
    doc
      .roundedRect(x + size * 0.36, y + size * 0.4, size * 0.28, size * 0.52, 2)
      .fillAndStroke("#FDE68A", "#D97706");

    // Spine contour
    doc
      .moveTo(x + size * 0.5, y + size * 0.42)
      .lineTo(x + size * 0.5, y + size * 0.88)
      .lineWidth(0.8)
      .strokeColor("#B45309")
      .stroke();
  }

  /**
   * 2. Rubber Ball: Smooth crimson sphere with white tennis/cricket seam curves.
   */
  private static drawBall(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    size: number,
  ): void {
    const cx = x + size * 0.5;
    const cy = y + size * 0.5;
    const r = size * 0.42;

    // Outer circle
    doc.circle(cx, cy, r).fillAndStroke("#EF4444", "#B91C1C");

    // Seam arcs
    doc.lineWidth(1).strokeColor("#F8FAFC");
    doc
      .moveTo(cx - r * 0.7, cy - r * 0.7)
      .bezierCurveTo(cx - r * 0.2, cy, cx - r * 0.2, cy, cx - r * 0.7, cy + r * 0.7)
      .stroke();

    doc
      .moveTo(cx + r * 0.7, cy - r * 0.7)
      .bezierCurveTo(cx + r * 0.2, cy, cx + r * 0.2, cy, cx + r * 0.7, cy + r * 0.7)
      .stroke();
  }

  /**
   * 3. Pencil: Hexagonal yellow shaft, pink eraser with silver ferrule, sharpened cone and graphite tip.
   */
  private static drawPencil(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    size: number,
  ): void {
    const px = x + size * 0.43;
    const pw = size * 0.14;

    // Eraser
    doc.roundedRect(px, y + size * 0.08, pw, size * 0.12, 1).fillAndStroke("#F472B6", "#DB2777");

    // Ferrule band
    doc.rect(px, y + size * 0.2, pw, size * 0.06).fillAndStroke("#94A3B8", "#64748B");

    // Yellow body
    doc.rect(px, y + size * 0.26, pw, size * 0.46).fillAndStroke("#F59E0B", "#D97706");

    // Sharpened wood cone
    doc
      .polygon(
        [px, y + size * 0.72],
        [px + pw, y + size * 0.72],
        [px + pw * 0.5, y + size * 0.88],
      )
      .fillAndStroke("#FEF3C7", "#D97706");

    // Graphite lead tip
    doc
      .polygon(
        [px + pw * 0.35, y + size * 0.83],
        [px + pw * 0.65, y + size * 0.83],
        [px + pw * 0.5, y + size * 0.92],
      )
      .fill("#0F172A");
  }

  /**
   * 4. Fresh Orange: Symmetrical citrus fruit with green leaf and brown stem.
   */
  private static drawOrange(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    size: number,
  ): void {
    const cx = x + size * 0.5;
    const cy = y + size * 0.54;
    const r = size * 0.38;

    // Fruit body
    doc.circle(cx, cy, r).fillAndStroke("#F97316", "#C2410C");

    // Stem
    doc.rect(cx - 1, y + size * 0.12, 2, size * 0.1).fill("#78350F");

    // Green leaf
    doc
      .moveTo(cx, y + size * 0.16)
      .bezierCurveTo(cx + size * 0.2, y + size * 0.06, cx + size * 0.3, y + size * 0.14, cx + size * 0.12, y + size * 0.22)
      .fill("#16A34A");

    // Texture dots
    doc.fillColor("#EA580C");
    doc.circle(cx - r * 0.4, cy - r * 0.3, 0.8).fill();
    doc.circle(cx + r * 0.3, cy + r * 0.2, 0.8).fill();
    doc.circle(cx - r * 0.2, cy + r * 0.4, 0.8).fill();
  }

  /**
   * 5. Ruler / Scale: Clear blue graduated strip with millimeter/centimeter tick marks.
   */
  private static drawRuler(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    size: number,
  ): void {
    const rx = x + size * 0.12;
    const ry = y + size * 0.32;
    const rw = size * 0.76;
    const rh = size * 0.36;

    // Body
    doc.roundedRect(rx, ry, rw, rh, 2).fillAndStroke("#DBEAFE", "#3B82F6");

    // Tick marks
    doc.lineWidth(0.6).strokeColor("#1E3A8A");
    const numTicks = 9;
    for (let i = 0; i <= numTicks; i++) {
      const tx = rx + size * 0.08 + (i * (rw - size * 0.16)) / numTicks;
      const tickH = i % 2 === 0 ? size * 0.14 : size * 0.08;
      doc.moveTo(tx, ry).lineTo(tx, ry + tickH).stroke();
    }
  }

  /**
   * 6. Glass Bangle: Concentric rings with jade/teal luster and specular highlight.
   */
  private static drawBangle(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    size: number,
  ): void {
    const cx = x + size * 0.5;
    const cy = y + size * 0.5;
    const rOuter = size * 0.4;
    const rInner = size * 0.26;

    // Outer & Inner rings
    doc.lineWidth(2).strokeColor("#0D9488");
    doc.circle(cx, cy, (rOuter + rInner) / 2).stroke();

    // Secondary specular luster stroke
    doc.lineWidth(0.8).strokeColor("#5EEAD4");
    doc
      .moveTo(cx - rOuter * 0.7, cy - rOuter * 0.4)
      .bezierCurveTo(cx - rOuter * 0.4, cy - rOuter * 0.7, cx + rOuter * 0.2, cy - rOuter * 0.7, cx + rOuter * 0.6, cy - rOuter * 0.4)
      .stroke();
  }

  /**
   * 7. Water Bottle: Tall cylindrical body with grip ridges, neck, and ribbed cap.
   */
  private static drawBottle(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    size: number,
  ): void {
    const bx = x + size * 0.36;
    const bw = size * 0.28;

    // Cap
    doc.roundedRect(bx + bw * 0.2, y + size * 0.08, bw * 0.6, size * 0.1, 1).fillAndStroke("#1E40AF", "#1E3A8A");

    // Neck
    doc.rect(bx + bw * 0.3, y + size * 0.18, bw * 0.4, size * 0.08).fillAndStroke("#60A5FA", "#2563EB");

    // Main Body
    doc.roundedRect(bx, y + size * 0.26, bw, size * 0.64, 3).fillAndStroke("#3B82F6", "#1D4ED8");

    // Grip ridges
    doc.lineWidth(0.75).strokeColor("#93C5FD");
    doc.moveTo(bx + 2, y + size * 0.46).lineTo(bx + bw - 2, y + size * 0.46).stroke();
    doc.moveTo(bx + 2, y + size * 0.56).lineTo(bx + bw - 2, y + size * 0.56).stroke();
    doc.moveTo(bx + 2, y + size * 0.66).lineTo(bx + bw - 2, y + size * 0.66).stroke();
  }

  /**
   * 8. Pencil Box: Violet cuboid box with hinge line and gold latch clip.
   */
  private static drawPencilBox(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    size: number,
  ): void {
    const bx = x + size * 0.14;
    const by = y + size * 0.28;
    const bw = size * 0.72;
    const bh = size * 0.44;

    // Box body
    doc.roundedRect(bx, by, bw, bh, 3).fillAndStroke("#8B5CF6", "#6D28D9");

    // Lid divider line
    doc.lineWidth(0.8).strokeColor("#DDD6FE");
    doc.moveTo(bx + 1, by + bh * 0.4).lineTo(bx + bw - 1, by + bh * 0.4).stroke();

    // Center latch
    doc.roundedRect(bx + bw * 0.42, by + bh * 0.3, bw * 0.16, bh * 0.22, 1).fillAndStroke("#FCD34D", "#D97706");
  }
}
