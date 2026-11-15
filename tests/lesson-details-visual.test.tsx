// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LessonDetails } from "../apps/web/src/pages/LessonDetails";
import { LessonEditor } from "../apps/web/src/components/lessons/LessonEditor";
import type {
  LessonDTO,
  LessonContent,
  PersistedSortingObject,
  PersistedSortingDiagram,
  LessonProvenance,
} from "@teacher-ai/contracts";

// Mock Export API
vi.mock("../apps/web/src/api/export.api", () => ({
  downloadResourcePdf: vi.fn().mockResolvedValue(new Blob()),
}));

// Mock Lessons API
vi.mock("../apps/web/src/api/lessons.api", () => ({
  getLessonById: vi.fn(),
  archiveLesson: vi.fn(),
  updateLesson: vi.fn(),
}));

const mockProvenance: LessonProvenance = {
  verificationStatus: "VERIFIED",
  curriculumBoard: "Karnataka State Board",
  textbook: "Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual",
  edition: "Revised 2026–27 Edition",
  chapter: "Chapter 2: What is Long? What is Round? (ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?)",
  printedPages: "13–14",
  sourceEvidence: "Inspection of uploaded digital textbook PDF, Chapter 2, printed pages 13–14.",
  verifiedAt: "2026-11-10T10:00:00.000Z",
};

// Exactly 8 canonical objects matching authoritative catalog:
// 3 LONG, 3 ROUND, 2 MULTI_PERSPECTIVE
const mockCanonicalItems: PersistedSortingObject[] = [
  {
    id: "bat",
    nameEnglish: "Cricket Bat",
    nameKannada: "ಬ್ಯಾಟ್ (ಬ್ಯಾಟು)",
    shapeCategory: "LONG",
    rolls: false,
    slides: true,
    contextualObservation: "Long wooden cricket bat. Slides on flat face.",
    kannadaObservation: "ಉದ್ದವಾದ ಮರದ ಬ್ಯಾಟ್. ಚಪ್ಪಟೆ ಮುಖದ ಮೇಲೆ ಜಾರುತ್ತದೆ.",
  },
  {
    id: "ball",
    nameEnglish: "Ball",
    nameKannada: "ಚೆಂಡು",
    shapeCategory: "ROUND",
    rolls: true,
    slides: false,
    contextualObservation: "Round bouncy ball. Rolls smoothly in any direction.",
    kannadaObservation: "ದುಂಡಗಿನ ಚೆಂಡು. ಎಲ್ಲ ದಿಕ್ಕುಗಳಲ್ಲೂ ಸುಲಭವಾಗಿ ಉರುಳುತ್ತದೆ.",
  },
  {
    id: "pencil",
    nameEnglish: "Pencil",
    nameKannada: "ಪೆನ್ಸಿಲ್",
    shapeCategory: "LONG",
    rolls: true,
    slides: true,
    contextualObservation: "Long cylindrical pencil; rolls on side, slides upright.",
    kannadaObservation: "ಉದ್ದವಾದ ಪೆನ್ಸಿಲ್; ಪಕ್ಕಕ್ಕೆ ಉರುಳುತ್ತದೆ, ನೇರವಾಗಿ ಜಾರುತ್ತದೆ.",
  },
  {
    id: "orange",
    nameEnglish: "Orange",
    nameKannada: "ಕಿತ್ತಳೆ ಹಣ್ಣು",
    shapeCategory: "ROUND",
    rolls: true,
    slides: false,
    contextualObservation: "Round fresh fruit. Rolls on the floor.",
    kannadaObservation: "ದುಂಡಗಿನ ಹಣ್ಣು. ನೆಲದ ಮೇಲೆ ಉರುಳುತ್ತದೆ.",
  },
  {
    id: "ruler",
    nameEnglish: "Ruler / Scale",
    nameKannada: "ಅಳತೆಗೋಲು (ಸ್ಕೇಲ್)",
    shapeCategory: "LONG",
    rolls: false,
    slides: true,
    contextualObservation: "Straight flat plastic scale. Slides smoothly across desk.",
    kannadaObservation: "ಉದ್ದವಾದ ನೇರ ಅಳತೆಪಟ್ಟಿ. ಬೆಂಚಿನ ಮೇಲೆ ಜಾರುತ್ತದೆ.",
  },
  {
    id: "bangle",
    nameEnglish: "Bangle",
    nameKannada: "ಬಳೆ",
    shapeCategory: "ROUND",
    rolls: true,
    slides: false,
    contextualObservation: "Circular ring that rolls along its outer rim.",
    kannadaObservation: "ದುಂಡಗಿನ ಬಳೆ. ಹೊರ ಅಂಚಿನ ಮೇಲೆ ಉರುಳುತ್ತದೆ.",
  },
  {
    id: "bottle",
    nameEnglish: "Water Bottle",
    nameKannada: "ಬಾಟಲ್",
    shapeCategory: "MULTI_PERSPECTIVE",
    rolls: true,
    slides: true,
    perspectiveNote: "Viewed from side: long cylinder. Viewed from top: round circle.",
    contextualObservation: "Side is tall/long; top and base are round circles.",
    kannadaObservation: "ಪಕ್ಕದಿಂದ ನೋಡಿದರೆ ಉದ್ದ, ಮೇಲಿನಿಂದ ನೋಡಿದರೆ ದುಂಡು.",
  },
  {
    id: "pencil_box",
    nameEnglish: "Pencil Box",
    nameKannada: "ಪೆನ್ಸಿಲ್ ಬಾಕ್ಸ್",
    shapeCategory: "MULTI_PERSPECTIVE",
    rolls: false,
    slides: true,
    perspectiveNote: "Long cuboid with flat faces; slides on table and does not roll.",
    contextualObservation: "Elongated cuboid box; slides on desk.",
    kannadaObservation: "ಉದ್ದವಾದ ಪೆನ್ಸಿಲ್ ಡಬ್ಬಿ; ಬೆಂಚಿನ ಮೇಲೆ ಜಾರುತ್ತದೆ.",
  },
];

