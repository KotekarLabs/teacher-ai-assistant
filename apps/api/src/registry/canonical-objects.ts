import { deepFreeze } from "../utils/deep-freeze";
import type { CanonicalObjectId } from "@teacher-ai/contracts";

export { CANONICAL_OBJECT_IDS, type CanonicalObjectId } from "@teacher-ai/contracts";

export interface CanonicalObjectDefinition {
  id: CanonicalObjectId;
  nameEnglish: string;
  nameKannada: string;
  shapeCategory: "LONG" | "ROUND" | "MULTI_PERSPECTIVE";
  rolls: boolean;
  slides: boolean;
  multiPerspectiveGuidance: {
    isMultiPerspective: boolean;
    primaryObservation: string;
    secondaryObservation?: string;
    teacherTalkingPoint: string;
  };
}

export const CANONICAL_OBJECTS_CATALOG: Record<CanonicalObjectId, Readonly<CanonicalObjectDefinition>> = deepFreeze({
  bat: {
    id: "bat",
    nameEnglish: "Cricket Bat",
    nameKannada: "ಬ್ಯಾಟ್ (ಬ್ಯಾಟು)",
    shapeCategory: "LONG",
    rolls: false,
    slides: true,
    multiPerspectiveGuidance: {
      isMultiPerspective: false,
      primaryObservation: "Elongated wooden object that slides on its flat face.",
      teacherTalkingPoint: "Point out the long wooden handle and flat blade.",
    },
  },
  ball: {
    id: "ball",
    nameEnglish: "Ball",
    nameKannada: "ಚೆಂಡು",
    shapeCategory: "ROUND",
    rolls: true,
    slides: false,
    multiPerspectiveGuidance: {
      isMultiPerspective: false,
      primaryObservation: "Symmetrical sphere that rolls smoothly in all directions.",
      teacherTalkingPoint: "Roll the ball across the floor to demonstrate smooth rolling.",
    },
  },
  pencil: {
    id: "pencil",
    nameEnglish: "Pencil",
    nameKannada: "ಪೆನ್ಸಿಲ್",
    shapeCategory: "LONG",
    rolls: true,
    slides: true,
    multiPerspectiveGuidance: {
      isMultiPerspective: false,
      primaryObservation: "Long cylindrical shape; rolls on its side, slides on its flat ends.",
      teacherTalkingPoint: "Show children that a long object can also roll when pushed on its curved side.",
    },
  },
  orange: {
    id: "orange",
    nameEnglish: "Orange",
    nameKannada: "ಕಿತ್ತಳೆ ಹಣ್ಣು",
    shapeCategory: "ROUND",
    rolls: true,
    slides: false,
    multiPerspectiveGuidance: {
      isMultiPerspective: false,
      primaryObservation: "Natural spherical fruit that rolls.",
      teacherTalkingPoint: "Compare the orange with the ball as everyday round things.",
    },
  },
  ruler: {
    id: "ruler",
    nameEnglish: "Ruler / Scale",
    nameKannada: "ಅಳತೆಗೋಲು (ಸ್ಕೇಲ್)",
    shapeCategory: "LONG",
    rolls: false,
    slides: true,
    multiPerspectiveGuidance: {
      isMultiPerspective: false,
      primaryObservation: "Flat, straight elongated strip that slides and cannot roll.",
      teacherTalkingPoint: "Contrasts with the pencil: both are long, but the flat ruler only slides.",
    },
  },
  bangle: {
    id: "bangle",
    nameEnglish: "Bangle",
    nameKannada: "ಬಳೆ",
    shapeCategory: "ROUND", // Resolved classification: Round
    rolls: true,
    slides: false,
    multiPerspectiveGuidance: {
      isMultiPerspective: true,
      primaryObservation: "Circular ring that rolls along its outer rim.",
      secondaryObservation: "When viewed directly on edge, it appears as a thin straight line.",
      teacherTalkingPoint:
        "Children classify a bangle as round because of its circular ring and because it rolls. Validate this, while showing that turned edge-on it looks like a thin stick.",
    },
  },
  bottle: {
    id: "bottle",
    nameEnglish: "Water Bottle",
    nameKannada: "ಬಾಟಲ್",
    shapeCategory: "MULTI_PERSPECTIVE",
    rolls: true,
    slides: true,
    multiPerspectiveGuidance: {
      isMultiPerspective: true,
      primaryObservation: "Viewed from the side, it is a tall cylinder (long).",
      secondaryObservation: "Viewed from the top or bottom, the lid and base are circles (round).",
      teacherTalkingPoint:
        "Ask children: 'Is a bottle long or round?' Show them that viewing it from the side looks long, but looking into the opening looks round.",
    },
  },
  pencil_box: {
    id: "pencil_box",
    nameEnglish: "Pencil Box",
    nameKannada: "ಪೆನ್ಸಿಲ್ ಬಾಕ್ಸ್",
    shapeCategory: "MULTI_PERSPECTIVE",
    rolls: false,
    slides: true,
    multiPerspectiveGuidance: {
      isMultiPerspective: true,
      primaryObservation: "Elongated cuboid (long shape), but with completely flat rectangular faces.",
      secondaryObservation: "Because its faces are flat, it slides across the desk and cannot roll.",
      teacherTalkingPoint:
        "Contrasts 'long and rolls' (pencil/bottle) with 'long and slides' (pencil box/ruler). Helps children separate shape from movement.",
    },
  },
});
