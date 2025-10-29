// Custom validation utilities
const { body, validationResult } = require('express-validator');

// Custom validation middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Custom validators
exports.isValidCoordinate = (value) => {
  return !isNaN(value) && isFinite(value);
};

exports.isFutureDate = (value) => {
  return new Date(value) > new Date();
};

exports.isValidPhoneNumber = (value) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(value);
};
