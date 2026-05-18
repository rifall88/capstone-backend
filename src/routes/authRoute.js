import express from "express";
import { login, refresh, deletetkn } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", login);
router.put("/", refresh);
router.delete("/", authenticate, deletetkn);

export default router;