const mockVisualExplanation: PersistedSortingDiagram = {
  format: "SORTING_DIAGRAM",
  concept: "What is Long? What is Round? (ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?)",
  shortExplanation: "Classifying everyday items into long and round, and observing their physical rolling and sliding behavior.",
  kannadaExplanation: "ವಸ್ತುಗಳನ್ನು ಉದ್ದ ಮತ್ತು ದುಂಡು ಎಂದು ವಿಂಗಡಿಸುವುದು ಮತ್ತು ಅವುಗಳ ಉರುಳುವ ಮತ್ತು ಜಾರುವ ಗುಣಗಳನ್ನು ಗಮನಿಸುವುದು.",
  teacherGuidance: "Encourage children to hold each physical object and test whether it rolls or slides before sorting.",
  sortingActivity: {
    title: "Visual Sorting Board: What is Long? What is Round?",
    instructions: "Place each object into Long (slides) or Round (rolls). Observe multi-perspective objects closely.",
    kannadaInstructions: "ಪ್ರತಿಯೊಂದು ವಸ್ತುವನ್ನು ಉದ್ದ (ಜಾರುತ್ತದೆ) ಅಥವಾ ದುಂಡು (ಉರುಳುತ್ತದೆ) ಎಂದು ವಿಂಗಡಿಸಿ.",
    items: mockCanonicalItems,
  },
  provenance: mockProvenance,
};

const mockVisualLessonContent: LessonContent = {
  title: "Class 1 Math: What is Long? What is Round?",
  overview: "Exploring shapes and rolling vs sliding using familiar everyday objects from the Karnataka State Board syllabus.",
  learningObjectives: [
    "Identify long objects and round objects in everyday surroundings",
    "Distinguish rolling from sliding movements through hands-on testing",
    "Understand that orientation changes perception of cylindrical and ring objects",
  ],
  prerequisites: ["Familiarity with common classroom items and toys"],
  introduction: "Look around our classroom! Which objects can roll across your desk and which ones slide?",
  teacherExplanation: "Long objects with flat faces slide along flat surfaces. Round objects roll smoothly in every direction. Cylindrical and ring shapes can exhibit both behaviors depending on how they are placed.",
  examples: [
    "Rolling a red ball across the mat",
    "Pushing a wooden ruler flat along a table",
  ],
  classroomActivity: {
    title: "Sorting Board Hands-on Activity",
    instructions: "Students test each object on the desk and place it in the correct category on the board.",
    durationMinutes: 15,
  },
  practice: [
    "Roll a pencil on its curved side, then try sliding it flat",
    "Compare sliding a pencil box vs rolling a water bottle",
  ],
  quickAssessment: [
    "Does an orange roll or slide when pushed?",
    "Can a water bottle both roll and slide? Explain why.",
  ],
  homework: "Find 2 long objects and 2 round objects at home. Test if they roll or slide with your family.",
  teacherScript: "Good morning class! Today we have an exciting sorting game with 8 everyday items...",
  materials: ["Cricket bat", "Tennis ball", "Pencil", "Orange", "Ruler", "Bangle", "Water bottle", "Pencil box"],
  differentiation: {
    support: "Use tactile hands-on objects and demonstrate rolling vs sliding down a gentle cardboard ramp.",
    extension: "Challenge students to find additional classroom objects that fit into the multi-perspective category.",
  },
  pacingBreakdown: {
    introductionMinutes: 5,
    directInstructionMinutes: 10,
    activityMinutes: 15,
    practiceMinutes: 5,
    assessmentMinutes: 5,
  },
  visualExplanation: mockVisualExplanation,
};

