export const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: true,
    });

    if (error) {
      return res.status(400).json({
        status: "failed",
        message: error.details[0].message,
      });
    }

    req[source] = value;
    next();
  };
};
