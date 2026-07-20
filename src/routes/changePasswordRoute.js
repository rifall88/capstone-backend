import express from "express";
import { updatePassword } from "../controllers/changePasswordController.js";
import { updatePasswordValidation } from "../validations/changePasswordValidation.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.put(
  "/",
  authenticate,
  validateRequest(updatePasswordValidation),
  updatePassword,
);

export default router;
