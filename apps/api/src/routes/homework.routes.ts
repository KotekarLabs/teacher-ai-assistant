import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { HomeworkController } from "../controllers/homework.controller";

const router = Router();

router.use(requireAuth);

router.post("/generate", HomeworkController.generate);
router.get("/", HomeworkController.list);
router.get("/:homeworkId", HomeworkController.getById);
router.get("/:homeworkId/export/pdf", HomeworkController.exportPdf);
router.patch("/:homeworkId", HomeworkController.update);
router.post("/:homeworkId/archive", HomeworkController.archive);

export { router as homeworkRouter };
export default router;
