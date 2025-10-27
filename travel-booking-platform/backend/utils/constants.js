// Constants for the application
exports.VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan', icon: '🚗', capacity: 4 },
  { value: 'suv', label: 'SUV', icon: '🚙', capacity: 7 },
  { value: 'mini', label: 'Mini', icon: '🚗', capacity: 4 },
  { value: 'electric', label: 'Electric', icon: '🔋', capacity: 4 },
  { value: 'luxury', label: 'Luxury', icon: '💎', capacity: 4 },
  { value: 'van', label: 'Van', icon: '🚐', capacity: 8 },
  { value: 'minibus', label: 'Minibus', icon: '🚌', capacity: 15 },
  { value: 'pickup', label: 'Pickup Truck', icon: '🛻', capacity: 5 },
  { value: 'convertible', label: 'Convertible', icon: '🚗', capacity: 2 },
  { value: 'sports', label: 'Sports Car', icon: '🏎️', capacity: 2 },
  { value: 'limousine', label: 'Limousine', icon: '🚗', capacity: 8 },
  { value: 'hybrid', label: 'Hybrid', icon: '🔋', capacity: 4 },
  { value: 'wagon', label: 'Station Wagon', icon: '🚗', capacity: 5 },
  { value: 'hatchback', label: 'Hatchback', icon: '🚗', capacity: 4 },
  { value: 'coupe', label: 'Coupe', icon: '🚗', capacity: 2 },
  { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️', capacity: 2 },
  { value: 'rickshaw', label: 'Auto Rickshaw', icon: '🛺', capacity: 3 },
  { value: 'bicycle', label: 'Bicycle', icon: '🚲', capacity: 1 },
  { value: 'scooter', label: 'Scooter', icon: '🛵', capacity: 2 },
  { value: 'bus', label: 'Bus', icon: '🚌', capacity: 30 }
];

exports.BOOKING_STATUS = {
  REQUESTED: 'REQUESTED',
  BROADCASTED: 'BROADCASTED',
  ACCEPTED: 'ACCEPTED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  RATED: 'RATED',
  CANCELLED: 'CANCELLED'
};