const mockVisualLessonDTO: LessonDTO = {
  id: "lesson-visual-1",
  teacherId: "teacher-123",
  classId: "class-ktbs-1",
  title: "Class 1 Math: What is Long? What is Round?",
  subject: "Mathematics",
  topic: "What is Long? What is Round?",
  durationMinutes: 40,
  difficulty: "EASY",
  curriculumBoard: "Karnataka State Board",
  status: "SAVED",
  content: mockVisualLessonContent,
  createdAt: "2026-11-10T10:00:00.000Z",
  updatedAt: "2026-11-10T10:00:00.000Z",
  archivedAt: null,
};

const mockOrdinaryLessonContent: LessonContent = {
  title: "Photosynthesis and Plant Growth",
  overview: "Understanding how green plants convert sunlight and carbon dioxide into chemical energy.",
  learningObjectives: [
    "Define the basic equation for photosynthesis",
    "Identify chlorophyll as the light-absorbing pigment",
  ],
  prerequisites: ["Basic knowledge of plant parts: roots, stems, leaves"],
  introduction: "Why do plants need sunlight to survive? What happens to plants kept in the dark?",
  teacherExplanation: "Photosynthesis takes place in chloroplasts where chlorophyll captures solar energy to synthesize glucose from carbon dioxide and water.",
  examples: [
    "Leaves turning yellow when deprived of sunlight",
    "Oxygen bubbles produced by submerged aquatic plants",
  ],
  classroomActivity: {
    title: "Elodea Oxygen Bubble Counting",
    instructions: "Place Elodea sprigs under light at varying distances and tally bubble release rates.",
    durationMinutes: 20,
  },
  practice: ["Label the inputs and outputs of photosynthesis on the plant diagram"],
  quickAssessment: ["What gas is released during photosynthesis?"],
  homework: "Observe indoor plants and describe leaf orientation toward windows.",
  teacherScript: "Welcome students! Today we explore nature's solar power plants...",
  // Note: visualExplanation is undefined (ordinary lesson)
};

const mockOrdinaryLessonDTO: LessonDTO = {
  id: "lesson-ordinary-1",
  teacherId: "teacher-123",
  classId: "class-cbse-1",
  title: "Photosynthesis and Plant Growth",
  subject: "Science",
  topic: "Photosynthesis",
  durationMinutes: 45,
  difficulty: "MEDIUM",
  curriculumBoard: "CBSE",
  status: "SAVED",
  content: mockOrdinaryLessonContent,
  createdAt: "2026-11-10T10:00:00.000Z",
  updatedAt: "2026-11-10T10:00:00.000Z",
  archivedAt: null,
};

