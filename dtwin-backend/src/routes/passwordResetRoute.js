import express from "express";
import {
  forgotPassword,
  resetPassword,
  verifyForgotPasswordOTP,
} from "../controllers/passwordResetController.js";

const router = express.Router();

router.post("/", forgotPassword);
router.post("/verify", verifyForgotPasswordOTP);
router.post("/reset", resetPassword);

export default router;
