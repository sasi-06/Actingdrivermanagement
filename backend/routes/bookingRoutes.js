// Booking routes - Updated validation
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { body, validationResult } = require('express-validator');

// More specific validation rules
const bookingValidation = [
  body('pickupLocation.address').notEmpty().withMessage('Pickup address is required'),
  body('pickupLocation.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid pickup latitude is required'),
  body('pickupLocation.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid pickup longitude is required'),
  body('dropLocation.address').notEmpty().withMessage('Drop address is required'),
  body('dropLocation.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid drop latitude is required'),
  body('dropLocation.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid drop longitude is required'),
  body('vehicleType').isIn(['sedan', 'suv', 'mini', 'electric', 'luxury', 'van', 'minibus', 'pickup', 'convertible', 'sports', 'limousine', 'hybrid', 'wagon', 'hatchback', 'coupe', 'motorcycle', 'rickshaw', 'bicycle', 'scooter', 'bus']).withMessage('Valid vehicle type is required'),
  body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      if (scheduledDate <= now) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    })
];

// Routes
router.post('/', authMiddleware, roleMiddleware('user'), bookingValidation, bookingController.createBooking);
router.get('/user', authMiddleware, roleMiddleware('user'), bookingController.getUserBookings);
router.get('/:id', authMiddleware, bookingController.getBookingDetails);
router.post('/:id/rate', authMiddleware, roleMiddleware('user'), bookingController.rateBooking);
router.post('/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;
