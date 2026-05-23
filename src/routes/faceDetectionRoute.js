import express from "express";
import {
  scanAndRecordFace,
  applyFaceDetectionToProfile,
} from "../controllers/faceDetectionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/face-detection", authenticate, scanAndRecordFace);
router.post("/apply-profile", authenticate, applyFaceDetectionToProfile);
export default router;
