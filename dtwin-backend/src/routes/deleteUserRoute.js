import express from "express";
import {
  requestDeleteAccount,
  confirmDeleteAccount,
  softDelete,
} from "../controllers/deleteUserController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.post("/request-delete", authenticate, requestDeleteAccount);
router.post("/verify-delete", authenticate, confirmDeleteAccount);
router.delete("/:id", authenticate, isAdmin, softDelete);

export default router;
