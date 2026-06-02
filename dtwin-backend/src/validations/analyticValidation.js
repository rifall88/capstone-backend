import Joi from "joi";

export const scanFaceValidation = Joi.object({
  image_base64: Joi.string().trim().required().messages({
    "string.empty": "The image snapshot from the camera cannot be blank",
    "string.base": "Image data must be a valid text format",
    "any.required": "Image base64 data is required",
  }),
});
