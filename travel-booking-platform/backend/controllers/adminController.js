const User = require('../models/User');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const emailService = require('../utils/emailService');
exports.getPendingDrivers = async (req, res) => {
try {
const drivers = await Driver.find({ isApproved: false })
.populate('user', 'name email phone')
.sort('-createdAt');
res.json({ drivers });
} catch (error) {
console.error('Get pending drivers error:', error);
res.status(500).json({ message: 'Server error' });
}
};
exports.approveDriver = async (req, res) => {
try {
const driverId = req.params.id;
const driver = await Driver.findById(driverId).populate('user');
if (!driver) {
return res.status(404).json({ message: 'Driver not found' });
}
driver.isApproved = true;
driver.approvedAt = new Date();
driver.approvedBy = req.userId;
await driver.save();
await emailService.notifyDriverApproval({
driverEmail: driver.user.email,
driverName: driver.user.name
});
res.json({
message: 'Driver approved successfully',
driver
});
} catch (error) {
console.error('Approve driver error:', error);
res.status(500).json({ message: 'Server error' });
}
};
exports.rejectDriver = async (req, res) => {
try {
const driverId = req.params.id;
const { reason } = req.body;
const driver = await Driver.findById(driverId).populate('user');
if (!driver) {
return res.status(404).json({ message: 'Driver not found' });
}
await Driver.deleteOne({ _id: driverId });
await User.deleteOne({ _id: driver.user._id });
res.json({
message: 'Driver application rejected',
reason
});
} catch (error) {
console.error('Reject driver error:', error);
res.status(500).json({ message: 'Server error' });
}
};
exports.getApprovedDrivers = async (req, res) => {
try {
const drivers = await Driver.find({ isApproved: true })
.populate('user', 'name email phone')
.sort('-approvedAt');
res.json({ drivers });
} catch (error) {
console.error('Get approved drivers error:', error);
res.status(500).json({ message: 'Server error' });
}
};
exports.getAllUsers = async (req, res) => {
try {
const users = await User.find({ role: 'user' })
.select('-password')
.sort('-createdAt');
res.json({ users });
} catch (error) {
console.error('Get all users error:', error);
res.status(500).json({ message: 'Server error' });
}
};
exports.getAllBookings = async (req, res) => {
try {
const bookings = await Booking.find()
.populate('user', 'name email phone')
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
console.error('Get all bookings error:', error);
res.status(500).json({ message: 'Server error' });
}
};
exports.getDashboardStats = async (req, res) => {
try {
const totalUsers = await User.countDocuments({ role: 'user' });
const totalDrivers = await Driver.countDocuments({ isApproved: true });
const pendingDrivers = await Driver.countDocuments({ isApproved: false });
const activeBookings = await Booking.countDocuments({
status: { $in: ['REQUESTED', 'BROADCASTED', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'] }
});
const completedBookings = await Booking.countDocuments({ status: 'COMPLETED' });
res.json({
stats: {
totalUsers,
totalDrivers,
pendingDrivers,
activeBookings,
completedBookings
}
});
} catch (error) {
console.error('Get dashboard stats error:', error);
res.status(500).json({ message: 'Server error' });
}
};
exports.cancelBooking = async (req, res) => {
try {
const bookingId = req.params.id;
const { reason } = req.body;
const booking = await Booking.findById(bookingId);
if (!booking) {
return res.status(404).json({ message: 'Booking not found' });
}
booking.status = 'CANCELLED';
booking.cancelledBy = req.userId;
booking.cancellationReason = `Admin: ${reason}`;
await booking.save();
const io = req.app.get('io');
if (io) {
io.emit(`booking_cancelled_${bookingId}`, {
bookingId,
cancelledBy: 'admin',
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
exports.getDriverStatsById = async (req, res) => {
try {
const { driverId } = req.params;
const driver = await Driver.findById(driverId);
if (!driver) {
return res.status(404).json({ message: 'Driver not found' });
}
const accepted = await Booking.countDocuments({ driver: driverId, status: 'ACCEPTED' });
const rejected = await Booking.countDocuments({ driver: driverId, status: 'REJECTED' });
const completed = await Booking.countDocuments({ driver: driverId, status: 'COMPLETED' });
const cancelled = await Booking.countDocuments({ driver: driverId, status: 'CANCELLED' });
res.json({
stats: {
accepted,
rejected,
completed,
cancelled,
joinedOn: driver.createdAt
}
});
} catch (error) {
console.error('Get driver stats error:', error);
res.status(500).json({ message: 'Server error' });
}
};
// Get stats for a single user
exports.getUserStatsById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalBookings = await Booking.countDocuments({ user: userId });
    const completed = await Booking.countDocuments({ user: userId, status: 'COMPLETED' });
    const cancelled = await Booking.countDocuments({ user: userId, status: 'CANCELLED' });

    res.json({
      stats: {
        totalBookings,
        completed,
        cancelled,
        registeredOn: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};