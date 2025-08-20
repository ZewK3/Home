// Dashboard Service
import { apiClient } from '../apiClient.js';

export const dashboardService = {
  // Get dashboard statistics
  async getStats() {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }
};