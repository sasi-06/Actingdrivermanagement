// Driver controller - Fixed for new schema
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Get driver profile
exports.getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.userId })
      .populate('user', 'name email phone');

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    res.json({ driver });
  } catch (error) {
    console.error('Get driver profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update driver availability
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const driver = await Driver.findOne({ user: req.userId });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.isAvailable = isAvailable;
    await driver.save();

    res.json({
      message: 'Availability updated successfully',
      isAvailable
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update driver location
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const driver = await Driver.findOne({ user: req.userId });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.currentLocation = { lat, lng };
    await driver.save();

    res.json({
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get new booking requests - FIXED
exports.getNewRequests = async (req, res) => {
  try {
    console.log('Getting new requests for driver:', req.userId);
    
    const driver = await Driver.findOne({ user: req.userId });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    console.log('Driver details:', {
      id: driver._id,
      isAvailable: driver.isAvailable,
      vehicleType: driver.vehicleType,
      vehicleTypes: driver.vehicleTypes,
      primaryVehicle: driver.primaryVehicle,
      isApproved: driver.isApproved
    });

    // Check if driver is available
    if (!driver.isAvailable) {
      return res.json({ 
        bookings: [],
        message: 'You must be available to see new requests' 
      });
    }

    // Get driver's vehicle types - handle both old and new schema
    let driverVehicleTypes = [];
    if (driver.vehicleTypes && driver.vehicleTypes.length > 0) {
      driverVehicleTypes = driver.vehicleTypes.map(v => v.toLowerCase());
    } else if (driver.vehicleType) {
      // Fallback for old schema
      driverVehicleTypes = [driver.vehicleType.toLowerCase()];
    } else if (driver.primaryVehicle) {
      driverVehicleTypes = [driver.primaryVehicle.toLowerCase()];
    }

    console.log('Driver vehicle types:', driverVehicleTypes);

    // Get broadcasted bookings
    let query = {
      status: 'BROADCASTED',
      driver: null,
      scheduledTime: { $gte: new Date() }
    };

    // Only filter by vehicle type if driver has vehicle types
    if (driverVehicleTypes.length > 0) {
      query.vehicleType = { $in: driverVehicleTypes };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name phone email')
      .sort('-createdAt')
      .limit(20); // Limit results

    console.log(`Found ${bookings.length} bookings for driver`);

    res.json({ bookings });
  } catch (error) {
    console.error('Get new requests error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Accept booking
exports.acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    console.log('Driver accepting booking:', bookingId);

    // Get driver
    const driver = await Driver.findOne({ user: req.userId });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Check if driver already has an active booking
    const activeBooking = await Booking.findOne({
      driver: driver._id,
      status: { $in: ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'] }
    });

    if (activeBooking) {
      return res.status(400).json({ message: 'You already have an active booking' });
    }

    // Get booking and check if it's still available
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'BROADCASTED') {
      return res.status(400).json({ message: 'Booking is no longer available' });
    }

    // Accept the booking
    booking.driver = driver._id;
    booking.status = 'ACCEPTED';
    await booking.save();

    // Populate booking details
    await booking.populate('user', 'name phone email');

    // Notify user via socket
    const io = req.app.get('io');
    if (io) {
      io.emit(`booking_accepted_${booking.user._id}`, {
        bookingId: booking._id,
        driver: {
          id: driver._id,
          name: driver.user.name,
          phone: driver.user.phone,
          vehicleType: booking.vehicleType,
          vehicleNumber: driver.vehicleNumber,
          rating: driver.rating
        }
      });
    }

    res.json({
      message: 'Booking accepted successfully',
      booking
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get driver's accepted bookings
exports.getAcceptedBookings = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.userId });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const bookings = await Booking.find({
      driver: driver._id,
      status: { $in: ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'] }
    })
    .populate('user', 'name phone email')
    .sort('-createdAt');

    res.json({ bookings });
  } catch (error) {
    console.error('Get accepted bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start trip
exports.startTrip = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify driver
    const driver = await Driver.findOne({ user: req.userId });
    if (!driver || booking.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = 'IN_PROGRESS';
    booking.startTime = new Date();
    await booking.save();

    // Notify user
    const io = req.app.get('io');
    if (io) {
      io.emit(`trip_started_${booking.user}`, {
        bookingId: booking._id,
        startTime: booking.startTime
      });
    }

    res.json({
      message: 'Trip started successfully',
      booking
    });
  } catch (error) {
    console.error('Start trip error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete trip
exports.completeTrip = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify driver
    const driver = await Driver.findOne({ user: req.userId });
    if (!driver || booking.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = 'COMPLETED';
    booking.endTime = new Date();
    
    // Calculate fare (basic calculation - can be enhanced)
    const distance = 10; // This should be calculated based on actual distance
    const baseFare = 50;
    const perKmRate = 15;
    booking.fare = baseFare + (distance * perKmRate);
    
    await booking.save();

    // Update driver stats
    driver.totalTrips += 1;
    await driver.save();

    // Notify user
    const io = req.app.get('io');
    if (io) {
      io.emit(`trip_completed_${booking.user}`, {
        bookingId: booking._id,
        endTime: booking.endTime,
        fare: booking.fare
      });
    }

    res.json({
      message: 'Trip completed successfully',
      booking
    });
  } catch (error) {
    console.error('Complete trip error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get driver history
exports.getDriverHistory = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.userId });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const bookings = await Booking.find({
      driver: driver._id,
      status: { $in: ['COMPLETED', 'RATED', 'CANCELLED'] }
    })
    .populate('user', 'name phone')
    .sort('-createdAt');

    res.json({ bookings });
  } catch (error) {
    console.error('Get driver history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
