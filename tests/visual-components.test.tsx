// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  CanonicalVectorGraphic,
  SortingObjectCard,
  MultiPerspectiveCard,
  CurriculumProvenanceCard,
  BilingualSortingBoard,
} from "../apps/web/src/components/visual";
import {
  CANONICAL_OBJECT_IDS,
  type PersistedSortingObject,
  type PersistedSortingDiagram,
  type LessonProvenance,
} from "../packages/contracts/index";

afterEach(() => {
  cleanup();
});

const mockProvenance: LessonProvenance = {
  verificationStatus: "VERIFIED",
  curriculumBoard: "Karnataka State Board",
  textbook: "Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual",
  edition: "Revised 2026–27",
  chapter: "Chapter 2: What is Long? What is Round?",
  printedPages: "13–14",
  sourceEvidence: "Inspection of uploaded digital textbook PDF, Chapter 2, printed pages 13–14.",
  verifiedAt: new Date().toISOString(),
};

const mockSortingItems: PersistedSortingObject[] = [
  {
    id: "bat",
    nameEnglish: "Cricket Bat",
    nameKannada: "ಕ್ರಿಕೆಟ್ ಬ್ಯಾಟ್",
    shapeCategory: "LONG",
    rolls: false,
    slides: true,
    contextualObservation: "Long wooden bat used in cricket. Slides along the ground.",
    kannadaObservation: "ಉದ್ದವಾದ ಮರದ ಬ್ಯಾಟ್. ನೆಲದ ಮೇಲೆ ಜಾರುತ್ತದೆ.",
  },
  {
    id: "ball",
    nameEnglish: "Rubber Ball",
    nameKannada: "ರಬ್ಬರ್ ಚೆಂಡು",
    shapeCategory: "ROUND",
    rolls: true,
    slides: false,
    contextualObservation: "Round red ball with seam curves. Rolls smoothly.",
    kannadaObservation: "ದುಂಡಗಿನ ಕೆಂಪು ಚೆಂಡು. ಸುಲಭವಾಗಿ ಉರುಳುತ್ತದೆ.",
  },
  {
    id: "pencil",
    nameEnglish: "Pencil",
    nameKannada: "ಪೆನ್ಸಿಲ್",
    shapeCategory: "LONG",
    rolls: false,
    slides: true,
    contextualObservation: "Long wooden writing pencil. Slides when pushed flat.",
    kannadaObservation: "ಉದ್ದವಾದ ಮರದ ಪೆನ್ಸಿಲ್. ಚಪ್ಪಟೆಯಾಗಿ ಇಟ್ಟಾಗ ಜಾರುತ್ತದೆ.",
  },
  {
    id: "orange",
    nameEnglish: "Orange",
    nameKannada: "ಕಿತ್ತಳೆ ಹಣ್ಣು",
    shapeCategory: "ROUND",
    rolls: true,
    slides: false,
    contextualObservation: "Round citrus fruit. Rolls in any direction.",
    kannadaObservation: "ದುಂಡಗಿನ ಸಿಹಿ ಕಿತ್ತಳೆ ಹಣ್ಣು. ಎಲ್ಲ ದಿಕ್ಕುಗಳಲ್ಲೂ ಉರುಳುತ್ತದೆ.",
  },
  {
    id: "ruler",
    nameEnglish: "Ruler / Scale",
    nameKannada: "ರೂಲರ್ / ಸ್ಕೇಲ್",
    shapeCategory: "LONG",
    rolls: false,
    slides: true,
    contextualObservation: "Straight flat plastic scale. Slides across desks.",
    kannadaObservation: "ಉದ್ದವಾದ ಪ್ಲಾಸ್ಟಿಕ್ ಅಳತೆಪಟ್ಟಿ. ಬೆಂಚಿನ ಮೇಲೆ ಜಾರುತ್ತದೆ.",
  },
  {
    id: "bangle",
    nameEnglish: "Bangle",
    nameKannada: "ಬಳೆ",
    shapeCategory: "MULTI_PERSPECTIVE",
    rolls: true,
    slides: false,
    perspectiveNote:
      "Circular ring that rolls along its rim; appears like a straight line when viewed edge-on.",
    contextualObservation: "Golden circular ornament worn on wrist.",
    kannadaObservation: "ದುಂಡಗಿನ ಚಿನ್ನದ ಬಳೆ. ಅಂಚಿನ ಮೇಲೆ ಉರುಳುತ್ತದೆ.",
  },
  {
    id: "bottle",
    nameEnglish: "Water Bottle",
    nameKannada: "ನೀರಿನ ಬಾಟಲಿ",
    shapeCategory: "MULTI_PERSPECTIVE",
    rolls: true,
    slides: true,
    perspectiveNote:
      "Long cylindrical body when viewed from the side; circular shape when viewed from its base.",
    contextualObservation: "Blue drinking water bottle.",
    kannadaObservation: "ಉದ್ದವಾದ ನೀರಿನ ಬಾಟಲಿ. ಕೆಳಗಿನಿಂದ ದುಂಡಾಗಿರುತ್ತದೆ.",
  },
  {
    id: "pencil_box",
    nameEnglish: "Pencil Box",
    nameKannada: "ಪೆನ್ಸಿಲ್ ಬಾಕ್ಸ್",
    shapeCategory: "MULTI_PERSPECTIVE",
    rolls: false,
    slides: true,
    perspectiveNote:
      "Elongated cuboid with flat faces; slides rather than rolls under the demonstrated conditions.",
    contextualObservation: "Purple metal pencil box with latch.",
    kannadaObservation: "ಚಪ್ಪಟೆ ಮುಖಗಳಿರುವ ಉದ್ದವಾದ ಪೆನ್ಸಿಲ್ ಪೆಟ್ಟಿಗೆ.",
  },
];

