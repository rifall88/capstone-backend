export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return res.status(400).json({
        status: "failed",
        message: error.details[0].message,
      });
    }

    req.body = value;
    next();
  };
};