describe("Stage 3C Batch 2: Visual Lesson Viewing and Editing Acceptance Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderLessonDetails = (lessonDTO: LessonDTO) => {
    return render(
      <MemoryRouter initialEntries={[`/lessons/${lessonDTO.id}`]}>
        <Routes>
          <Route
            path="/lessons/:lessonId"
            element={<LessonDetails initialLesson={lessonDTO} />}
          />
        </Routes>
      </MemoryRouter>,
    );
  };

  // Scenario 1: Visual lesson viewing
  it("Scenario 1: renders visual lesson details with badge, board, and standard sections intact", () => {
    renderLessonDetails(mockVisualLessonDTO);

    // Indicator badge
    const badge = screen.getByTestId("curriculum-visual-badge");
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain("Curriculum-Aligned Visual Lesson");
    expect(badge.textContent).toContain("Karnataka State Board • Class 1 Math");
    expect(badge.textContent).toContain("ದೃಶ್ಯ ಬೋಧನಾ ಸಹಾಯಕ");

    // Visual section & bilingual board
    expect(screen.getByTestId("visual-lesson-section")).toBeDefined();
    expect(screen.getByTestId("bilingual-sorting-board")).toBeDefined();

    // Standard sections intact
    expect(screen.getByTestId("lesson-details-title").textContent).toBe(
      "Class 1 Math: What is Long? What is Round?",
    );
    expect(screen.getByText("Lesson Overview")).toBeDefined();
    expect(screen.getByText("Learning Objectives")).toBeDefined();
    expect(screen.getByText("Warmup & Introduction (Hook)")).toBeDefined();
    expect(screen.getByText("Teacher Explanation & Core Concepts")).toBeDefined();
    expect(screen.getByText("Interactive Classroom Activity")).toBeDefined();
    expect(screen.getByText("Guided & Independent Practice")).toBeDefined();
    expect(screen.getByText("Homework Assignment")).toBeDefined();
  });

  // Scenario 2: Exact canonical object distribution and unique canonical IDs
  it("Scenario 2: verifies exact 8-object distribution (3 Long, 3 Round, 2 Multi-Perspective) and unique canonical IDs without unapproved items", () => {
    renderLessonDetails(mockVisualLessonDTO);

    const board = screen.getByTestId("bilingual-sorting-board");

    // 1. Long objects (exactly 3 items)
    const longCol = screen.getByTestId("long-objects-column");
    expect(longCol).toBeDefined();
    const longArticles = longCol.querySelectorAll("article");
    expect(longArticles.length).toBe(3);
    expect(screen.getByTestId("long-item-bat")).toBeDefined();
    expect(screen.getByTestId("long-item-pencil")).toBeDefined();
    expect(screen.getByTestId("long-item-ruler")).toBeDefined();

    // 2. Round objects (exactly 3 items + discovery card)
    const roundCol = screen.getByTestId("round-objects-column");
    expect(roundCol).toBeDefined();
    const roundArticles = roundCol.querySelectorAll("article");
    expect(roundArticles.length).toBe(3);
    expect(screen.getByTestId("round-item-ball")).toBeDefined();
    expect(screen.getByTestId("round-item-orange")).toBeDefined();
    expect(screen.getByTestId("round-item-bangle")).toBeDefined();
    expect(screen.getByTestId("discovery-inquiry-card")).toBeDefined();

    // 3. Multi-perspective objects (exactly 2 items)
    const multiSec = screen.getByTestId("multi-perspective-section");
    expect(multiSec).toBeDefined();
    const multiArticles = multiSec.querySelectorAll("article");
    expect(multiArticles.length).toBe(2);
    expect(screen.getByTestId("multi-item-bottle")).toBeDefined();
    expect(screen.getByTestId("multi-item-pencil_box")).toBeDefined();

    // Total objects across entire board: exactly 8 sorting objects
    const allSortingArticles = board.querySelectorAll("article");
    expect(allSortingArticles.length).toBe(8);

    // Verify all canonical IDs are unique and match the 8 authoritative objects
    const renderedCardTestIds = [
      "long-item-bat",
      "long-item-pencil",
      "long-item-ruler",
      "round-item-ball",
      "round-item-orange",
      "round-item-bangle",
      "multi-item-bottle",
      "multi-item-pencil_box",
    ];
    const canonicalIds = renderedCardTestIds.map((testId) => {
      const el = screen.getByTestId(testId);
      expect(el).toBeDefined();
      return testId.replace(/^(long-item-|round-item-|multi-item-)/, "");
    });
    expect(canonicalIds.length).toBe(8);
    const uniqueIds = new Set(canonicalIds);
    expect(uniqueIds.size).toBe(8);
    const expectedCanonicalCatalog = [
      "bat",
      "pencil",
      "ruler",
      "ball",
      "orange",
      "bangle",
      "bottle",
      "pencil_box",
    ];
    expect(canonicalIds.sort()).toEqual([...expectedCanonicalCatalog].sort());

    // Verify unapproved replacement objects are strictly absent
    expect(screen.queryByTestId("sorting-card-coin")).toBeNull();
    expect(screen.queryByTestId("sorting-card-lemon")).toBeNull();
    expect(screen.queryByTestId("sorting-card-marker")).toBeNull();
    expect(screen.queryByText(/lemon/i)).toBeNull();
    expect(screen.queryByText(/marker/i)).toBeNull();
  });

  // Scenario 3: English and Kannada labels
  it("Scenario 3: verifies bilingual English and Kannada labels for all 8 canonical objects and activity headers", () => {
    renderLessonDetails(mockVisualLessonDTO);

    // All 8 canonical objects bilingual names scoped to sorting board
    const board = screen.getByTestId("bilingual-sorting-board");
    expect(within(board).getAllByText("Cricket Bat").length).toBeGreaterThanOrEqual(1);
    expect(within(board).getAllByText("ಬ್ಯಾಟ್ (ಬ್ಯಾಟು)").length).toBeGreaterThanOrEqual(1);

    expect(within(board).getAllByText("Ball").length).toBeGreaterThanOrEqual(1);
    expect(within(board).getAllByText("ಚೆಂಡು").length).toBeGreaterThanOrEqual(1);

    expect(within(board).getAllByText("Pencil").length).toBeGreaterThanOrEqual(1);
    expect(within(board).getAllByText("ಪೆನ್ಸಿಲ್").length).toBeGreaterThanOrEqual(1);

    expect(within(board).getAllByText("Orange").length).toBeGreaterThanOrEqual(1);
    expect(within(board).getAllByText("ಕಿತ್ತಳೆ ಹಣ್ಣು").length).toBeGreaterThanOrEqual(1);

    expect(within(board).getAllByText("Ruler / Scale").length).toBeGreaterThanOrEqual(1);
    expect(within(board).getAllByText("ಅಳತೆಗೋಲು (ಸ್ಕೇಲ್)").length).toBeGreaterThanOrEqual(1);

    expect(within(board).getAllByText("Bangle").length).toBeGreaterThanOrEqual(1);
    expect(within(board).getAllByText("ಬಳೆ").length).toBeGreaterThanOrEqual(1);

    expect(within(board).getAllByText("Water Bottle").length).toBeGreaterThanOrEqual(1);
    expect(within(board).getAllByText("ಬಾಟಲ್").length).toBeGreaterThanOrEqual(1);

    expect(within(board).getAllByText("Pencil Box").length).toBeGreaterThanOrEqual(1);
    expect(within(board).getAllByText("ಪೆನ್ಸಿಲ್ ಬಾಕ್ಸ್").length).toBeGreaterThanOrEqual(1);

    // Board headers & instructions in Kannada
    expect(
      screen.getByText("ದೃಶ್ಯ ವಿಂಗಡಣೆ ಬೋರ್ಡ್: ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?"),
    ).toBeDefined();
    expect(
      screen.getByText("ಪ್ರತಿಯೊಂದು ವಸ್ತುವನ್ನು ಉದ್ದ (ಜಾರುತ್ತದೆ) ಅಥವಾ ದುಂಡು (ಉರುಳುತ್ತದೆ) ಎಂದು ವಿಂಗಡಿಸಿ."),
    ).toBeDefined();
  });

  // Scenario 4: Curriculum provenance and disclaimer
  it("Scenario 4: renders curriculum provenance card with textbook citation, verified badge, and exact legal disclaimer", () => {
    renderLessonDetails(mockVisualLessonDTO);

    const card = screen.getByTestId("curriculum-provenance-card");
    expect(card).toBeDefined();

    expect(screen.getByTestId("provenance-verified-badge").textContent).toContain(
      "Curriculum-aligned resource",
    );
    expect(card.textContent).toContain("Karnataka State Board — Class 1 Mathematics");
    expect(card.textContent).toContain("Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual");
    expect(card.textContent).toContain("Chapter 2: What is Long? What is Round? (ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?)");
    expect(card.textContent).toContain("Printed Pages: 13–14");

    // Exact official legal disclaimer
    const disclaimerNotice = screen.getByTestId("provenance-disclaimer-notice");
    expect(disclaimerNotice.textContent).toContain(
      "Independent teacher-support resource aligned to the Karnataka State Board syllabus; not officially published, endorsed, or approved by KTBS, DSERT, or the Government of Karnataka.",
    );
  });

  // Scenario 5: Ordinary lesson details regression
  it("Scenario 5: preserves ordinary lesson viewing without visual badges, board, or provenance", () => {
    renderLessonDetails(mockOrdinaryLessonDTO);

    // Visual indicators strictly absent
    expect(screen.queryByTestId("curriculum-visual-badge")).toBeNull();
    expect(screen.queryByTestId("visual-lesson-section")).toBeNull();
    expect(screen.queryByTestId("bilingual-sorting-board")).toBeNull();
    expect(screen.queryByTestId("curriculum-provenance-card")).toBeNull();

    // Ordinary content intact
    expect(screen.getByTestId("lesson-details-title").textContent).toBe(
      "Photosynthesis and Plant Growth",
    );
    expect(screen.getByText("Photosynthesis takes place in chloroplasts where chlorophyll captures solar energy to synthesize glucose from carbon dioxide and water.")).toBeDefined();
    expect(screen.getByText("Elodea Oxygen Bubble Counting")).toBeDefined();
  });

  // Scenario 6: Visual editor and canonical locking
  it("Scenario 6: renders visual editor with canonical attributes locked and provenance protected", () => {
    const onChange = vi.fn();
    render(
      <LessonEditor content={mockVisualLessonContent} onChange={onChange} />,
    );

    expect(screen.getByTestId("editor-visual-section")).toBeDefined();
    const notice = screen.getByTestId("editor-visual-security-notice");
    expect(notice).toBeDefined();
    expect(notice.textContent).toContain(
      "Curriculum-Aligned Resource — Canonical Properties Protected",
    );

    // All 8 canonical items present with locked canonical properties
    for (const item of mockCanonicalItems) {
      const itemCard = screen.getByTestId(`editor-visual-item-${item.id}`);
      expect(itemCard).toBeDefined();
      expect(itemCard.textContent).toContain(item.nameEnglish);
      expect(itemCard.textContent).toContain(item.nameKannada);
      expect(itemCard.textContent).toContain("🔒 Canonical");
    }

    // No add/remove item buttons for canonical objects
    expect(screen.queryByTestId("editor-add-visual-item-btn")).toBeNull();
    expect(screen.queryByTestId("editor-remove-visual-item-bat")).toBeNull();

    // Provenance displayed in editor
    expect(screen.getByTestId("curriculum-provenance-card")).toBeDefined();
  });

  // Scenario 7: Editing permitted teacher fields (English and Kannada)
  it("Scenario 7: allows editing permitted teacher fields including Kannada instructions and observations while preserving canonical IDs and classifications", () => {
    const onChange = vi.fn();
    render(
      <LessonEditor content={mockVisualLessonContent} onChange={onChange} />,
    );

    // 1. Edit teacherGuidance
    const guidanceInput = screen.getByTestId("editor-visual-guidance");
    fireEvent.change(guidanceInput, {
      target: { value: "Updated teacher guidance for Class 1A hands-on session." },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    const call1Content: LessonContent = onChange.mock.calls[0][0];
    expect(call1Content.visualExplanation?.teacherGuidance).toBe(
      "Updated teacher guidance for Class 1A hands-on session.",
    );

    // 2. Edit instructions (English)
    const instructionsInput = screen.getByTestId("editor-visual-instructions");
    fireEvent.change(instructionsInput, {
      target: { value: "Updated student sorting instructions in English." },
    });
    expect(onChange).toHaveBeenCalledTimes(2);
    const call2Content: LessonContent = onChange.mock.calls[1][0];
    expect(call2Content.visualExplanation?.sortingActivity.instructions).toBe(
      "Updated student sorting instructions in English.",
    );

    // 3. Edit kannadaInstructions (Kannada)
    const kannadaInstructionsInput = screen.getByTestId(
      "editor-visual-kannada-instructions",
    );
    fireEvent.change(kannadaInstructionsInput, {
      target: {
        value: "ನವೀಕರಿಸಿದ ತರಗತಿ ಸೂಚನೆಗಳು: ವಸ್ತುಗಳನ್ನು ಉರುಳುವ ಮತ್ತು ಜಾರುವ ಆಧಾರದಲ್ಲಿ ವಿಂಗಡಿಸಿ.",
      },
    });
    expect(onChange).toHaveBeenCalledTimes(3);
    const call3Content: LessonContent = onChange.mock.calls[2][0];
    expect(
      call3Content.visualExplanation?.sortingActivity.kannadaInstructions,
    ).toBe(
      "ನವೀಕರಿಸಿದ ತರಗತಿ ಸೂಚನೆಗಳು: ವಸ್ತುಗಳನ್ನು ಉರುಳುವ ಮತ್ತು ಜಾರುವ ಆಧಾರದಲ್ಲಿ ವಿಂಗಡಿಸಿ.",
    );

    // 4. Edit contextualObservation for bat (English)
    const batObsInput = screen.getByTestId("editor-obs-en-bat");
    fireEvent.change(batObsInput, {
      target: { value: "Custom observation: Flat willow bat slides when pushed." },
    });
    expect(onChange).toHaveBeenCalledTimes(4);
    const call4Content: LessonContent = onChange.mock.calls[3][0];
    const batItem = call4Content.visualExplanation?.sortingActivity.items.find(
      (i) => i.id === "bat",
    );
    expect(batItem?.contextualObservation).toBe(
      "Custom observation: Flat willow bat slides when pushed.",
    );

    // 5. Edit kannadaObservation for ball (Kannada)
    const ballKannadaObsInput = screen.getByTestId("editor-obs-kn-ball");
    fireEvent.change(ballKannadaObsInput, {
      target: {
        value: "ಕಸ್ಟಮ್ ಕನ್ನಡ ವೀಕ್ಷಣೆ: ಕೆಂಪು ರಬ್ಬರ್ ಚೆಂಡು ನೆಲದ ಮೇಲೆ ಸುಲಭವಾಗಿ ಉರುಳುತ್ತದೆ.",
      },
    });
    expect(onChange).toHaveBeenCalledTimes(5);
    const call5Content: LessonContent = onChange.mock.calls[4][0];
    const ballItem = call5Content.visualExplanation?.sortingActivity.items.find(
      (i) => i.id === "ball",
    );
    expect(ballItem?.kannadaObservation).toBe(
      "ಕಸ್ಟಮ್ ಕನ್ನಡ ವೀಕ್ಷಣೆ: ಕೆಂಪು ರಬ್ಬರ್ ಚೆಂಡು ನೆಲದ ಮೇಲೆ ಸುಲಭವಾಗಿ ಉರುಳುತ್ತದೆ.",
    );

    // CRITICAL: Canonical properties remain strictly preserved across all edits
    expect(batItem?.id).toBe("bat");
    expect(batItem?.nameEnglish).toBe("Cricket Bat");
    expect(batItem?.nameKannada).toBe("ಬ್ಯಾಟ್ (ಬ್ಯಾಟು)");
    expect(batItem?.shapeCategory).toBe("LONG");
    expect(batItem?.rolls).toBe(false);
    expect(batItem?.slides).toBe(true);

    expect(ballItem?.id).toBe("ball");
    expect(ballItem?.nameEnglish).toBe("Ball");
    expect(ballItem?.nameKannada).toBe("ಚೆಂಡು");
    expect(ballItem?.shapeCategory).toBe("ROUND");
    expect(ballItem?.rolls).toBe(true);
    expect(ballItem?.slides).toBe(false);

    // Exactly 8 items preserved and all canonical IDs intact
    expect(call5Content.visualExplanation?.sortingActivity.items.length).toBe(8);
    const allEmittedIds = call5Content.visualExplanation?.sortingActivity.items.map(
      (i) => i.id,
    );
    expect(new Set(allEmittedIds).size).toBe(8);
    expect(allEmittedIds?.sort()).toEqual(
      ["bat", "pencil", "ruler", "ball", "orange", "bangle", "bottle", "pencil_box"].sort(),
    );
  });

  // Scenario 8: Ordinary lesson editor regression
  it("Scenario 8: preserves ordinary lesson editor experience without visual section", () => {
    const onChange = vi.fn();
    render(
      <LessonEditor content={mockOrdinaryLessonContent} onChange={onChange} />,
    );

    // Visual section strictly absent
    expect(screen.queryByTestId("editor-visual-section")).toBeNull();
    expect(screen.queryByTestId("editor-visual-guidance")).toBeNull();

    // Standard fields functional
    const titleInput = screen.getByTestId("editor-title-input") as HTMLInputElement;
    expect(titleInput.value).toBe("Photosynthesis and Plant Growth");

    fireEvent.change(titleInput, {
      target: { value: "Advanced Photosynthesis and Plant Growth" },
    });
    expect(onChange).toHaveBeenCalled();
    const updatedContent: LessonContent = onChange.mock.calls[0][0];
    expect(updatedContent.title).toBe("Advanced Photosynthesis and Plant Growth");
    expect(updatedContent.visualExplanation).toBeUndefined();
  });

  // Scenario 9: Save/reload cycle simulation
  it("Scenario 9: simulates save/reload cycle and verifies updated guidance is rendered in details view", () => {
    let activeContent = { ...mockVisualLessonContent };
    const StatefulEditor: React.FC = () => {
      const [content, setContent] = React.useState(mockVisualLessonContent);
      return (
        <LessonEditor
          content={content}
          onChange={(updated) => {
            setContent(updated);
            activeContent = updated;
          }}
        />
      );
    };

    // 1. Edit in LessonEditor with reactive state updates
    const { unmount: unmountEditor } = render(<StatefulEditor />);

    fireEvent.change(screen.getByTestId("editor-visual-guidance"), {
      target: { value: "Pedagogical guidance updated before lesson execution." },
    });
    fireEvent.change(screen.getByTestId("editor-obs-en-bottle"), {
      target: { value: "Bottle: Cylinder body rolls; base slides." },
    });

    unmountEditor();

    // 2. Re-render LessonDetails with updated content (simulating save + reload)
    const updatedLessonDTO: LessonDTO = {
      ...mockVisualLessonDTO,
      content: activeContent,
    };
    renderLessonDetails(updatedLessonDTO);

    // 3. Verify details view displays the updated guidance and observation
    expect(
      screen.getByText("Pedagogical guidance updated before lesson execution."),
    ).toBeDefined();
    expect(
      screen.getByText("Bottle: Cylinder body rolls; base slides."),
    ).toBeDefined();

    // 4. Verify canonical distribution remains 8 objects
    expect(screen.getByTestId("long-objects-column")).toBeDefined();
    expect(screen.getByTestId("round-objects-column")).toBeDefined();
    expect(screen.getByTestId("multi-perspective-section")).toBeDefined();
  });

  // Scenario 10: Error handling & resilience
  it("Scenario 10: gracefully handles API error on details page and empty optional fields in editor", () => {
    // 1. Details page handles 404/error state
    const { unmount: unmountDetails } = render(
      <MemoryRouter initialEntries={["/lessons/nonexistent-id"]}>
        <Routes>
          <Route
            path="/lessons/:lessonId"
            element={<LessonDetails error={new Error("Lesson not found")} />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(alert.textContent).toContain("Lesson Not Found");
    expect(screen.getByText("Return to Dashboard")).toBeDefined();

    unmountDetails();

    // 2. Editor handles minimal visual content with empty optional observations
    const minimalVisualContent: LessonContent = {
      ...mockVisualLessonContent,
      visualExplanation: {
        ...mockVisualExplanation,
        teacherGuidance: "Minimal guidance",
        sortingActivity: {
          ...mockVisualExplanation.sortingActivity,
          kannadaInstructions: "",
          items: mockCanonicalItems.map((item) => ({
            ...item,
            contextualObservation: undefined,
            kannadaObservation: undefined,
          })),
        },
      },
    };

    const onChange = vi.fn();
    render(
      <LessonEditor content={minimalVisualContent} onChange={onChange} />,
    );

    expect(screen.getByTestId("editor-visual-section")).toBeDefined();
    const guidance = screen.getByTestId("editor-visual-guidance") as HTMLTextAreaElement;
    expect(guidance.value).toBe("Minimal guidance");

    // Can still add observations to previously empty fields
    const batObs = screen.getByTestId("editor-obs-en-bat") as HTMLInputElement;
    expect(batObs.value).toBe("");
    fireEvent.change(batObs, {
      target: { value: "New bat observation on minimal lesson" },
    });
    expect(onChange).toHaveBeenCalled();
  });
});
