import express from "express";
import {
  faceDetectionAnalytic,
  dailyLogAnalytic,
  updateDailyLogAnalytic,
} from "../controllers/analyticController.js";
import {
  scanFaceValidation,
  dailyLogBodyValidation,
  dailyLogParamsValidation,
} from "../validations/analyticValidation.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/face-detection",
  authenticate,
  validateRequest(scanFaceValidation),
  faceDetectionAnalytic,
);
router.post(
  "/predict",
  authenticate,
  validateRequest(dailyLogBodyValidation),
  dailyLogAnalytic,
);
router.put(
  "/predict/:id",
  authenticate,
  validateRequest(dailyLogParamsValidation),
  validateRequest(dailyLogBodyValidation),
  updateDailyLogAnalytic,
);
export default router;
