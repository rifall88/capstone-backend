import express from "express";
import {
  requestDeleteAccount,
  confirmDeleteAccount,
  softDelete,
} from "../controllers/deleteUserController.js";
import {
  confirmDeleteValidation,
  softDeleteValidation,
} from "../validations/deleteUserValidation.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/request-delete", authenticate, requestDeleteAccount);
router.post(
  "/verify-otp",
  authenticate,
  validateRequest(confirmDeleteValidation),
  confirmDeleteAccount,
);
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  validateRequest(softDeleteValidation),
  softDelete,
);

export default router;
