import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { WorksheetController } from "../controllers/worksheet.controller";

const router = Router();

router.use(requireAuth);

router.post("/generate", WorksheetController.generate);
router.get("/", WorksheetController.list);
router.get("/:worksheetId", WorksheetController.getById);
router.patch("/:worksheetId", WorksheetController.update);
router.post("/:worksheetId/archive", WorksheetController.archive);

export { router as worksheetRouter };
export default router;
