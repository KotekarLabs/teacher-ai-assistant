import { Request, Response } from "express";
import {
  CreateClassSchema,
  UpdateClassSchema,
} from "@teacher-ai/contracts";
import { ClassService } from "../services/class.service";

export class ClassController {
  static async getClasses(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const classes = await ClassService.getClasses(teacherId, false);
      return res.status(200).json({ classes });
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getClassById(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { classId } = req.params;
      const classItem = await ClassService.getClassById(teacherId, classId);
      if (!classItem) {
        return res.status(404).json({ error: "Class not found" });
      }

      return res.status(200).json({ class: classItem });
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async createClass(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const parseResult = CreateClassSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: parseResult.error.issues[0]?.message || "Invalid input",
        });
      }

      const newClass = await ClassService.createClass(
        teacherId,
        parseResult.data,
      );
      return res.status(201).json({ class: newClass });
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async updateClass(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { classId } = req.params;
      const parseResult = UpdateClassSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: parseResult.error.issues[0]?.message || "Invalid input",
        });
      }

      const updatedClass = await ClassService.updateClass(
        teacherId,
        classId,
        parseResult.data,
      );
      if (!updatedClass) {
        return res.status(404).json({ error: "Class not found" });
      }

      return res.status(200).json({ class: updatedClass });
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async archiveClass(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { classId } = req.params;
      const archivedClass = await ClassService.archiveClass(teacherId, classId);
      if (!archivedClass) {
        return res.status(404).json({ error: "Class not found" });
      }

      return res.status(200).json({ class: archivedClass });
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
