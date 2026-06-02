import Joi from "joi";

export const scanFaceValidation = Joi.object({
  image_base64: Joi.string().trim().required().messages({
    "string.empty": "The image snapshot from the camera cannot be blank",
    "string.base": "Image data must be a valid text format",
    "any.required": "Image base64 data is required",
  }),
});

export const dailyLogBodyValidation = Joi.object({
  sleep_duration: Joi.number().min(0).max(15).required().messages({
    "number.base": "Sleep duration must be a valid number",
    "number.min": "Sleep duration cannot be negative",
    "number.max": "Sleep duration cannot exceed 15 hours",
    "any.required": "Sleep duration is required",
  }),

  study_work_duration: Joi.number().min(0).max(18).required().messages({
    "number.base": "Study/work duration must be a valid number",
    "number.min": "Study/work duration cannot be negative",
    "number.max": "Study/work duration cannot exceed 18 hours",
    "any.required": "Study/work duration is required",
  }),

  exercise_duration: Joi.number().min(0).max(240).required().messages({
    "number.base": "Exercise duration must be a valid number",
    "number.min": "Exercise duration cannot be negative",
    "number.max": "Exercise duration cannot exceed 240 minutes (4 hours)",
    "any.required": "Exercise duration is required",
  }),

  downtime_duration: Joi.number().min(0).max(12).required().messages({
    "number.base": "Downtime duration must be a valid number",
    "number.min": "Downtime duration cannot be negative",
    "number.max": "Downtime duration cannot exceed 12 hours",
    "any.required": "Downtime duration is required",
  }),

  task_planned: Joi.number().integer().min(0).required().messages({
    "number.base": "Task planned must be a valid number",
    "number.integer": "Task planned must be a whole number",
    "number.min": "Task planned cannot be negative",
    "any.required": "Task planned is required",
  }),

  task_completed: Joi.number()
    .integer()
    .min(0)
    .max(Joi.ref("task_planned"))
    .required()
    .messages({
      "number.base": "Task completed must be a valid number",
      "number.integer": "Task completed must be a whole number",
      "number.min": "Task completed cannot be negative",
      "number.max": "Task completed cannot be greater than task planned",
      "any.required": "Task completed is required",
    }),
});

export const dailyLogParamsValidation = Joi.object({
  id: Joi.string().guid({ version: "uuidv4" }).required().messages({
    "string.empty": "Log ID parameter cannot be empty",
    "string.guid": "Log ID must be a valid UUID v4 format",
    "any.required": "Log ID parameter is required",
  }),
});
