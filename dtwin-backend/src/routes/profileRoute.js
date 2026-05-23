import express from "express";
import multer from "multer";
import {
  putProfile,
  getUserProfile,
} from "../controllers/profileController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads"),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });
const router = express.Router();

router.put("/", upload.single("profile_image"), authenticate, putProfile);
router.get("/", authenticate, getUserProfile);

export default router;
