import { RequestHandler } from "express";
import { TeacherService } from "../services/teacher.service";
import {
  CreateTeacherProfileSchema,
  UpdateTeacherProfileSchema,
} from "@teacher-ai/contracts";

export const getProfile: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const profile = await TeacherService.getProfileByUserId(userId);
    if (!profile) {
      res.status(404).json({ error: "Teacher profile not found" });
      return;
    }
    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

export const createProfile: RequestHandler = async (req, res, next) => {
  try {
    const parsed = CreateTeacherProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }

    const userId = req.user!.id;
    const existing = await TeacherService.getProfileByUserId(userId);
    if (existing) {
      res.status(409).json({ error: "Teacher profile already exists" });
      return;
    }

    const profile = await TeacherService.createProfile(userId, parsed.data);
    res.status(201).json({ profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const parsed = UpdateTeacherProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }

    const userId = req.user!.id;
    const profile = await TeacherService.updateProfile(userId, parsed.data);
    if (!profile) {
      res.status(404).json({ error: "Teacher profile not found" });
      return;
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};
