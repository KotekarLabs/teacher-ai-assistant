import type { Request, Response } from "express";
import {
  GenerateHomeworkRequestSchema,
  UpdateHomeworkRequestSchema,
} from "@teacher-ai/contracts";
import {
  HomeworkService,
  type ServiceError,
} from "../services/homework.service";
import { ExportService } from "../services/export.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class HomeworkController {
  static async generate(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const parsed = GenerateHomeworkRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const homework = await HomeworkService.generateHomework(
        authReq.user!.id,
        parsed.data,
      );
      res.status(201).json({
        homework: HomeworkService.formatHomeworkDTO(homework),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to generate homework",
      });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    try {
      const homeworks = await HomeworkService.getHomeworks(authReq.user!.id);
      res.status(200).json({
        homeworks: homeworks.map((h) =>
          HomeworkService.formatHomeworkDTO(h),
        ),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to retrieve homeworks",
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { homeworkId } = req.params;
    try {
      const homework = await HomeworkService.getHomeworkById(
        authReq.user!.id,
        homeworkId,
      );
      if (!homework) {
        res.status(404).json({ error: "Homework not found" });
        return;
      }
      res.status(200).json({
        homework: HomeworkService.formatHomeworkDTO(homework),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to retrieve homework",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { homeworkId } = req.params;
    const parsed = UpdateHomeworkRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const homework = await HomeworkService.updateHomework(
        authReq.user!.id,
        homeworkId,
        parsed.data,
      );
      if (!homework) {
        res.status(404).json({ error: "Homework not found" });
        return;
      }
      res.status(200).json({
        homework: HomeworkService.formatHomeworkDTO(homework),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to update homework",
      });
    }
  }

  static async archive(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { homeworkId } = req.params;
    try {
      const homework = await HomeworkService.archiveHomework(
        authReq.user!.id,
        homeworkId,
      );
      if (!homework) {
        res.status(404).json({ error: "Homework not found" });
        return;
      }
      res.status(200).json({
        message: "Homework archived successfully",
        homework: HomeworkService.formatHomeworkDTO(homework),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to archive homework",
      });
    }
  }

  static async exportPdf(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { homeworkId } = req.params;

    try {
      const { buffer, filename } = await ExportService.exportHomeworkPdf(
        homeworkId,
        authReq.user!.id,
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(buffer);
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to export homework PDF",
      });
    }
  }
}
