const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

// Validation rules
const userValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits')
];

// Driver validation - more flexible
const driverValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
  body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
  body('vehicleModel').trim().notEmpty().withMessage('Vehicle model is required'),
  // Make vehicle type fields optional since we handle them in controller
  body('vehicleType').optional(),
  body('vehicleTypes').optional(),
  body('primaryVehicle').optional()
];

// Routes
router.post('/register/user', userValidation, authController.registerUser);
router.post('/register/driver', driverValidation, authController.registerDriver);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
