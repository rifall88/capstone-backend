import express from "express";
import {
  login,
  googleLogin,
  refresh,
  deletetkn,
} from "../controllers/authController.js";
import {
  loginValidation,
  googleLoginValidation,
  refreshTokenValidation,
} from "../validations/authValidation.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/", validateRequest(loginValidation), login);
router.post(
  "/google-login",
  validateRequest(googleLoginValidation),
  googleLogin,
);
router.put("/", validateRequest(refreshTokenValidation), refresh);
router.delete(
  "/",
  authenticate,
  validateRequest(refreshTokenValidation),
  deletetkn,
);

export default router;
