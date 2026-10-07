import { Router } from "express";
import { ClassController } from "../controllers/class.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", ClassController.getClasses);
router.post("/", ClassController.createClass);
router.get("/:classId", ClassController.getClassById);
router.patch("/:classId", ClassController.updateClass);
router.post("/:classId/archive", ClassController.archiveClass);

export default router;
