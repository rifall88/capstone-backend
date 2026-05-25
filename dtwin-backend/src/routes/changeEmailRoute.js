import express from "express";
import {
  updateEmail,
  verifyOTP,
} from "../controllers/changeEmailController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, updateEmail);
router.post("/verify-otp", authenticate, verifyOTP);

export default router;
