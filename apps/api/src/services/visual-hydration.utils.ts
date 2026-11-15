import {
  CANONICAL_OBJECTS_CATALOG,
  CANONICAL_OBJECT_IDS,
} from "../registry/canonical-objects";
import type {
  AIGeneratedVisualLesson,
  PersistedSortingDiagram,
  LessonProvenance,
} from "@teacher-ai/contracts";

export function hydrateVisualLesson(
  aiOutput: AIGeneratedVisualLesson,
  provenance: LessonProvenance,
): PersistedSortingDiagram {
  const itemMap = new Map(aiOutput.sortingActivity.items.map((i) => [i.id, i]));

  // Hydrate canonical objects strictly in fixed catalog order
  const hydratedItems = CANONICAL_OBJECT_IDS.map((id) => {
    const canonical = CANONICAL_OBJECTS_CATALOG[id];
    const aiItem = itemMap.get(id);

    return {
      id: canonical.id,
      nameEnglish: canonical.nameEnglish,     // Server-owned immutable name
      nameKannada: canonical.nameKannada,     // Server-owned immutable script name
      shapeCategory: canonical.shapeCategory, // Server-owned immutable category
      rolls: canonical.rolls,                 // Server-owned immutable characteristic
      slides: canonical.slides,               // Server-owned immutable characteristic
      perspectiveNote: canonical.multiPerspectiveGuidance.teacherTalkingPoint,
      contextualObservation: aiItem?.contextualObservation,
      kannadaObservation: aiItem?.kannadaObservation,
    };
  });

  return {
    format: "SORTING_DIAGRAM",
    concept: aiOutput.concept,
    shortExplanation: aiOutput.shortExplanation,
    kannadaExplanation: aiOutput.kannadaExplanation,
    teacherGuidance: aiOutput.teacherGuidance,
    sortingActivity: {
      title: aiOutput.sortingActivity.title,
      instructions: aiOutput.sortingActivity.instructions,
      kannadaInstructions: aiOutput.sortingActivity.kannadaInstructions,
      items: hydratedItems,
    },
    provenance,
  };
}
