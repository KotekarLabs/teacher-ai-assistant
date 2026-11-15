import {
  LessonContentSchema,
  type LessonContent,
  type PartialLessonContent,
  type PersistedSortingDiagram,
  type PersistedSortingObject,
} from "@teacher-ai/contracts";
import type { ServiceError } from "./lesson.service";

export function mergeLessonContent(
  existing: LessonContent,
  incoming: PartialLessonContent,
): LessonContent {
  // 1. Core required fields: Use incoming if supplied; else retain existing
  const title = incoming.title ?? existing.title;
  const overview = incoming.overview ?? existing.overview;
  const learningObjectives = incoming.learningObjectives ?? existing.learningObjectives;
  const prerequisites = incoming.prerequisites ?? existing.prerequisites;
  const introduction = incoming.introduction ?? existing.introduction;
  const teacherExplanation = incoming.teacherExplanation ?? existing.teacherExplanation;
  const examples = incoming.examples ?? existing.examples;
  const practice = incoming.practice ?? existing.practice;
  const quickAssessment = incoming.quickAssessment ?? existing.quickAssessment;
  const homework = incoming.homework ?? existing.homework;
  const teacherScript = incoming.teacherScript ?? existing.teacherScript;

  // 2. Nested classroom activity (No hardcoded strings)
  const classroomActivity = incoming.classroomActivity
    ? {
        title: incoming.classroomActivity.title ?? existing.classroomActivity.title,
        instructions: incoming.classroomActivity.instructions ?? existing.classroomActivity.instructions,
        durationMinutes: incoming.classroomActivity.durationMinutes ?? existing.classroomActivity.durationMinutes,
      }
    : existing.classroomActivity;

  // 3. Clearable optional fields (explicit null sets to undefined)
  const materials = incoming.materials === null
    ? undefined
    : (incoming.materials ?? existing.materials);

  const differentiation = incoming.differentiation === null
    ? undefined
    : incoming.differentiation !== undefined
    ? {
        support: incoming.differentiation.support ?? existing.differentiation?.support ?? "",
        extension: incoming.differentiation.extension ?? existing.differentiation?.extension ?? "",
      }
    : existing.differentiation;

  const pacingBreakdown = incoming.pacingBreakdown === null
    ? undefined
    : incoming.pacingBreakdown !== undefined
    ? {
        introductionMinutes: incoming.pacingBreakdown.introductionMinutes ?? existing.pacingBreakdown?.introductionMinutes ?? 5,
        directInstructionMinutes: incoming.pacingBreakdown.directInstructionMinutes ?? existing.pacingBreakdown?.directInstructionMinutes ?? 10,
        activityMinutes: incoming.pacingBreakdown.activityMinutes ?? existing.pacingBreakdown?.activityMinutes ?? 15,
        practiceMinutes: incoming.pacingBreakdown.practiceMinutes ?? existing.pacingBreakdown?.practiceMinutes ?? 5,
        assessmentMinutes: incoming.pacingBreakdown.assessmentMinutes ?? existing.pacingBreakdown?.assessmentMinutes ?? 5,
      }
    : existing.pacingBreakdown;

  // 4. Nested visual explanation: strictly merges supplied fields onto existing fields
  let visualExplanation: PersistedSortingDiagram | undefined = existing.visualExplanation;

  if (incoming.visualExplanation === null) {
    // Explicit null clears the visual explanation
    visualExplanation = undefined;
  } else if (incoming.visualExplanation !== undefined) {
    const existingVisual = existing.visualExplanation;
    const incomingVisual = incoming.visualExplanation;

    let sortingActivity = existingVisual?.sortingActivity;
    if (incomingVisual.sortingActivity !== undefined) {
      if (incomingVisual.sortingActivity === null) {
        sortingActivity = undefined;
      } else {
        const existingSorting = existingVisual?.sortingActivity;
        const incomingSorting = incomingVisual.sortingActivity;

        let mergedItems = existingSorting?.items;
        if (incomingSorting.items !== undefined) {
          // If items are supplied, merge items by ID or replace
          const existingItemMap = new Map((existingSorting?.items || []).map((i) => [i.id, i]));
          mergedItems = incomingSorting.items.map((incItem) => {
            const exItem = existingItemMap.get(incItem.id);
            return {
              id: incItem.id,
              nameEnglish: exItem?.nameEnglish ?? incItem.nameEnglish!,
              nameKannada: exItem?.nameKannada ?? incItem.nameKannada!,
              shapeCategory: exItem?.shapeCategory ?? incItem.shapeCategory!,
              rolls: exItem?.rolls ?? incItem.rolls!,
              slides: exItem?.slides ?? incItem.slides!,
              perspectiveNote: incItem.perspectiveNote ?? exItem?.perspectiveNote,
              contextualObservation: incItem.contextualObservation ?? exItem?.contextualObservation,
              kannadaObservation: incItem.kannadaObservation ?? exItem?.kannadaObservation,
            } as PersistedSortingObject;
          });
        }

        if (existingSorting || incomingSorting.title || incomingSorting.instructions) {
          sortingActivity = {
            title: incomingSorting.title ?? existingSorting?.title!,
            instructions: incomingSorting.instructions ?? existingSorting?.instructions!,
            kannadaInstructions: incomingSorting.kannadaInstructions ?? existingSorting?.kannadaInstructions ?? "",
            items: mergedItems!,
          };
        }
      }
    }

    if (existingVisual || incomingVisual.concept || incomingVisual.shortExplanation) {
      visualExplanation = {
        format: "SORTING_DIAGRAM",
        concept: incomingVisual.concept ?? existingVisual?.concept!,
        shortExplanation: incomingVisual.shortExplanation ?? existingVisual?.shortExplanation!,
        kannadaExplanation: incomingVisual.kannadaExplanation ?? existingVisual?.kannadaExplanation,
        teacherGuidance: incomingVisual.teacherGuidance ?? existingVisual?.teacherGuidance!,
        sortingActivity: sortingActivity!,
        // PROVENANCE IMMUTABILITY: Retain server-owned DB provenance
        provenance: existingVisual?.provenance!,
      };
    }
  }

  // 5. Construct candidate merged structure
  const rawCandidate = {
    title,
    overview,
    learningObjectives,
    prerequisites,
    introduction,
    teacherExplanation,
    examples,
    classroomActivity,
    practice,
    quickAssessment,
    homework,
    teacherScript,
    materials,
    differentiation,
    pacingBreakdown,
    visualExplanation,
    duplicationMetadata: existing.duplicationMetadata,
  };

  // 6. Pre-persistence validation against complete schema (NO TS CASTS)
  const validation = LessonContentSchema.safeParse(rawCandidate);
  if (!validation.success) {
    const error: ServiceError = new Error(
      `Merged lesson content failed complete schema validation: ${validation.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
    error.statusCode = 422;
    throw error;
  }

  return validation.data;
}