const mockVisualDiagram: PersistedSortingDiagram = {
  format: "SORTING_DIAGRAM",
  concept: "Long vs Round, Rolling vs Sliding, and Multi-Perspective Viewing",
  shortExplanation:
    "Some objects are long and slide, some objects are round and roll, and some 3D objects change shape depending on how you look at them.",
  kannadaExplanation:
    "ಕೆಲವು ವಸ್ತುಗಳು ಉದ್ದವಾಗಿದ್ದು ಜಾರುತ್ತವೆ, ಕೆಲವು ವಸ್ತುಗಳು ದುಂಡಗಿದ್ದು ಉರುಳುತ್ತವೆ.",
  teacherGuidance:
    "Use actual classroom items (a real bottle, bangle, ruler) to let students physically test rolling and sliding.",
  sortingActivity: {
    title: "Visual Sorting Board: What is Long? What is Round?",
    instructions:
      "Examine the 8 classroom items. Sort items into Long (Slides) or Round (Rolls). Discover the multi-perspective items!",
    kannadaInstructions:
      "೮ ತರಗತಿಯ ವಸ್ತುಗಳನ್ನು ಗಮನಿಸಿ. ಉದ್ದವಾದ ಮತ್ತು ದುಂಡಗಿನ ವಸ್ತುಗಳನ್ನು ವಿಂಗಡಿಸಿ.",
    items: mockSortingItems,
  },
  provenance: mockProvenance,
};

