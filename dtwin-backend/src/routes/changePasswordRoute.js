import express from "express";
import { updatePassword } from "../controllers/changePasswordController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/", authenticate, updatePassword);

export default router;
