import express from "express";
import {
  faceDetectionAnalytic,
  dailyLogAnalytic,
} from "../controllers/analyticController.js";
import { scanFaceValidation } from "../validations/analyticValidation.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/face-detection",
  authenticate,
  validateRequest(scanFaceValidation),
  faceDetectionAnalytic,
);
router.post("/predict", authenticate, dailyLogAnalytic);
export default router;
