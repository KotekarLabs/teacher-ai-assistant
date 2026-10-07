import { Router } from "express";
import {
  getProfile,
  createProfile,
  updateProfile,
} from "../controllers/teacher.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/profile", getProfile);
router.post("/profile", createProfile);
router.patch("/profile", updateProfile);

export default router;
