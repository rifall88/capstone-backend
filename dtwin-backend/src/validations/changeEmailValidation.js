import Joi from "joi";

export const updateEmailValidation = Joi.object({
  email: Joi.string().trim().email().max(100).required().messages({
    "string.empty": "Email cannot be empty",
    "string.email": "Please provide a valid email format",
    "string.max": "Email must be at most 100 characters long",
    "any.required": "Email is required",
  }),
});

export const verifyEmailOtpValidation = Joi.object({
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
