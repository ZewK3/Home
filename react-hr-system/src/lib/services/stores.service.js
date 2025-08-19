// Stores Service
import { apiClient } from '../apiClient.js';

export const storesService = {
  // Get all stores with optional filtering
  async list(params = {}) {
    try {
      const response = await apiClient.get('/stores', params);
      return response.data;
    } catch (error) {
      console.error('Get stores error:', error);
      throw error;
    }
  }
};