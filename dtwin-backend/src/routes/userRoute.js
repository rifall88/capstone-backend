import express from "express";
import { register, verifyOTP } from "../controllers/userController.js";
import {
  registerValidation,
  verifyOtpValidation,
} from "../validations/userValidation.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/", validateRequest(registerValidation), register);
router.post("/verify-otp", validateRequest(verifyOtpValidation), verifyOTP);

export default router;
