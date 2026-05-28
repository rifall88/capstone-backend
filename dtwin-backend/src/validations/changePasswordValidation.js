import Joi from "joi";

export const updatePasswordValidation = Joi.object({
  oldPassword: Joi.string().required().messages({
    "string.empty": "Old password cannot be empty",
    "any.required": "Old password is required",
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
