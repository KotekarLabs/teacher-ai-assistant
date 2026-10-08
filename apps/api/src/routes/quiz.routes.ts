import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { QuizController } from "../controllers/quiz.controller";

const router = Router();

router.use(requireAuth);

router.post("/generate", QuizController.generate);
router.get("/", QuizController.list);
router.get("/:quizId", QuizController.getById);
router.get("/:quizId/export/pdf", QuizController.exportPdf);
router.patch("/:quizId", QuizController.update);
router.post("/:quizId/archive", QuizController.archive);

export { router as quizRouter };
export default router;
