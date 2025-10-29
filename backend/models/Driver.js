const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true // Automatically convert to uppercase
  },
  vehicleType: {
    type: String,
    required: true,
    lowercase: true // Automatically convert to lowercase
  },
  vehicleTypes: [{
    type: String,
    lowercase: true
  }],
  primaryVehicle: {
    type: String,
    lowercase: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true // Automatically convert to uppercase
  },
  vehicleModel: {
    type: String,
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ vehicleNumber: 1 });
driverSchema.index({ user: 1 });

module.exports = mongoose.model('Driver', driverSchema);
