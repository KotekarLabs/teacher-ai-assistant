import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { ContentController } from "../controllers/content.controller";

const router = Router();

router.use(requireAuth);

router.get("/", ContentController.list);
router.get("/:contentId", ContentController.getById);
router.post("/:contentId/duplicate", ContentController.duplicate);
router.post("/:contentId/archive", ContentController.archive);

export const contentRouter = router;
