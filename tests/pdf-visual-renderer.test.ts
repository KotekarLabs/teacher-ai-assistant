import { describe, it, expect } from "vitest";
import {
  createA4Document,
  streamToBuffer,
} from "../apps/api/src/services/pdf/pdf-utils";
import {
  resolveKannadaFontPaths,
  ensureKannadaFontsRegistered,
  containsKannada,
} from "../apps/api/src/services/pdf/visual/kannada-font.helper";
import { CanonicalVectors } from "../apps/api/src/services/pdf/visual/canonical-vectors";
import { SortingDiagramRenderer } from "../apps/api/src/services/pdf/visual/sorting-diagram.renderer";
import { renderLessonPdf } from "../apps/api/src/services/pdf/lesson-pdf.renderer";
import { CANONICAL_OBJECT_IDS, type PersistedSortingDiagram } from "../packages/contracts/index";
import { CANONICAL_OBJECTS_CATALOG } from "../apps/api/src/registry/canonical-objects";
import { VERIFIED_CURRICULUM_REGISTRY } from "../apps/api/src/registry/curriculum-registry";

describe("Stage 2 Visual PDF Renderer & Kannada Typography Unit Tests", () => {
  /* -------------------------------------------------------------------------- */
  /* 1. KANNADA FONT HELPER & LAZY REGISTRATION                                 */
  /* -------------------------------------------------------------------------- */
  describe("Kannada Font Helper", () => {
    it("resolves valid filesystem paths for NotoSansKannada Regular & Bold", () => {
      const paths = resolveKannadaFontPaths();
      expect(paths.regular).toContain("NotoSansKannada-Regular.ttf");
      expect(paths.bold).toContain("NotoSansKannada-Bold.ttf");
    });

    it("accurately detects Kannada Unicode characters", () => {
      expect(containsKannada("ಉದ್ದ")).toBe(true);
      expect(containsKannada("ದುಂಡಗೆ")).toBe(true);
      expect(containsKannada("ಬ್ಯಾಟ್")).toBe(true);
      expect(containsKannada("English only text")).toBe(false);
      expect(containsKannada("12345 !@#$%")).toBe(false);
    });

    it("lazily registers fonts on a PDFKit document without throwing", () => {
      const doc = createA4Document();
      expect(() => ensureKannadaFontsRegistered(doc)).not.toThrow();
      // Second call is idempotent
      expect(() => ensureKannadaFontsRegistered(doc)).not.toThrow();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. CANONICAL VECTOR ROUTINES                                               */
  /* -------------------------------------------------------------------------- */
  describe("Canonical Vector Graphics Library", () => {
    it("renders all 8 canonical objects cleanly without throwing", () => {
      const doc = createA4Document();
      for (const id of CANONICAL_OBJECT_IDS) {
        expect(() => {
          CanonicalVectors.draw(doc, id, { x: 50, y: 50, size: 36 });
        }).not.toThrow();
      }
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. SORTING DIAGRAM RENDERER & PROVENANCE                                   */
  /* -------------------------------------------------------------------------- */
  describe("Sorting Diagram Renderer", () => {
    const entry = VERIFIED_CURRICULUM_REGISTRY.JOYFUL_MATH_C1_CH2_V1;

    const mockVisual: PersistedSortingDiagram = {
      format: "SORTING_DIAGRAM",
      concept: "What is Long? What is Round? (Shapes & Movement)",
      shortExplanation:
        "Objects with elongated straight surfaces are long; objects with curved circular surfaces are round.",
      kannadaExplanation:
        "ಉದ್ದವಾದ ವಸ್ತುಗಳು ನೇರವಾಗಿದ್ದು ಜಾರುತ್ತವೆ. ದುಂಡಗಿರುವ ವಸ್ತುಗಳು ವಕ್ರವಾಗಿದ್ದು ಉರುಳುತ್ತವೆ.",
      teacherGuidance:
        "Guide children to discover that real 3D objects change appearance depending on viewing angle.",
      sortingActivity: {
        title: "Long and Round Sorting Board",
        instructions: "Observe each item carefully. Sort them into Long or Round.",
        kannadaInstructions: "ಪ್ರತಿಯೊಂದು ವಸ್ತುವನ್ನು ಗಮನಿಸಿ ವಿಂಗಡಿಸಿ.",
        items: CANONICAL_OBJECT_IDS.map((id) => {
          const canonical = CANONICAL_OBJECTS_CATALOG[id];
          return {
            id: canonical.id,
            nameEnglish: canonical.nameEnglish,
            nameKannada: canonical.nameKannada,
            shapeCategory: canonical.shapeCategory,
            rolls: canonical.rolls,
            slides: canonical.slides,
            perspectiveNote: canonical.multiPerspectiveGuidance.teacherTalkingPoint,
            contextualObservation: `Classroom context for ${canonical.nameEnglish}`,
            kannadaObservation: `${canonical.nameKannada} ವಿವರಣೆ`,
          };
        }),
      },
      provenance: {
        verificationStatus: "VERIFIED",
        curriculumBoard: entry.curriculumBoard,
        textbook: entry.textbook.title,
        edition: entry.textbook.edition,
        chapter: `Chapter ${entry.textbook.chapterNumber}: ${entry.textbook.chapterTitle}`,
        printedPages: entry.textbook.printedPages,
        sourceEvidence: entry.verification.evidenceReference,
        verifiedAt: new Date().toISOString(),
      },
    };

    it("renders a dedicated visual sorting page and outputs a valid PDF buffer", async () => {
      const doc = createA4Document();
      SortingDiagramRenderer.render(doc, mockVisual);
      const buffer = await streamToBuffer(doc);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(15000); // Vector + embedded TTF font subset
      expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    });

    it("renders full lesson PDF with visual board on a dedicated page", async () => {
      const lessonData = {
        id: "test-lesson-id",
        title: "What is Long? What is Round?",
        subject: "Mathematics",
        topic: "What is Long? What is Round?",
        durationMinutes: 40,
        content: {
          title: "What is Long? What is Round?",
          overview: "Introduction to 3D shapes and movement for Class 1.",
          learningObjectives: ["Identify long and round shapes", "Observe rolling and sliding"],
          prerequisites: ["Everyday objects recognition"],
          introduction: "Hook: Look at the ball and pencil!",
          teacherExplanation: "Long shapes slide, round shapes roll.",
          examples: ["Bat slides", "Ball rolls"],
          classroomActivity: {
            title: "Ramp Test",
            instructions: "Roll and slide items on a ramp.",
            durationMinutes: 15,
          },
          practice: ["Find long items"],
          quickAssessment: ["Does a water bottle roll?"],
          homework: "Look for 3 round items at home.",
          teacherScript: "Good morning children!",
          visualExplanation: mockVisual,
        },
      };

      const buffer = await renderLessonPdf(lessonData);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(20000);
      expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    });

    it("DEF-3C-PDF-001 & DEF-3C-PDF-002: verifies exact legal disclaimer and 3/3/2 canonical distribution in actual PDF text", async () => {
      const lessonData = {
        id: "test-lesson-canonical-verification",
        title: "What is Long? What is Round?",
        subject: "Mathematics",
        topic: "What is Long? What is Round?",
        durationMinutes: 40,
        content: {
          title: "What is Long? What is Round?",
          overview: "Class 1 shapes lesson.",
          learningObjectives: ["Identify shapes"],
          prerequisites: ["Everyday objects"],
          introduction: "Hook: shapes",
          teacherExplanation: "Long slides, round rolls.",
          examples: ["Bat slides"],
          classroomActivity: {
            title: "Activity",
            instructions: "Sort items.",
            durationMinutes: 15,
          },
          practice: ["Practice"],
          quickAssessment: ["Assessment"],
          homework: "Homework",
          teacherScript: "Hello class",
          visualExplanation: mockVisual,
        },
      };

      const buffer = await renderLessonPdf(lessonData);
      const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;

      // 1. Exactly 3 pages
      expect(pdf.numPages).toBe(3);

      const page1 = await pdf.getPage(1);
      const page1Tc = await page1.getTextContent();
      const page1Text = page1Tc.items.map((i: any) => i.str).filter(Boolean).join(" ");
      expect(page1Text).toContain("L E S S O N P L A N");
      expect(page1Text).toContain("Lesson Overview");

      const page2 = await pdf.getPage(2);
      const page2Tc = await page2.getTextContent();
      const page2Text = page2Tc.items.map((i: any) => i.str).filter(Boolean).join(" ");

      const page3 = await pdf.getPage(3);
      const page3Tc = await page3.getTextContent();
      const page3Text = page3Tc.items.map((i: any) => i.str).filter(Boolean).join(" ");
      expect(page3Text).toContain("1. Introduction & Hook");
      expect(page3Text).toContain("4. Guided Classroom Activity");

      // 2. DEF-3C-PDF-001: Exact legal disclaimer character-for-character
      const approvedDisclaimer =
        "Legal Disclaimer: Independent teacher-support resource aligned to the Karnataka State Board syllabus; not officially published, endorsed, or approved by KTBS, DSERT, or the Government of Karnataka.";
      expect(page2Text).toContain(approvedDisclaimer);
      expect(page2Text).not.toContain("Notice: Independent");
      expect(page2Text).not.toContain("sponsored");

      // 3. DEF-3C-PDF-002: All eight canonical objects are rendered
      expect(page2Text).toContain("Cricket Bat");
      expect(page2Text).toContain("Ball");
      expect(page2Text).toContain("Pencil");
      expect(page2Text).toContain("Orange");
      expect(page2Text).toContain("Ruler / Scale");
      expect(page2Text).toContain("Bangle");
      expect(page2Text).toContain("Water Bottle");
      expect(page2Text).toContain("Pencil Box");

      // 4. Section mapping verification
      // Long Objects Header -> Cricket Bat, Pencil, Ruler / Scale
      const longHeaderIdx = page2Text.indexOf("Long Objects");
      const roundHeaderIdx = page2Text.indexOf("Round Objects");
      const discoveryIdx = page2Text.indexOf("Roll & Slide Discovery Inquiry");
      const multiHeaderIdx = page2Text.indexOf("Multi-Perspective 3D Objects: Shape Changes by Viewpoint");
      const provenanceIdx = page2Text.indexOf("Curriculum Reference:");

      expect(longHeaderIdx).toBeGreaterThan(-1);
      expect(roundHeaderIdx).toBeGreaterThan(longHeaderIdx);
      expect(discoveryIdx).toBeGreaterThan(roundHeaderIdx);
      expect(multiHeaderIdx).toBeGreaterThan(discoveryIdx);
      expect(provenanceIdx).toBeGreaterThan(multiHeaderIdx);

      // SECTION 1: Binary Sorting Section
      const binarySectionText = page2Text.substring(longHeaderIdx, discoveryIdx);
      const countOccurrences = (str: string, term: string) => str.split(term).length - 1;

      // Verify all six Long/Round canonical objects occur EXACTLY ONCE in binary section
      expect(countOccurrences(binarySectionText, "Cricket Bat")).toBe(1);
      expect(countOccurrences(binarySectionText, "Pencil")).toBe(1);
      expect(countOccurrences(binarySectionText, "Ruler / Scale")).toBe(1);
      expect(countOccurrences(binarySectionText, "Ball")).toBe(1);
      expect(countOccurrences(binarySectionText, "Orange")).toBe(1);
      expect(countOccurrences(binarySectionText, "Bangle")).toBe(1);

      // Verify non-binary objects are completely absent from Section 1
      expect(binarySectionText).not.toContain("Water Bottle");
      expect(binarySectionText).not.toContain("Pencil Box");

      // DISCOVERY INQUIRY: Distinct and Separate Supplementary Element
      const discoveryText = page2Text.substring(discoveryIdx, multiHeaderIdx);
      expect(discoveryText).toContain("Roll & Slide Discovery Inquiry");
      expect(discoveryText).toContain("Pedagogical Discovery");
      // Legitimate pedagogical reference to pencil in discovery inquiry text
      expect(discoveryText.toLowerCase()).toContain("pencil");
      // Ensure discovery inquiry does NOT contain canonical object card titles
      expect(discoveryText).not.toContain("Cricket Bat");
      expect(discoveryText).not.toContain("Ruler / Scale");
      expect(discoveryText).not.toContain("Water Bottle");
      expect(discoveryText).not.toContain("Pencil Box");

      // SECTION 2: Exactly 2 Multi-Perspective objects (Water Bottle, Pencil Box)
      const multiSectionText = page2Text.substring(multiHeaderIdx, provenanceIdx);
      expect(countOccurrences(multiSectionText, "Water Bottle")).toBe(1);
      expect(countOccurrences(multiSectionText, "Pencil Box")).toBe(1);
      // Ensure none of the 6 Long/Round objects are in Multi-Perspective section
      expect(multiSectionText).not.toContain("Cricket Bat");
      expect(multiSectionText.replace("Pencil Box", "")).not.toContain("Pencil");
      expect(multiSectionText).not.toContain("Ruler / Scale");
      expect(multiSectionText).not.toContain("Ball");
      expect(multiSectionText).not.toContain("Orange");
      expect(multiSectionText).not.toContain("Bangle"); // Bangle must NOT be in Section 2

      // PROVENANCE SECTION: Exact approved legal disclaimer
      const provenanceText = page2Text.substring(provenanceIdx);
      expect(provenanceText).toContain(approvedDisclaimer);
      expect(provenanceText).not.toContain("Notice:");
      expect(provenanceText).not.toContain("sponsored");
    });

    it("rejects visual payload with misclassified canonical object", () => {
      const doc = createA4Document();
      const invalidVisual = JSON.parse(JSON.stringify(mockVisual));
      // Tamper with bangle's shapeCategory to MULTI_PERSPECTIVE
      const bangle = invalidVisual.sortingActivity.items.find((i: any) => i.id === "bangle");
      bangle.shapeCategory = "MULTI_PERSPECTIVE";

      expect(() => SortingDiagramRenderer.render(doc, invalidVisual)).toThrow(
        /Canonical object classification mismatch for 'bangle'/,
      );
    });

    it("rejects visual payload with duplicate or missing canonical objects", () => {
      const doc = createA4Document();
      const duplicateVisual = JSON.parse(JSON.stringify(mockVisual));
      duplicateVisual.sortingActivity.items[0] = { ...duplicateVisual.sortingActivity.items[1] };

      expect(() => SortingDiagramRenderer.render(doc, duplicateVisual)).toThrow(
        /Duplicate canonical object detected/,
      );

      const missingVisual = JSON.parse(JSON.stringify(mockVisual));
      missingVisual.sortingActivity.items.pop();

      expect(() => SortingDiagramRenderer.render(doc, missingVisual)).toThrow(
        /Expected exactly 8 canonical objects/,
      );
    });

    it("rejects visual payload with unexpected non-canonical object ID", () => {
      const doc = createA4Document();
      const unexpectedVisual = JSON.parse(JSON.stringify(mockVisual));
      unexpectedVisual.sortingActivity.items[0].id = "marker";

      expect(() => SortingDiagramRenderer.render(doc, unexpectedVisual)).toThrow(
        /Unexpected non-canonical object ID/,
      );
    });

    it("ordinary lesson PDF without visualExplanation renders without touching Kannada fonts", async () => {
      const ordinaryLesson = {
        id: "ordinary-lesson-id",
        title: "Photosynthesis",
        subject: "Science",
        topic: "Photosynthesis and Chlorophyll",
        durationMinutes: 45,
        content: {
          title: "Photosynthesis",
          overview: "How plants convert sunlight into chemical energy.",
          learningObjectives: ["Explain photosynthesis"],
          prerequisites: ["Plant biology basics"],
          introduction: "Hook: Why are leaves green?",
          teacherExplanation: "Chloroplasts capture light photons.",
          examples: ["Oak tree leaves"],
          classroomActivity: {
            title: "Leaf inspection",
            instructions: "Examine leaf stomata with a magnifying glass.",
            durationMinutes: 15,
          },
          practice: ["Draw chloroplast"],
          quickAssessment: ["What gas is released?"],
          homework: "Review chapter 4.",
          teacherScript: "Welcome class!",
        },
      };

      const buffer = await renderLessonPdf(ordinaryLesson);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    });
  });
});
