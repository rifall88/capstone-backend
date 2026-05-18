import express from "express";
import { register, verifyOTP } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", register);
router.post("/verify-otp", verifyOTP);

export default router;
