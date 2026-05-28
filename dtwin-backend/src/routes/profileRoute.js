import express from "express";
import multer from "multer";
import {
  putProfile,
  getUserProfile,
  getAllUser,
  getPhotoProfile,
} from "../controllers/profileController.js";
import { updateProfileValidation } from "../validations/profileValidation.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads"),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Incorrect format! File is required to be an image (JPEG, PNG, or WebP)",
        ),
        false,
      );
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});
const router = express.Router();

router.put(
  "/",
  authenticate,
  (req, res, next) => {
    upload.single("profile_image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          status: "failed",
          message: err.message,
        });
      }
      next();
    });
  },
  validateRequest(updateProfileValidation),
  putProfile,
);
router.get("/", authenticate, getUserProfile);
router.get("/photo-profile", authenticate, getPhotoProfile);
router.get("/all", authenticate, isAdmin, getAllUser);

export default router;
