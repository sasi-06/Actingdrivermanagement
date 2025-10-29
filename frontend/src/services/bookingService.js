// Booking service - Updated
import api from './api';

export const bookingService = {
  // Create booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  
  rateBooking: async (bookingId, rating, feedback) => {
    const response = await api.post(`/bookings/${bookingId}/rate`, {
      rating,
      feedback
    });
    return response.data;
  },

  // Get user's active bookings (multiple)
  getActiveBookings: async () => {
    const response = await api.get('/users/bookings/active');
    return response.data;
  },

  // Get user bookings
  getUserBookings: async () => {
    const response = await api.get('/bookings/user');
    return response.data;
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Rate booking
  rateBooking: async (bookingId, rating, feedback) => {
    const response = await api.post(`/bookings/${bookingId}/rate`, {
      rating,
      feedback
    });
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    const response = await api.post(`/bookings/${bookingId}/cancel`, {
      reason
    });
    return response.data;
  },

  // Get user history
  getUserHistory: async () => {
    const response = await api.get('/users/history');
    return response.data;
  },

  // Driver services
  getNewRequests: async () => {
    const response = await api.get('/drivers/requests/new');
    return response.data;
  },

  acceptBooking: async (bookingId) => {
    const response = await api.post(`/drivers/bookings/${bookingId}/accept`);
    return response.data;
  },

  getAcceptedBookings: async () => {
    const response = await api.get('/drivers/bookings/accepted');
    return response.data;
  },

  startTrip: async (bookingId) => {
    const response = await api.post(`/drivers/bookings/${bookingId}/start`);
    return response.data;
  },

  completeTrip: async (bookingId) => {
    const response = await api.post(`/drivers/bookings/${bookingId}/complete`);
    return response.data;
  },

  getDriverHistory: async () => {
    const response = await api.get('/drivers/history');
    return response.data;
  },

  // Admin services
  getAllBookings: async () => {
    const response = await api.get('/admin/bookings');
    return response.data;
  },

  adminCancelBooking: async (bookingId, reason) => {
    const response = await api.post(`/admin/bookings/${bookingId}/cancel`, {
      reason
    });
    return response.data;
  }
};
