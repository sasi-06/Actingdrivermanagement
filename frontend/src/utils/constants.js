// Application constants - Updated
export const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan', icon: '🚗', capacity: 4, basePrice: 10 },
  { value: 'suv', label: 'SUV', icon: '🚙', capacity: 7, basePrice: 15 },
  { value: 'mini', label: 'Mini', icon: '🚗', capacity: 4, basePrice: 8 },
  { value: 'electric', label: 'Electric', icon: '🔋', capacity: 4, basePrice: 12 },
  { value: 'luxury', label: 'Luxury', icon: '💎', capacity: 4, basePrice: 30 },
  { value: 'van', label: 'Van', icon: '🚐', capacity: 8, basePrice: 20 },
  { value: 'minibus', label: 'Minibus', icon: '🚌', capacity: 15, basePrice: 35 },
  { value: 'pickup', label: 'Pickup Truck', icon: '🛻', capacity: 5, basePrice: 18 },
  { value: 'convertible', label: 'Convertible', icon: '🚗', capacity: 2, basePrice: 25 },
  { value: 'sports', label: 'Sports Car', icon: '🏎️', capacity: 2, basePrice: 40 },
  { value: 'limousine', label: 'Limousine', icon: '🚗', capacity: 8, basePrice: 50 },
  { value: 'hybrid', label: 'Hybrid', icon: '🔋', capacity: 4, basePrice: 11 },
  { value: 'wagon', label: 'Station Wagon', icon: '🚗', capacity: 5, basePrice: 12 },
  { value: 'hatchback', label: 'Hatchback', icon: '🚗', capacity: 4, basePrice: 9 },
  { value: 'coupe', label: 'Coupe', icon: '🚗', capacity: 2, basePrice: 15 },
  { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️', capacity: 2, basePrice: 5 },
  { value: 'rickshaw', label: 'Auto Rickshaw', icon: '🛺', capacity: 3, basePrice: 6 },
  { value: 'bicycle', label: 'Bicycle', icon: '🚲', capacity: 1, basePrice: 3 },
  { value: 'scooter', label: 'Scooter', icon: '🛵', capacity: 2, basePrice: 4 },
  { value: 'bus', label: 'Bus', icon: '🚌', capacity: 30, basePrice: 60 }
];

export const BOOKING_STATUS = {
  REQUESTED: 'REQUESTED',
  BROADCASTED: 'BROADCASTED',
  ACCEPTED: 'ACCEPTED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  RATED: 'RATED',
  CANCELLED: 'CANCELLED'
};

export const STATUS_COLORS = {
  REQUESTED: '#FFA500',
  BROADCASTED: '#4169E1',
  ACCEPTED: '#32CD32',
  CONFIRMED: '#228B22',
  IN_PROGRESS: '#1E90FF',
  COMPLETED: '#008000',
  RATED: '#FFD700',
  CANCELLED: '#DC143C'
};

export const ROLE_ROUTES = {
  user: '/user',
  driver: '/driver',
  admin: '/admin'
};

export const DATE_FORMAT = 'MMM dd, yyyy hh:mm a';