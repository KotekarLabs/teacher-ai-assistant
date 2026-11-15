import fs from "fs";
import path from "path";

let cachedFontPaths: { regular: string; bold: string } | null = null;
const registeredDocs = new WeakSet<object>();

/**
 * Resolves absolute paths to Noto Sans Kannada font assets.
 * Checks relative to current module location and workspace root.
 */
export function resolveKannadaFontPaths(): { regular: string; bold: string } {
  if (cachedFontPaths) {
    return cachedFontPaths;
  }

  const candidateDirs: string[] = [];

  if (typeof __dirname !== "undefined") {
    candidateDirs.push(path.resolve(__dirname, "../../../../assets/fonts"));
    candidateDirs.push(path.resolve(__dirname, "../../../assets/fonts"));
  }

  candidateDirs.push(path.resolve(process.cwd(), "apps/api/assets/fonts"));
  candidateDirs.push(path.resolve(process.cwd(), "assets/fonts"));

  for (const dir of candidateDirs) {
    const regular = path.join(dir, "NotoSansKannada-Regular.ttf");
    const bold = path.join(dir, "NotoSansKannada-Bold.ttf");

    if (fs.existsSync(regular) && fs.existsSync(bold)) {
      cachedFontPaths = { regular, bold };
      return cachedFontPaths;
    }
  }

  throw new Error(
    `Kannada font assets (NotoSansKannada-Regular.ttf, NotoSansKannada-Bold.ttf) not found in candidate paths: ${candidateDirs.join(
      ", ",
    )}`,
  );
}

/**
 * Lazy font registration: Registers Kannada fonts onto a PDFKit document
 * strictly on-demand. Ordinary documents never register or load these fonts.
 */
export function ensureKannadaFontsRegistered(doc: PDFKit.PDFDocument): void {
  if (registeredDocs.has(doc)) {
    return;
  }

  const { regular, bold } = resolveKannadaFontPaths();
  doc.registerFont("Kannada", regular);
  doc.registerFont("Kannada-Bold", bold);
  registeredDocs.add(doc);
}

/**
 * Checks whether a text string contains Kannada Unicode characters.
 * Kannada Unicode block: U+0C80 - U+0CFF.
 */
export function containsKannada(text: string): boolean {
  return /[\u0C80-\u0CFF]/.test(text);
}
