import type { Request, Response } from "express";
import { GetContentQuerySchema } from "@teacher-ai/contracts";
import { ContentService, type ServiceError } from "../services/content.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class ContentController {
  static async list(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const parsed = GetContentQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const result = await ContentService.listContent(
        authReq.user!.id,
        parsed.data,
      );
      res.status(200).json(result);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({
        error: error.message || "Failed to retrieve library content",
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { contentId } = req.params;

    try {
      const content = await ContentService.getContentById(
        authReq.user!.id,
        contentId,
      );
      if (!content) {
        res.status(404).json({ error: "Content not found" });
        return;
      }
      res.status(200).json({ content });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({
        error: error.message || "Failed to retrieve content",
      });
    }
  }

  static async duplicate(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { contentId } = req.params;

    try {
      const content = await ContentService.duplicateContent(
        authReq.user!.id,
        contentId,
      );
      res.status(201).json({
        message: "Resource duplicated successfully",
        content,
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to duplicate resource",
      });
    }
  }

  static async archive(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { contentId } = req.params;

    try {
      const content = await ContentService.archiveContent(
        authReq.user!.id,
        contentId,
      );
      res.status(200).json({
        message: "Resource archived successfully",
        content,
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to archive resource",
      });
    }
  }
}
