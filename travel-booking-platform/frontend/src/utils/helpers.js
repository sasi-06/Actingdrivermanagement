// Helper utility functions
import { format } from 'date-fns';
import { DATE_FORMAT } from './constants';

export const formatDate = (date) => {
  return format(new Date(date), DATE_FORMAT);
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance.toFixed(2);
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

export const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2)}`;
};

export const getStatusBadgeClass = (status) => {
  return `status-badge status-${status.toLowerCase()}`;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};
