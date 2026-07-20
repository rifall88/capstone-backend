import express from "express";
import {
  forgotPassword,
  resetPassword,
  verifyForgotPasswordOTP,
} from "../controllers/passwordResetController.js";
import {
  forgotPasswordValidation,
  verifyForgotOtpValidation,
  resetPasswordValidation,
} from "../validations/passwordResetValidation.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/", validateRequest(forgotPasswordValidation), forgotPassword);
router.post(
  "/verify-otp",
  validateRequest(verifyForgotOtpValidation),
  verifyForgotPasswordOTP,
);
router.post(
  "/reset-password",
  validateRequest(resetPasswordValidation),
  resetPassword,
);

export default router;
