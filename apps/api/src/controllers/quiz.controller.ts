import type { Request, Response } from "express";
import {
  GenerateQuizRequestSchema,
  UpdateQuizRequestSchema,
} from "@teacher-ai/contracts";
import {
  QuizService,
  type ServiceError,
} from "../services/quiz.service";
import { ExportService } from "../services/export.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class QuizController {
  static async generate(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const parsed = GenerateQuizRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const quiz = await QuizService.generateQuiz(
        authReq.user!.id,
        parsed.data,
      );
      res.status(201).json({
        quiz: QuizService.formatQuizDTO(quiz),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to generate quiz",
      });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    try {
      const quizzes = await QuizService.getQuizzes(authReq.user!.id);
      res.status(200).json({
        quizzes: quizzes.map((q) =>
          QuizService.formatQuizDTO(q),
        ),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to retrieve quizzes",
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { quizId } = req.params;
    try {
      const quiz = await QuizService.getQuizById(
        authReq.user!.id,
        quizId,
      );
      if (!quiz) {
        res.status(404).json({ error: "Quiz not found" });
        return;
      }
      res.status(200).json({
        quiz: QuizService.formatQuizDTO(quiz),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to retrieve quiz",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { quizId } = req.params;
    const parsed = UpdateQuizRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
      return;
    }

    try {
      const quiz = await QuizService.updateQuiz(
        authReq.user!.id,
        quizId,
        parsed.data,
      );
      if (!quiz) {
        res.status(404).json({ error: "Quiz not found" });
        return;
      }
      res.status(200).json({
        quiz: QuizService.formatQuizDTO(quiz),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to update quiz",
      });
    }
  }

  static async archive(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { quizId } = req.params;
    try {
      const quiz = await QuizService.archiveQuiz(
        authReq.user!.id,
        quizId,
      );
      if (!quiz) {
        res.status(404).json({ error: "Quiz not found" });
        return;
      }
      res.status(200).json({
        message: "Quiz archived successfully",
        quiz: QuizService.formatQuizDTO(quiz),
      });
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to archive quiz",
      });
    }
  }

  static async exportPdf(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const { quizId } = req.params;
    const mode = (req.query.mode as string) || "student";

    try {
      const { buffer, filename } = await ExportService.exportQuizPdf(
        quizId,
        authReq.user!.id,
        mode,
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(buffer);
    } catch (err: unknown) {
      const sErr = err as ServiceError;
      const status = sErr.statusCode || 500;
      res.status(status).json({
        error: sErr.message || "Failed to export quiz PDF",
      });
    }
  }
}