describe("Visual Teaching Components Suite", () => {
  describe("CanonicalVectorGraphic", () => {
    it.each(CANONICAL_OBJECT_IDS)(
      "renders canonical object '%s' with valid SVG elements",
      (objectId) => {
        const { container } = render(
          <CanonicalVectorGraphic id={objectId} size={64} />,
        );
        const svg = container.querySelector("svg");
        expect(svg).toBeDefined();
        expect(svg?.getAttribute("role")).toBe("img");
        expect(svg?.getAttribute("width")).toBe("64");
        expect(svg?.getAttribute("height")).toBe("64");
        expect(screen.getByTestId(`vector-${objectId}`)).toBeDefined();
      },
    );
  });

  describe("SortingObjectCard", () => {
    it("renders Long object with bilingual names and 'Slides' badge", () => {
      const batItem = mockSortingItems.find((i) => i.id === "bat")!;
      render(<SortingObjectCard item={batItem} />);

      expect(screen.getByRole("heading", { name: "Cricket Bat" })).toBeDefined();
      expect(screen.getByText("ಕ್ರಿಕೆಟ್ ಬ್ಯಾಟ್")).toBeDefined();
      expect(screen.getByText(/Slides \(ಜಾರುತ್ತದೆ\)/)).toBeDefined();
      expect(
        screen.getByText(/Long wooden bat used in cricket/),
      ).toBeDefined();
      expect(screen.getByText(/ಉದ್ದವಾದ ಮರದ ಬ್ಯಾಟ್/)).toBeDefined();
    });

    it("renders Round object with bilingual names and 'Rolls' badge", () => {
      const ballItem = mockSortingItems.find((i) => i.id === "ball")!;
      render(<SortingObjectCard item={ballItem} />);

      expect(screen.getByRole("heading", { name: "Rubber Ball" })).toBeDefined();
      expect(screen.getByText("ರಬ್ಬರ್ ಚೆಂಡು")).toBeDefined();
      expect(screen.getByText(/Rolls \(ಉರುಳುತ್ತದೆ\)/)).toBeDefined();
    });
  });

  describe("MultiPerspectiveCard", () => {
    it("renders Bottle with distinct multi-perspective badge and side/base observation", () => {
      const bottleItem = mockSortingItems.find((i) => i.id === "bottle")!;
      render(<MultiPerspectiveCard item={bottleItem} />);

      expect(screen.getByRole("heading", { name: "Water Bottle" })).toBeDefined();
      expect(screen.getByText("ನೀರಿನ ಬಾಟಲಿ")).toBeDefined();
      expect(screen.getByText(/Multi-Perspective/)).toBeDefined();
      expect(
        screen.getByText(/Long cylindrical body when viewed from the side/),
      ).toBeDefined();
      expect(screen.getByText(/ಪಕ್ಕದಿಂದ ನೋಡಿದಾಗ ಉದ್ದ ಸಿಲಿಂಡರ್/)).toBeDefined();
    });

    it("renders Bangle with circular rim rolling and edge-on line description", () => {
      const bangleItem = mockSortingItems.find((i) => i.id === "bangle")!;
      render(<MultiPerspectiveCard item={bangleItem} />);

      expect(screen.getByRole("heading", { name: "Bangle" })).toBeDefined();
      expect(screen.getByText("ಬಳೆ")).toBeDefined();
      expect(
        screen.getByText(/Circular ring that rolls along its rim/),
      ).toBeDefined();
      expect(screen.getByText(/ಅಂಚಿನ ಮೇಲೆ ಉರುಳುವ ದುಂಡಗಿನ ಬಳೆ/)).toBeDefined();
    });

    it("renders Pencil Box with elongated cuboid sliding description", () => {
      const boxItem = mockSortingItems.find((i) => i.id === "pencil_box")!;
      render(<MultiPerspectiveCard item={boxItem} />);

      expect(screen.getByRole("heading", { name: "Pencil Box" })).toBeDefined();
      expect(screen.getByText("ಪೆನ್ಸಿಲ್ ಬಾಕ್ಸ್")).toBeDefined();
      expect(
        screen.getByText(/Elongated cuboid with flat faces/),
      ).toBeDefined();
      expect(screen.getByText(/ಚಪ್ಪಟೆ ಮುಖಗಳನ್ನು ಹೊಂದಿರುವ/)).toBeDefined();
    });
  });

  describe("CurriculumProvenanceCard", () => {
    it("renders Karnataka State Board verified credentials and non-endorsement notice", () => {
      render(<CurriculumProvenanceCard provenance={mockProvenance} />);

      expect(
        screen.getByTestId("curriculum-provenance-card"),
      ).toBeDefined();
      expect(screen.getByTestId("provenance-verified-badge")).toBeDefined();
      expect(screen.getByTestId("provenance-verified-badge").textContent).toContain("Curriculum-aligned resource");
      expect(screen.getByRole("heading", { name: /Karnataka State Board/ })).toBeDefined();
      expect(screen.getByText(/Joyful Mathematics/)).toBeDefined();
      expect(screen.getByText(/Chapter 2: What is Long\? What is Round\?/)).toBeDefined();
      expect(screen.getByText(/Printed Pages: 13–14/)).toBeDefined();
      expect(
        screen.getByTestId("provenance-disclaimer-notice").textContent,
      ).toContain("not officially published, endorsed, or approved by KTBS");
    });
  });

  describe("BilingualSortingBoard", () => {
    it("renders full sorting board with binary grid, inquiry card, and multi-perspective section", () => {
      render(<BilingualSortingBoard visualExplanation={mockVisualDiagram} />);

      expect(screen.getByTestId("bilingual-sorting-board")).toBeDefined();
      expect(
        screen.getByRole("heading", { name: /Visual Sorting Board: What is Long\? What is Round\?/ }),
      ).toBeDefined();
      expect(
        screen.getByText("ದೃಶ್ಯ ವಿಂಗಡಣೆ ಬೋರ್ಡ್: ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?"),
      ).toBeDefined();

      // Binary Grid
      const grid = screen.getByTestId("binary-sorting-grid");
      expect(grid).toBeDefined();

      // Long Column
      const longCol = screen.getByTestId("long-objects-column");
      expect(longCol).toBeDefined();
      expect(screen.getByTestId("long-item-bat")).toBeDefined();
      expect(screen.getByTestId("long-item-pencil")).toBeDefined();
      expect(screen.getByTestId("long-item-ruler")).toBeDefined();

      // Round Column
      const roundCol = screen.getByTestId("round-objects-column");
      expect(roundCol).toBeDefined();
      expect(screen.getByTestId("round-item-ball")).toBeDefined();
      expect(screen.getByTestId("round-item-orange")).toBeDefined();

      // Discovery Card
      expect(screen.getByTestId("discovery-inquiry-card")).toBeDefined();
      expect(
        screen.getByText(/Can an object both roll and slide\?/),
      ).toBeDefined();

      // Distinct Multi-Perspective Section
      const multiSec = screen.getByTestId("multi-perspective-section");
      expect(multiSec).toBeDefined();
      expect(screen.getByTestId("multi-item-bottle")).toBeDefined();
      expect(screen.getByTestId("multi-item-bangle")).toBeDefined();
      expect(screen.getByTestId("multi-item-pencil_box")).toBeDefined();
    });
  });
});
