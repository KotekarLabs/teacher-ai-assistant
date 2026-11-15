import type { Request, Response } from "express";
import { CurriculumRegistry } from "../registry/curriculum-registry";
import type { CurriculumPresetSummary, CurriculumPresetsResponse } from "@teacher-ai/contracts";

export class CurriculumController {
  static getPresets(_req: Request, res: Response<CurriculumPresetsResponse>): void {
    const entries = CurriculumRegistry.getAllEntries();
    const presets: CurriculumPresetSummary[] = entries.map((entry) => ({
      id: entry.id,
      curriculumBoard: entry.curriculumBoard,
      grade: entry.grade,
      subject: entry.subject,
      topicName: entry.topicName,
      kannadaTopicName: entry.kannadaTopicName,
      textbook: {
        title: entry.textbook.title,
        edition: entry.textbook.edition,
        chapterNumber: entry.textbook.chapterNumber,
        chapterTitle: entry.textbook.chapterTitle,
        printedPages: entry.textbook.printedPages,
        publisher: entry.textbook.publisher,
      },
      verification: {
        status: entry.verification.status,
        disclaimer: entry.verification.disclaimer,
      },
      pedagogicalConstraints: {
        targetAge: entry.pedagogicalConstraints.targetAge,
        format: entry.pedagogicalConstraints.format,
        concepts: entry.pedagogicalConstraints.concepts,
      },
    }));

    res.status(200).json({ presets });
  }
}
