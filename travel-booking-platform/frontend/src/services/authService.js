// Authentication service - Fixed
import api from './api';

export const authService = {
  // User login
  login: async (email, password, isAdmin = false) => {
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
    const response = await api.post(endpoint, { email, password });
    return response.data;
  },

  // User/Driver registration - Fixed
  register: async (userData, isDriver = false) => {
    const endpoint = isDriver ? '/auth/register/driver' : '/auth/register/user';
    const response = await api.post(endpoint, userData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  }
};
