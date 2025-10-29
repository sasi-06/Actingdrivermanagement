// User routes - Updated
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Remove role restriction for profile route
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);

// User-specific routes
router.get('/history', authMiddleware, userController.getUserHistory);
router.get('/bookings/active', authMiddleware, userController.getActiveBookings); // Updated

module.exports = router;
