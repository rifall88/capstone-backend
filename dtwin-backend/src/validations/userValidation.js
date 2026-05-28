import Joi from "joi";

export const registerValidation = Joi.object({
  fullname: Joi.string().trim().min(8).max(255).required().messages({
    "string.empty": "Full name cannot be empty or just spaces",
    "string.min": "Full name must be at least 8 characters long",
    "string.max": "Full name must be at most 255 characters long",
    "any.required": "Full name is required",
  }),

  username: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Username cannot be empty or just spaces",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username must be at most 100 characters long",
    "any.required": "Username is required",
  }),

  email: Joi.string().trim().email().max(100).required().messages({
    "string.empty": "Email cannot be empty",
    "string.email": "Please provide a valid email format",
    "string.max": "Email must be at most 100 characters long",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/)
    .required()
    .messages({
      "string.empty": "Password cannot be empty",
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must be at most 100 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one number, and one unique character (e.g., #, @, !)",
      "any.required": "Password is required",
    }),

  role: Joi.string().valid("admin", "user").optional().messages({
    "any.only": 'Role must be either "admin" or "user"',
  }),
});

export const verifyOtpValidation = Joi.object({
  email: Joi.string().trim().email().max(100).required().messages({
    "string.empty": "Email cannot be empty",
    "string.email": "Please provide a valid email format",
    "string.max": "Email must be at most 100 characters long",
    "any.required": "Email is required",
  }),

  code: Joi.string().trim().max(10).required().messages({
    "string.empty": "OTP code cannot be empty",
    "string.max": "OTP code must be at most 10 characters",
    "any.required": "OTP code is required",
  }),
});
