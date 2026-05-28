import express from "express";
import { scanAndRecordFace } from "../controllers/faceDetectionController.js";
import { scanFaceValidation } from "../validations/faceDetectionValidation.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/face-detection",
  authenticate,
  validateRequest(scanFaceValidation),
  scanAndRecordFace,
);
export default router;
