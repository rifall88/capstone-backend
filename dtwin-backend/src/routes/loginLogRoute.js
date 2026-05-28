import express from "express";
import { viewLoginLogs } from "../controllers/loginLogController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", authenticate, isAdmin, viewLoginLogs);

export default router;
