import { deepFreeze } from "../utils/deep-freeze";
import { CANONICAL_OBJECT_IDS, type CanonicalObjectId } from "@teacher-ai/contracts";

export interface TextbookCitation {
  title: string;
  edition: string;
  chapterNumber: number;
  chapterTitle: string;
  printedPages: string;
  publisher: string;
}

export interface VerificationEvidence {
  status: "VERIFIED";
  auditMethod: "DIGITAL_TEXTBOOK_PDF_INSPECTION";
  sourceInspectionDate: string; // ISO 8601 date: "2026-11-04"
  evidenceReference: string;
  auditorRole: "INTERNAL_CURRICULUM_AUDIT";
  officialBoardEndorsement: false;
  disclaimer: string;
}

export interface VerifiedCurriculumEntry {
  id: "JOYFUL_MATH_C1_CH2_V1";
  curriculumBoard: "Karnataka State Board";
  grade: "1";
  subject: "Mathematics";
  topicName: "What is Long? What is Round?";
  kannadaTopicName: "ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?";
  textbook: TextbookCitation;
  verification: VerificationEvidence;
  pedagogicalConstraints: {
    targetAge: 6;
    format: "SORTING_DIAGRAM";
    concepts: readonly ["Long vs Round", "Rolling vs Sliding", "Multi-perspective viewing"];
    canonicalObjects: readonly CanonicalObjectId[];
  };
}

export const VERIFIED_CURRICULUM_REGISTRY: Record<string, Readonly<VerifiedCurriculumEntry>> = deepFreeze({
  JOYFUL_MATH_C1_CH2_V1: {
    id: "JOYFUL_MATH_C1_CH2_V1",
    curriculumBoard: "Karnataka State Board",
    grade: "1",
    subject: "Mathematics",
    topicName: "What is Long? What is Round?",
    kannadaTopicName: "ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?",
    textbook: {
      title: "Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual",
      edition: "Revised 2026–27",
      chapterNumber: 2,
      chapterTitle: "What is Long? What is Round?",
      printedPages: "13–14",
      publisher: "Karnataka Textbook Society (KTBS), Bengaluru",
    },
    verification: {
      status: "VERIFIED",
      auditMethod: "DIGITAL_TEXTBOOK_PDF_INSPECTION",
      sourceInspectionDate: "2026-11-04",
      evidenceReference:
        "Inspection of uploaded digital textbook PDF: Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual (Revised 2026–27), Chapter 2, printed pages 13–14, Section: Shapes (ಆಕಾರಗಳು).",
      auditorRole: "INTERNAL_CURRICULUM_AUDIT",
      officialBoardEndorsement: false,
      disclaimer:
        "Independent teacher-support resource aligned to the Karnataka State Board syllabus; not officially published, endorsed, or approved by KTBS, DSERT, or the Government of Karnataka.",
    },
    pedagogicalConstraints: {
      targetAge: 6,
      format: "SORTING_DIAGRAM",
      concepts: ["Long vs Round", "Rolling vs Sliding", "Multi-perspective viewing"],
      canonicalObjects: CANONICAL_OBJECT_IDS,
    },
  },
});

export class CurriculumRegistry {
  static getEntry(topicId: string): VerifiedCurriculumEntry | null {
    return (VERIFIED_CURRICULUM_REGISTRY[topicId] as VerifiedCurriculumEntry) ?? null;
  }

  static getAllEntries(): VerifiedCurriculumEntry[] {
    return Object.values(VERIFIED_CURRICULUM_REGISTRY) as VerifiedCurriculumEntry[];
  }

  static validateClassEligibility(
    entry: VerifiedCurriculumEntry,
    targetClass: { grade: string; curriculumBoard?: string | null },
    teacherProfile?: { subjects?: string[] } | null,
    requestedSubject?: string,
  ): { eligible: boolean; reason?: string } {
    // 1. Validate requested subject matches entry
    if (!requestedSubject || requestedSubject.trim() === "") {
      return {
        eligible: false,
        reason: "Subject is required for curriculum topic generation.",
      };
    }

    const normReqSubject = requestedSubject.trim().toLowerCase();
    const normEntrySubject = entry.subject.trim().toLowerCase();
    const isMath =
      normReqSubject === normEntrySubject ||
      (normEntrySubject === "mathematics" && (normReqSubject === "math" || normReqSubject === "maths"));

    if (!isMath) {
      return {
        eligible: false,
        reason: `Subject '${requestedSubject}' does not match verified topic subject '${entry.subject}'.`,
      };
    }

    // 2. Validate teacher profile lists the subject
    if (teacherProfile?.subjects && teacherProfile.subjects.length > 0) {
      const teacherHasMath = teacherProfile.subjects.some((s) => {
        const norm = s.trim().toLowerCase();
        return norm === "mathematics" || norm === "math" || norm === "maths";
      });
      if (!teacherHasMath) {
        return {
          eligible: false,
          reason: `Educator profile subjects (${teacherProfile.subjects.join(", ")}) do not list '${entry.subject}'.`,
        };
      }
    }

    // 3. Validate class grade
    const normClassGrade = targetClass.grade.replace(/^(grade|class)\s*/i, "").trim();
    if (normClassGrade !== entry.grade) {
      return {
        eligible: false,
        reason: `Target class grade '${targetClass.grade}' does not match verified topic grade 'Class ${entry.grade}'.`,
      };
    }

    // 4. Validate class curriculum board compatibility
    if (targetClass.curriculumBoard && targetClass.curriculumBoard.trim() !== "") {
      const normClassBoard = targetClass.curriculumBoard.trim().toLowerCase();
      const normEntryBoard = entry.curriculumBoard.trim().toLowerCase();
      const isKarnataka =
        normClassBoard === normEntryBoard ||
        normClassBoard === "karnataka state board" ||
        normClassBoard === "karnataka board" ||
        normClassBoard === "kseeb" ||
        normClassBoard === "ktbs";
      if (!isKarnataka) {
        return {
          eligible: false,
          reason: `Class curriculum board '${targetClass.curriculumBoard}' is not compatible with verified topic board '${entry.curriculumBoard}'.`,
        };
      }
    }

    return { eligible: true };
  }
}
