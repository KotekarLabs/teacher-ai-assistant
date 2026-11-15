import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { CurriculumController } from "../controllers/curriculum.controller";

const router = Router();

router.use(requireAuth);

router.get("/presets", CurriculumController.getPresets);

export const curriculumRouter = router;
