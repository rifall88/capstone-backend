import express from "express";
import {
  faceDetectionAnalytic,
  dailyLogAnalytic,
  updateDailyLogAnalytic,
  getLatestPrediction,
  getDailySummary,
  getDailyLogs,
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
  validateRequest(dailyLogParamsValidation, "params"),
  validateRequest(dailyLogBodyValidation, "body"),
  updateDailyLogAnalytic,
);
router.get("/latest-prediction", authenticate, getLatestPrediction);
router.get("/daily-summary", authenticate, getDailySummary);
router.get("/daily-logs", authenticate, getDailyLogs);
export default router;
