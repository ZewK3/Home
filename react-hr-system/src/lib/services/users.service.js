// Users Service
import { apiClient } from '../apiClient.js';

export const usersService = {
  // Get all users with optional filtering
  async list(params = {}) {
    try {
      const response = await apiClient.get('/users', params);
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }
};