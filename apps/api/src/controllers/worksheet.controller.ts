import type { Request, Response } from "express";
import {
  GenerateWorksheetRequestSchema,
  UpdateWorksheetRequestSchema,
} from "@teacher-ai/contracts";
import {
  WorksheetService,
  type ServiceError,
} from "../services/worksheet.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class WorksheetController {
  static async generate(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const parsed = GenerateWorksheetRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const worksheet = await WorksheetService.generateWorksheet(
        authReq.user!.id,
        parsed.data,
      );
      res.status(201).json({
        worksheet: WorksheetService.formatWorksheetDTO(worksheet),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to generate worksheet",
      });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    try {
      const worksheets = await WorksheetService.getWorksheets(authReq.user!.id);
      res.status(200).json({
        worksheets: worksheets.map((w) =>
          WorksheetService.formatWorksheetDTO(w),
        ),
      });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({
        error: error.message || "Failed to retrieve worksheets",
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { worksheetId } = req.params;
    try {
      const worksheet = await WorksheetService.getWorksheetById(
        authReq.user!.id,
        worksheetId,
      );
      if (!worksheet) {
        res.status(404).json({ error: "Worksheet not found" });
        return;
      }
      res.status(200).json({
        worksheet: WorksheetService.formatWorksheetDTO(worksheet),
      });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({
        error: error.message || "Failed to retrieve worksheet",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { worksheetId } = req.params;
    const parsed = UpdateWorksheetRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const worksheet = await WorksheetService.updateWorksheet(
        authReq.user!.id,
        worksheetId,
        parsed.data,
      );
      if (!worksheet) {
        res.status(404).json({ error: "Worksheet not found" });
        return;
      }
      res.status(200).json({
        worksheet: WorksheetService.formatWorksheetDTO(worksheet),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to update worksheet",
      });
    }
  }

  static async archive(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { worksheetId } = req.params;
    try {
      const worksheet = await WorksheetService.archiveWorksheet(
        authReq.user!.id,
        worksheetId,
      );
      if (!worksheet) {
        res.status(404).json({ error: "Worksheet not found" });
        return;
      }
      res.status(200).json({
        message: "Worksheet archived successfully",
        worksheet: WorksheetService.formatWorksheetDTO(worksheet),
      });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({
        error: error.message || "Failed to archive worksheet",
      });
    }
  }
}
