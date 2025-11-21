const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Auth validation rules
const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  validate
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Message validation rules
const createMessageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('source')
    .optional()
    .isIn(['email', 'sms', 'social_media', 'messaging_app', 'website', 'browser_extension', 'other'])
    .withMessage('Invalid source type'),
  body('sender')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Sender must not exceed 500 characters'),
  body('meta')
    .optional()
    .isObject()
    .withMessage('Meta must be an object'),
  validate
];

// Admin validation rules
const addPhishingUrlValidation = [
  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({ require_protocol: true })
    .withMessage('Valid URL is required'),
  body('source')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Source must not exceed 255 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  validate
];

// Param validation
const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  validate
];

// Query validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
];

module.exports = {
  validate,
  signupValidation,
  loginValidation,
  createMessageValidation,
  addPhishingUrlValidation,
  idParamValidation,
  paginationValidation
};
