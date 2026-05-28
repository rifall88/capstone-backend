import Joi from "joi";

export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email cannot be empty",
    "string.email": "Please provide a valid email format",
    "any.required": "Email is required",
  }),
});

export const verifyForgotOtpValidation = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email cannot be empty",
    "string.email": "Please provide a valid email format",
    "any.required": "Email is required",
  }),

  code: Joi.string()
    .trim()
    .max(10)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.empty": "OTP code cannot be empty",
      "string.max": "OTP code must be at most 10 characters",
      "string.pattern.base": "OTP code can only contain numbers",
      "any.required": "OTP code is required",
    }),
});

export const resetPasswordValidation = Joi.object({
  token: Joi.string().trim().guid({ version: "uuidv4" }).required().messages({
    "string.empty": "Token cannot be empty",
    "string.guid": "Invalid reset token format",
    "any.required": "Reset token is required",
  }),

  newPassword: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/)
    .required()
    .messages({
      "string.empty": "New password cannot be empty",
      "string.min": "New password must be at least 8 characters long",
      "string.max": "New password must be at most 100 characters long",
      "string.pattern.base":
        "New password must contain at least one uppercase letter, one number, and one unique character (e.g., #, @, !)",
      "any.required": "New password is required",
    }),
});
