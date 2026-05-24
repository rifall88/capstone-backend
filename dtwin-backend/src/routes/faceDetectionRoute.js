import express from "express";
import {
  scanAndRecordFace,
} from "../controllers/faceDetectionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/face-detection", authenticate, scanAndRecordFace);
export default router;
