const { validationResult } = require("express-validator");

/**
 * Runs after express-validator checks; short-circuits with a 400 and a
 * clear list of field errors if any validation failed.
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validateRequest;
