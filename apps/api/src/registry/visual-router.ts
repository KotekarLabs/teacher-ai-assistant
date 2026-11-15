import { CurriculumRegistry } from "./curriculum-registry";
import type { VisualFormatType } from "@teacher-ai/contracts";

export class VisualRouter {
  /**
   * Resolves the visual format type from a verified curriculum topic ID.
   */
  static getVisualFormat(curriculumTopicId: string): VisualFormatType | null {
    const entry = CurriculumRegistry.getEntry(curriculumTopicId);
    if (!entry) return null;
    return entry.pedagogicalConstraints.format;
  }
}
