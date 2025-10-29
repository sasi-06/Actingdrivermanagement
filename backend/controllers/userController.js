// User controller
const User = require('../models/User');
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');

// Get user profile - works for all roles
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is a driver, include driver details
    let driverDetails = null;
    if (user.role === 'driver') {
      driverDetails = await Driver.findOne({ user: req.userId });
    }

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        driverDetails: driverDetails
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile - works for all roles
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user booking history - only for 'user' role
exports.getUserHistory = async (req, res) => {
  try {
    // Check if user has 'user' role
    if (req.userRole !== 'user') {
      return res.status(403).json({ message: 'Access denied. User role required.' });
    }

    const bookings = await Booking.find({
      user: req.userId,
      status: { $in: ['COMPLETED', 'RATED', 'CANCELLED'] }
    })
    .populate({
      path: 'driver',
      populate: {
        path: 'user',
        select: 'name phone'
      }
    })
    .sort('-createdAt');

    res.json({ bookings });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active bookings (plural) - updated for multiple bookings
exports.getActiveBookings = async (req, res) => {
  try {
    // Check if user has 'user' role
    if (req.userRole !== 'user') {
      return res.status(403).json({ message: 'Access denied. User role required.' });
    }

    const bookings = await Booking.find({
      user: req.userId,
      status: { $in: ['REQUESTED', 'BROADCASTED', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'] }
    })
    .populate({
      path: 'driver',
      populate: {
        path: 'user',
        select: 'name phone'
      }
    })
    .sort('-createdAt');

    res.json({ bookings });
  } catch (error) {
    console.error('Get active bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

