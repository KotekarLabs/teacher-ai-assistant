import { describe, it, expect } from "vitest";
import {
  AIGeneratedVisualLessonSchema,
  PersistedSortingDiagramSchema,
  CANONICAL_OBJECT_IDS,
  CanonicalObjectIdEnum,
  type LessonContent,
} from "../packages/contracts/index";
import {
  CANONICAL_OBJECTS_CATALOG,
} from "../apps/api/src/registry/canonical-objects";
import {
  VERIFIED_CURRICULUM_REGISTRY,
  CurriculumRegistry,
} from "../apps/api/src/registry/curriculum-registry";
import { hydrateVisualLesson } from "../apps/api/src/services/visual-hydration.utils";
import { mergeLessonContent } from "../apps/api/src/services/lesson-merge.utils";
import {
  redactSensitiveDiagnostics,
  createSafeErrorMessage,
} from "../apps/api/src/utils/redaction";
import { isDeepFrozen } from "../apps/api/src/utils/deep-freeze";

describe("Tier 1 Unit Tests — Visual Explanation, Hydration & Immutability", () => {
  /* -------------------------------------------------------------------------- */
  /* 1. DEEP IMMUTABILITY TESTS                                                 */
  /* -------------------------------------------------------------------------- */
  describe("Canonical Objects Catalogue Immutability", () => {
    it("is deeply frozen at root, entry, and nested multiPerspectiveGuidance levels", () => {
      expect(isDeepFrozen(CANONICAL_OBJECTS_CATALOG)).toBe(true);
      expect(Object.isFrozen(CANONICAL_OBJECTS_CATALOG)).toBe(true);

      for (const key of Object.keys(CANONICAL_OBJECTS_CATALOG)) {
        const obj = CANONICAL_OBJECTS_CATALOG[key as keyof typeof CANONICAL_OBJECTS_CATALOG];
        expect(Object.isFrozen(obj)).toBe(true);
        if (obj.multiPerspectiveGuidance) {
          expect(Object.isFrozen(obj.multiPerspectiveGuidance)).toBe(true);
        }
      }
    });

    it("throws or fails when attempting to mutate catalogue properties", () => {
      expect(() => {
        // @ts-expect-error - mutation test
        CANONICAL_OBJECTS_CATALOG.ball = {} as any;
      }).toThrow();

      expect(() => {
        // @ts-expect-error - mutation test
        CANONICAL_OBJECTS_CATALOG.ball.nameEnglish = "Mutated Ball";
      }).toThrow();

      expect(() => {
        // @ts-expect-error - mutation test
        CANONICAL_OBJECTS_CATALOG.bottle.multiPerspectiveGuidance.teacherTalkingPoint = "Hacked";
      }).toThrow();
    });
  });

  describe("Curriculum Registry Immutability", () => {
    it("is deeply frozen across root and all nested registry metadata", () => {
      expect(isDeepFrozen(VERIFIED_CURRICULUM_REGISTRY)).toBe(true);
      expect(Object.isFrozen(VERIFIED_CURRICULUM_REGISTRY)).toBe(true);

      const entry = VERIFIED_CURRICULUM_REGISTRY.JOYFUL_MATH_C1_CH2_V1;
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry.textbook)).toBe(true);
      expect(Object.isFrozen(entry.pedagogicalConstraints)).toBe(true);
      expect(Object.isFrozen(entry.pedagogicalConstraints.canonicalObjects)).toBe(true);
      expect(Object.isFrozen(entry.verification)).toBe(true);
    });

    it("throws or fails when attempting to mutate registry properties", () => {
      expect(() => {
        // @ts-expect-error - mutation test
        VERIFIED_CURRICULUM_REGISTRY.JOYFUL_MATH_C1_CH2_V1.grade = "2";
      }).toThrow();

      expect(() => {
        // @ts-expect-error - mutation test
        (VERIFIED_CURRICULUM_REGISTRY.JOYFUL_MATH_C1_CH2_V1.pedagogicalConstraints.canonicalObjects as any).push("cube");
      }).toThrow();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. CANONICAL EIGHT OBJECTS CATALOGUE TESTS                                  */
  /* -------------------------------------------------------------------------- */
  describe("Authoritative Eight Objects Catalogue Verification", () => {
    it("contains exactly 8 approved canonical objects matching CANONICAL_OBJECT_IDS", () => {
      const catalogKeys = Object.keys(CANONICAL_OBJECTS_CATALOG);
      expect(catalogKeys.length).toBe(8);
      expect(catalogKeys.sort()).toEqual([...CANONICAL_OBJECT_IDS].sort());
    });

    it("verifies accurate properties for all 8 objects", () => {
      // 1. bat
      const bat = CANONICAL_OBJECTS_CATALOG.bat;
      expect(bat.id).toBe("bat");
      expect(bat.nameEnglish).toBe("Cricket Bat");
      expect(bat.nameKannada).toBe("ಬ್ಯಾಟ್ (ಬ್ಯಾಟು)");
      expect(bat.shapeCategory).toBe("LONG");
      expect(bat.rolls).toBe(false);
      expect(bat.slides).toBe(true);

      // 2. ball
      const ball = CANONICAL_OBJECTS_CATALOG.ball;
      expect(ball.id).toBe("ball");
      expect(ball.nameEnglish).toBe("Ball");
      expect(ball.nameKannada).toBe("ಚೆಂಡು");
      expect(ball.shapeCategory).toBe("ROUND");
      expect(ball.rolls).toBe(true);
      expect(ball.slides).toBe(false);

      // 3. pencil
      const pencil = CANONICAL_OBJECTS_CATALOG.pencil;
      expect(pencil.id).toBe("pencil");
      expect(pencil.nameEnglish).toBe("Pencil");
      expect(pencil.nameKannada).toBe("ಪೆನ್ಸಿಲ್");
      expect(pencil.shapeCategory).toBe("LONG");
      expect(pencil.rolls).toBe(true);
      expect(pencil.slides).toBe(true);

      // 4. orange
      const orange = CANONICAL_OBJECTS_CATALOG.orange;
      expect(orange.id).toBe("orange");
      expect(orange.nameEnglish).toBe("Orange");
      expect(orange.nameKannada).toBe("ಕಿತ್ತಳೆ ಹಣ್ಣು");
      expect(orange.shapeCategory).toBe("ROUND");
      expect(orange.rolls).toBe(true);
      expect(orange.slides).toBe(false);

      // 5. ruler
      const ruler = CANONICAL_OBJECTS_CATALOG.ruler;
      expect(ruler.id).toBe("ruler");
      expect(ruler.nameEnglish).toBe("Ruler / Scale");
      expect(ruler.nameKannada).toBe("ಅಳತೆಗೋಲು (ಸ್ಕೇಲ್)");
      expect(ruler.shapeCategory).toBe("LONG");
      expect(ruler.rolls).toBe(false);
      expect(ruler.slides).toBe(true);

      // 6. bangle
      const bangle = CANONICAL_OBJECTS_CATALOG.bangle;
      expect(bangle.id).toBe("bangle");
      expect(bangle.nameEnglish).toBe("Bangle");
      expect(bangle.nameKannada).toBe("ಬಳೆ");
      expect(bangle.shapeCategory).toBe("ROUND");
      expect(bangle.rolls).toBe(true);
      expect(bangle.slides).toBe(false);
      expect(bangle.multiPerspectiveGuidance.isMultiPerspective).toBe(true);

      // 7. bottle
      const bottle = CANONICAL_OBJECTS_CATALOG.bottle;
      expect(bottle.id).toBe("bottle");
      expect(bottle.nameEnglish).toBe("Water Bottle");
      expect(bottle.nameKannada).toBe("ಬಾಟಲ್");
      expect(bottle.shapeCategory).toBe("MULTI_PERSPECTIVE");
      expect(bottle.rolls).toBe(true);
      expect(bottle.slides).toBe(true);
      expect(bottle.multiPerspectiveGuidance.isMultiPerspective).toBe(true);

      // 8. pencil_box
      const pencilBox = CANONICAL_OBJECTS_CATALOG.pencil_box;
      expect(pencilBox.id).toBe("pencil_box");
      expect(pencilBox.nameEnglish).toBe("Pencil Box");
      expect(pencilBox.nameKannada).toBe("ಪೆನ್ಸಿಲ್ ಬಾಕ್ಸ್");
      expect(pencilBox.shapeCategory).toBe("MULTI_PERSPECTIVE");
      expect(pencilBox.rolls).toBe(false);
      expect(pencilBox.slides).toBe(true);
      expect(pencilBox.multiPerspectiveGuidance.isMultiPerspective).toBe(true);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. CURRICULUM REGISTRY & ELIGIBILITY TESTS                                 */
  /* -------------------------------------------------------------------------- */
  describe("Curriculum Registry & Validation", () => {
    const entry = VERIFIED_CURRICULUM_REGISTRY.JOYFUL_MATH_C1_CH2_V1;

    it("has digital textbook PDF inspection provenance and accurate non-endorsement disclaimer", () => {
      expect(entry.verification.auditMethod).toBe("DIGITAL_TEXTBOOK_PDF_INSPECTION");
      expect(entry.verification.sourceInspectionDate).toBe("2026-11-04");
      expect(entry.verification.status).toBe("VERIFIED");
      expect(entry.verification.officialBoardEndorsement).toBe(false);
      expect(entry.verification.disclaimer).toContain("not officially published, endorsed, or approved by KTBS");
      expect(entry.textbook.publisher).toBe("Karnataka Textbook Society (KTBS), Bengaluru");
    });

    it("validates class eligibility accurately", () => {
      // Valid case: Class 1, Mathematics, teacher profile includes Mathematics
      const valid = CurriculumRegistry.validateClassEligibility(
        entry,
        { grade: "1" },
        { subjects: ["Mathematics", "Science"] },
        "Mathematics",
      );
      expect(valid.eligible).toBe(true);

      // Mismatched grade: Class 2
      const invalidGrade = CurriculumRegistry.validateClassEligibility(
        entry,
        { grade: "2" },
        { subjects: ["Mathematics"] },
        "Mathematics",
      );
      expect(invalidGrade.eligible).toBe(false);
      expect(invalidGrade.reason).toContain("Target class grade '2' does not match");

      // Mismatched subject: Science
      const invalidSubject = CurriculumRegistry.validateClassEligibility(
        entry,
        { grade: "1" },
        { subjects: ["Mathematics", "Science"] },
        "Science",
      );
      expect(invalidSubject.eligible).toBe(false);
      expect(invalidSubject.reason).toContain("Subject 'Science' does not match");

      // Teacher profile does not teach Mathematics
      const invalidTeacher = CurriculumRegistry.validateClassEligibility(
        entry,
        { grade: "1" },
        { subjects: ["English", "Social Studies"] },
        "Mathematics",
      );
      expect(invalidTeacher.eligible).toBe(false);
      expect(invalidTeacher.reason).toContain("do not list 'Mathematics'");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. ZOD SCHEMAS & ZERO-PROVENANCE AI OUTPUT CONTRACTS                      */
  /* -------------------------------------------------------------------------- */
  describe("Zod Schemas & Zero-Provenance Verification", () => {
    const validAiItems = CANONICAL_OBJECT_IDS.map((id) => ({
      id,
      contextualObservation: `Observation for ${id}`,
      kannadaObservation: `${id} ವಿವರಣೆ`,
    }));

    const validAiOutput = {
      format: "SORTING_DIAGRAM" as const,
      concept: "Long and Round Objects Sorting",
      shortExplanation: "Objects can be long or round based on their shape and movement.",
      kannadaExplanation: "ವಸ್ತುಗಳ ಆಕಾರ ಮತ್ತು ಚಲನೆಯ ಆಧಾರದ ಮೇಲೆ ವಿಂಗಡಣೆ.",
      teacherGuidance: "Guide students to observe physical shapes and movement on the floor.",
      sortingActivity: {
        title: "Hands-on Classroom Sorting",
        instructions: "Pick each object and test if it rolls or slides.",
        kannadaInstructions: "ಪ್ರತಿಯೊಂದು ವಸ್ತುವನ್ನು ತೆಗೆದುಕೊಂಡು ಅದು ಉರುಳುತ್ತದೆಯೇ ಅಥವಾ ಜಾರುತ್ತದೆಯೇ ಎಂದು ಪರೀಕ್ಷಿಸಿ.",
        items: validAiItems,
      },
    };

    it("AIGeneratedVisualLessonSchema validates valid 8-item AI output", () => {
      const parsed = AIGeneratedVisualLessonSchema.safeParse(validAiOutput);
      expect(parsed.success).toBe(true);
    });

    it("AIGeneratedVisualLessonSchema rejects incomplete items list (<8 items)", () => {
      const incomplete = {
        ...validAiOutput,
        sortingActivity: {
          ...validAiOutput.sortingActivity,
          items: validAiItems.slice(0, 4),
        },
      };
      const parsed = AIGeneratedVisualLessonSchema.safeParse(incomplete);
      expect(parsed.success).toBe(false);
    });

    it("CanonicalObjectIdEnum rejects unapproved object IDs", () => {
      expect(CanonicalObjectIdEnum.safeParse("ball").success).toBe(true);
      expect(CanonicalObjectIdEnum.safeParse("unapproved_apple").success).toBe(false);
      expect(CanonicalObjectIdEnum.safeParse("cylinder").success).toBe(false);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. VISUAL HYDRATION ENGINE                                                */
  /* -------------------------------------------------------------------------- */
  describe("Visual Hydration Engine", () => {
    it("hydrates AI output with canonical catalog metadata and server provenance", () => {
      const provenance = {
        verificationStatus: "VERIFIED" as const,
        curriculumBoard: "Karnataka State Board",
        textbook: "Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual",
        edition: "Revised 2026–27",
        chapter: "Chapter 2: What is Long? What is Round?",
        printedPages: "13–14",
        sourceEvidence: "Digital PDF Inspection",
        verifiedAt: new Date().toISOString(),
      };

      const aiRaw = {
        format: "SORTING_DIAGRAM" as const,
        concept: "Long vs Round Shapes",
        shortExplanation: "Sorting everyday classroom objects into long and round.",
        kannadaExplanation: "ದೈನಂದಿನ ವಸ್ತುಗಳನ್ನು ವಿಂಗಡಿಸುವುದು.",
        teacherGuidance: "Hands on sorting activity using classroom materials.",
        sortingActivity: {
          title: "Object Sorting",
          instructions: "Test rolling and sliding on a desk.",
          kannadaInstructions: "ಮೇಜಿನ ಮೇಲೆ ಉರುಳುವಿಕೆ ಮತ್ತು ಜಾರುವಿಕೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ.",
          items: CANONICAL_OBJECT_IDS.map((id) => ({
            id,
            contextualObservation: `Context for ${id}`,
            kannadaObservation: `${id} ವಿವರ`,
          })),
        },
      };

      const hydrated = hydrateVisualLesson(aiRaw, provenance);

      // Verifications
      expect(hydrated.format).toBe("SORTING_DIAGRAM");
      expect(hydrated.provenance).toEqual(provenance);
      expect(hydrated.sortingActivity.items.length).toBe(8);

      // Verify server metadata overwrote/hydrated canonical properties
      const bat = hydrated.sortingActivity.items.find((i) => i.id === "bat")!;
      expect(bat.nameEnglish).toBe("Cricket Bat");
      expect(bat.nameKannada).toBe("ಬ್ಯಾಟ್ (ಬ್ಯಾಟು)");
      expect(bat.shapeCategory).toBe("LONG");
      expect(bat.rolls).toBe(false);
      expect(bat.slides).toBe(true);
      expect(bat.contextualObservation).toBe("Context for bat");

      const ball = hydrated.sortingActivity.items.find((i) => i.id === "ball")!;
      expect(ball.nameEnglish).toBe("Ball");
      expect(ball.nameKannada).toBe("ಚೆಂಡು");
      expect(ball.shapeCategory).toBe("ROUND");
      expect(ball.rolls).toBe(true);
      expect(ball.slides).toBe(false);

      // Verify schema compliance of final persisted object
      const schemaCheck = PersistedSortingDiagramSchema.safeParse(hydrated);
      expect(schemaCheck.success).toBe(true);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 6. SAFE PARTIAL LESSON MERGE MATRIX                                        */
  /* -------------------------------------------------------------------------- */
  describe("Safe Partial Lesson Merge Engine", () => {
    const provenance = {
      verificationStatus: "VERIFIED" as const,
      curriculumBoard: "Karnataka State Board",
      textbook: "Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual",
      edition: "Revised 2026–27",
      chapter: "Chapter 2: What is Long? What is Round?",
      printedPages: "13–14",
      sourceEvidence: "Digital PDF Inspection",
      verifiedAt: new Date().toISOString(),
    };

    const baseVisual = hydrateVisualLesson(
      {
        format: "SORTING_DIAGRAM",
        concept: "Long and Round Exploration",
        shortExplanation: "Distinguishing between long and round shapes.",
        kannadaExplanation: "ಉದ್ದ ಮತ್ತು ದುಂಡು ಆಕಾರಗಳನ್ನು ಗುರುತಿಸುವುದು.",
        teacherGuidance: "Initial teacher guidance notes.",
        sortingActivity: {
          title: "Sorting Activity",
          instructions: "Test objects on a slope.",
          kannadaInstructions: "ಇಳಿಜಾರಿನ ಮೇಲೆ ವಸ್ತುಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.",
          items: CANONICAL_OBJECT_IDS.map((id) => ({
            id,
            contextualObservation: `Observation ${id}`,
            kannadaObservation: `ವಿವರ ${id}`,
          })),
        },
      },
      provenance,
    );

    const fullLesson: LessonContent = {
      title: "Class 1 Shapes & Movement",
      overview: "Sorting everyday items into long and round.",
      learningObjectives: ["Identify long vs round objects", "Discover rolling vs sliding"],
      prerequisites: ["Familiarity with everyday household toys and utensils"],
      introduction: "Look at this ball and cricket bat. How do they move?",
      teacherExplanation: "Long objects slide or roll depending on orientation. Round objects roll freely.",
      examples: ["A ball rolls on the ground", "A bat slides on its flat face"],
      classroomActivity: {
        title: "Hands-on Slope Rolling Test",
        instructions: "Place each object on a tilted cardboard ramp and observe if it rolls or slides.",
        durationMinutes: 20,
      },
      practice: ["Point to objects in the classroom that roll"],
      quickAssessment: ["Does a cricket bat roll or slide?"],
      homework: "Find three round objects at home with parents.",
      teacherScript: "Namaskara children! Today we play with long and round objects.",
      visualExplanation: baseVisual,
    };

    it("performs concept-only update leaving visualExplanation intact", () => {
      const merged = mergeLessonContent(fullLesson, {
        title: "Updated Shapes Lesson",
        overview: "Updated overview description.",
      });

      expect(merged.title).toBe("Updated Shapes Lesson");
      expect(merged.overview).toBe("Updated overview description.");
      expect(merged.visualExplanation).toEqual(fullLesson.visualExplanation);
    });

    it("updates teacherGuidance without losing canonical objects", () => {
      const merged = mergeLessonContent(fullLesson, {
        visualExplanation: {
          teacherGuidance: "Updated teacher guidance for outdoor playground setup.",
        },
      });

      expect(merged.visualExplanation?.teacherGuidance).toBe(
        "Updated teacher guidance for outdoor playground setup.",
      );
      expect(merged.visualExplanation?.sortingActivity.items.length).toBe(8);
      expect(merged.visualExplanation?.provenance).toEqual(fullLesson.visualExplanation?.provenance);
    });

    it("updates contextualObservation across the 8 canonical items without losing catalog metadata", () => {
      const updatedItems = CANONICAL_OBJECT_IDS.map((id) => ({
        id,
        contextualObservation: id === "bat" ? "Custom bat observation" : `Observation ${id}`,
      }));

      const merged = mergeLessonContent(fullLesson, {
        visualExplanation: {
          sortingActivity: {
            items: updatedItems,
          },
        },
      });

      const updatedBat = merged.visualExplanation?.sortingActivity.items.find((i) => i.id === "bat");
      expect(updatedBat?.contextualObservation).toBe("Custom bat observation");
      expect(updatedBat?.nameEnglish).toBe("Cricket Bat");
      expect(updatedBat?.nameKannada).toBe("ಬ್ಯಾಟ್ (ಬ್ಯಾಟು)");
      expect(merged.visualExplanation?.sortingActivity.items.length).toBe(8);
    });

    it("rejects invalid partial visual explanation without corrupting lesson state", () => {
      expect(() => {
        mergeLessonContent(fullLesson, {
          // @ts-expect-error - invalid type test
          title: "", // empty title violates validation
        });
      }).toThrow(/Merged lesson content failed complete schema validation/);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 7. REDACTION & DIAGNOSTIC SANITIZATION                                      */
  /* -------------------------------------------------------------------------- */
  describe("Diagnostic and Error Redaction", () => {
    it("redacts API keys, Bearer tokens, and connection strings", () => {
      const rawText = "Error communicating with openai: Bearer sk-proj1234567890abcdef1234567890 at postgres://admin:secretPass@localhost:5432/db";
      const redacted = redactSensitiveDiagnostics(rawText);

      expect(redacted).not.toContain("sk-proj1234567890abcdef1234567890");
      expect(redacted).not.toContain("Bearer sk-proj1234567890abcdef1234567890");
      expect(redacted).not.toContain("secretPass");
      expect(redacted).toContain("[REDACTED]");
    });

    it("creates safe error messages from Error instances", () => {
      const error = new Error("Failed to connect to postgresql://user:pwd@db.host/prod with token Bearer xyz1234567");
      const safe = createSafeErrorMessage(error);
      expect(safe).not.toContain("pwd");
      expect(safe).not.toContain("xyz1234567");
      expect(safe).toContain("[REDACTED]");
    });
  });
});
