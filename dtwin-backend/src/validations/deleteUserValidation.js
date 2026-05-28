import Joi from "joi";

export const confirmDeleteValidation = Joi.object({
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

export const softDeleteValidation = Joi.object({
  id: Joi.string().trim().guid({ version: "uuidv4" }).required().messages({
    "string.empty": "User ID cannot be empty",
    "string.guid": "Invalid User ID format",
    "any.required": "User ID parameter is required",
  }),
});
