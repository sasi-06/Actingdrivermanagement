// Booking model schema - Updated
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    placeId: String // For Google Maps
  },
  dropLocation: {
    address: {
      type: String,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    placeId: String // For Google Maps
  },
  vehicleType: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['REQUESTED', 'BROADCASTED', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'RATED', 'CANCELLED'],
    default: 'REQUESTED'
  },
  fare: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number, // in kilometers
    default: 0
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  startTime: Date,
  endTime: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ status: 1, scheduledTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
