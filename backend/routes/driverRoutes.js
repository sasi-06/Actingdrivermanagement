// Driver routes
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Debug middleware
router.use((req, res, next) => {
  console.log('Driver route accessed:', req.method, req.path);
  next();
});

// All driver routes require authentication and driver role
router.use(authMiddleware, roleMiddleware('driver'));

// Routes
router.get('/profile', driverController.getDriverProfile);
router.put('/availability', driverController.updateAvailability);
router.put('/location', driverController.updateLocation);
router.get('/requests/new', driverController.getNewRequests);
router.post('/bookings/:id/accept', driverController.acceptBooking);
router.get('/bookings/accepted', driverController.getAcceptedBookings);
router.post('/bookings/:id/start', driverController.startTrip);
router.post('/bookings/:id/complete', driverController.completeTrip);
router.get('/history', driverController.getDriverHistory);

module.exports = router;
