import express from "express";
import {
  updateEmail,
  verifyOTP,
} from "../controllers/changeEmailController.js";
import {
  updateEmailValidation,
  verifyEmailOtpValidation,
} from "../validations/changeEmailValidation.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  validateRequest(updateEmailValidation),
  updateEmail,
);
router.post(
  "/verify-otp",
  authenticate,
  validateRequest(verifyEmailOtpValidation),
  verifyOTP,
);

export default router;
