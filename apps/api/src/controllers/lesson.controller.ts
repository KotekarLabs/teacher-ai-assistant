import type { Request, Response } from "express";
import {
  GenerateLessonRequestSchema,
  UpdateLessonRequestSchema,
} from "@teacher-ai/contracts";
import { LessonService, type ServiceError } from "../services/lesson.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class LessonController {
  static async generate(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const parsed = GenerateLessonRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const lesson = await LessonService.generateLesson(
        authReq.user!.id,
        parsed.data,
      );
      res.status(201).json({ lesson });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to generate lesson",
      });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    try {
      const lessons = await LessonService.getLessons(authReq.user!.id);
      res.status(200).json({ lessons });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({
        error: error.message || "Failed to retrieve lessons",
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { lessonId } = req.params;
    try {
      const lesson = await LessonService.getLessonById(
        authReq.user!.id,
        lessonId,
      );
      if (!lesson) {
        res.status(404).json({ error: "Lesson not found" });
        return;
      }
      res.status(200).json({ lesson });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({
        error: error.message || "Failed to retrieve lesson",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { lessonId } = req.params;
    const parsed = UpdateLessonRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const lesson = await LessonService.updateLesson(
        authReq.user!.id,
        lessonId,
        parsed.data,
      );
      if (!lesson) {
        res.status(404).json({ error: "Lesson not found" });
        return;
      }
      res.status(200).json({ lesson });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to update lesson",
      });
    }
  }

  static async archive(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { lessonId } = req.params;
    try {
      const lesson = await LessonService.archiveLesson(
        authReq.user!.id,
        lessonId,
      );
      if (!lesson) {
        res.status(404).json({ error: "Lesson not found" });
        return;
      }
      res.status(200).json({ message: "Lesson archived successfully", lesson });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({
        error: error.message || "Failed to archive lesson",
      });
    }
  }

  static async regenerate(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { lessonId } = req.params;
    const teacherInstructions = req.body?.teacherInstructions as string | undefined;

    try {
      const lesson = await LessonService.regenerateLesson(
        authReq.user!.id,
        lessonId,
        teacherInstructions,
      );
      if (!lesson) {
        res.status(404).json({ error: "Lesson not found" });
        return;
      }
      res.status(200).json({ lesson });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to regenerate lesson",
      });
    }
  }
}
