// Booking controller
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const { validationResult } = require('express-validator');

// Create new booking
// Create new booking
// Create new booking
// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      pickupLocation,
      dropLocation,
      vehicleType,
      scheduledTime
    } = req.body;

    console.log('Creating booking with:', { vehicleType, pickupLocation: pickupLocation.address, dropLocation: dropLocation.address });

    // Create booking
    const booking = new Booking({
      user: req.userId,
      pickupLocation,
      dropLocation,
      vehicleType: vehicleType.toLowerCase(), // Store in lowercase
      scheduledTime: new Date(scheduledTime),
      status: 'REQUESTED'
    });

    await booking.save();
    
    // Populate user details
    await booking.populate('user', 'name phone email');

    // Update booking status to broadcasted
    booking.status = 'BROADCASTED';
    await booking.save();

    // Find all available drivers with matching vehicle type
    const availableDrivers = await Driver.find({
      isApproved: true,
      isAvailable: true,
      vehicleType: vehicleType.toLowerCase()
    }).populate('user', 'name email');

    console.log(`Found ${availableDrivers.length} available ${vehicleType} drivers`);

    // Get socket.io instance
    const io = req.app.get('io');
    if (io) {
      // Emit to all connected sockets
      const eventData = {
        bookingId: booking._id,
        pickupLocation: booking.pickupLocation,
        dropLocation: booking.dropLocation,
        vehicleType: booking.vehicleType,
        scheduledTime: booking.scheduledTime,
        user: {
          name: booking.user.name,
          phone: booking.user.phone
        }
      };
      
      io.emit('new_booking_request', eventData);
      console.log('Emitted new_booking_request event to all sockets');
      
      // Also emit to specific drivers if needed
      availableDrivers.forEach(driver => {
        io.emit(`new_booking_for_driver_${driver.user._id}`, eventData);
      });
    } else {
      console.error('Socket.IO instance not found');
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      broadcastedTo: availableDrivers.length
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate('driver', 'user vehicleType vehicleNumber')
      .populate('user', 'name phone')
      .sort('-createdAt');

    res.json({ bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name phone email')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has permission to view this booking
    if (req.userRole === 'user' && booking.user._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate booking
exports.rateBooking = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user owns this booking
    if (booking.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    // Update booking with rating
    booking.rating = {
      score: rating,
      feedback,
      ratedAt: new Date()
    };
    booking.status = 'RATED';
    await booking.save();

    // Update driver rating
    const driver = await Driver.findById(booking.driver);
    if (driver) {
      const totalRating = driver.rating * driver.totalRatings;
      driver.totalRatings += 1;
      driver.rating = (totalRating + rating) / driver.totalRatings;
      await driver.save();
    }

    res.json({
      message: 'Rating submitted successfully',
      booking
    });
  } catch (error) {
    console.error('Rate booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    if (req.userRole === 'user' && booking.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking can be cancelled
    if (['COMPLETED', 'CANCELLED', 'RATED'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    // Update booking status
    booking.status = 'CANCELLED';
    booking.cancelledBy = req.userId;
    booking.cancellationReason = reason;
    await booking.save();

        // Notify relevant parties via socket
    const io = req.app.get('io');
    if (io) {
      io.emit(`booking_cancelled_${bookingId}`, {
        bookingId,
        cancelledBy: req.userId,
        reason
      });
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
