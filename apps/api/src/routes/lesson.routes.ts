import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { LessonController } from "../controllers/lesson.controller";

const router = Router();

router.use(requireAuth);

router.post("/generate", LessonController.generate);
router.get("/", LessonController.list);
router.get("/:lessonId", LessonController.getById);
router.get("/:lessonId/export/pdf", LessonController.exportPdf);
router.patch("/:lessonId", LessonController.update);
router.post("/:lessonId/archive", LessonController.archive);
router.post("/:lessonId/regenerate", LessonController.regenerate);

export const lessonRouter = router;
