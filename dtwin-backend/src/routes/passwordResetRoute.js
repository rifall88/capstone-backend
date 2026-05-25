import express from "express";
import {
  forgotPassword,
  resetPassword,
  verifyForgotPasswordOTP,
} from "../controllers/passwordResetController.js";

const router = express.Router();

router.post("/", forgotPassword);
router.post("/verify-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);

export default router;
