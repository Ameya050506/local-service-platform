import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['client', 'worker', 'admin']).withMessage('Invalid role'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const validateRequest = [
  body('service').trim().notEmpty().withMessage('Service name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').trim().notEmpty().withMessage('Date is required'),
  handleValidationErrors,
];

export const validateStatusUpdate = [
  body('status').isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
  handleValidationErrors,
];
