import express from "express";
import {
  login,
  googleLogin,
  refresh,
  deletetkn,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", login);
router.post("/google-login", googleLogin);
router.put("/", refresh);
router.delete("/", authenticate, deletetkn);

export default router;
