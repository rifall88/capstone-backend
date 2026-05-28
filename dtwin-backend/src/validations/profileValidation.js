import Joi from "joi";

export const updateProfileValidation = Joi.object({
  full_name: Joi.string().trim().min(8).max(255).allow("").optional().messages({
    "string.empty": "Full name cannot be empty or just spaces",
    "string.min": "Full name must be at least 8 characters long",
    "string.max": "Full name must be at most 255 characters long",
  }),

  phone: Joi.string()
    .trim()
    .min(11)
    .max(20)
    .pattern(/^[0-9]+$/)
    .allow("")
    .optional()
    .messages({
      "string.empty": "Phone number cannot be empty or just spaces",
      "string.min": "Phone number must be at least 1 characters long",
      "string.max": "Phone number must be at most 20 characters long",
      "string.pattern.base": "Phone number can only contain numbers",
    }),

  birth_date: Joi.date().iso().allow("").optional().messages({
    "date.format": "Please provide a valid birth date format (YYYY-MM-DD)",
    "date.base": "Birth date must be a valid date",
  }),

  gender: Joi.string().valid("male", "female").allow("").optional().messages({
    "any.only": "Please select a valid gender",
  }),

  profile_image: Joi.any().optional(),
});
